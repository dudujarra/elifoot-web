/**
 * useAudioPreload — Intersection Observer-based audio preloading
 *
 * Attaches to a container ref and begins preloading the audio stems
 * for the associated subgenre when the element enters the viewport.
 * This avoids loading audio assets for views the user never scrolls to.
 *
 * Usage:
 *   const ref = useAudioPreload('progressive');
 *   <div ref={ref}>Match View</div>
 */
import { useRef, useEffect } from 'react';

const STEMS_BASE_PATH = '/audio/fase1';
const preloadedSubgenres = new Set();

/**
 * Preloads an audio stem by fetching it into the browser cache.
 * Does NOT decode — just ensures the network request is cached.
 */
async function preloadStem(subgenre) {
    if (!subgenre || preloadedSubgenres.has(subgenre)) return;
    preloadedSubgenres.add(subgenre);
    try {
        const url = `${STEMS_BASE_PATH}/${subgenre}/master.ogg`;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        console.log(`[AudioPreload] Prefetching ${subgenre}`);
    } catch {
        // Silent — prefetch is best-effort
    }
}

/**
 * Hook: returns a ref to attach to a DOM element.
 * When that element enters the viewport, begins preloading audio.
 *
 * @param {string} subgenre — audio subgenre to preload
 * @param {object} options — IntersectionObserver options
 * @returns {React.RefObject}
 */
export function useAudioPreload(subgenre, options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        if (!subgenre || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        preloadStem(subgenre);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '200px', threshold: 0, ...options }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [subgenre]);

    return ref;
}

/**
 * Utility: preload multiple subgenres at once (for eager loading).
 */
export function preloadAudioStems(subgenres) {
    subgenres.forEach(s => preloadStem(s));
}

export { preloadedSubgenres, STEMS_BASE_PATH };

// SPEC-190: First-time visitor landing intro screen
// Gated by localStorage `olefut_seen_intro` flag. Click any CTA = set flag + onEnter.
import logo from '../assets/olefut_logo.png';
import './LandingIntro.css';

export function LandingIntro({ onEnter }) {
    const handleEnter = () => {
        try {
            localStorage.setItem('olefut_seen_intro', '1');
        } catch (_e) { /* localStorage unavailable */ }
        if (onEnter) onEnter();
    };

    return (
        <div className="landing-intro">
            <header className="landing-hero">
                <img src={logo} alt="OléFUT" className="landing-logo" />
                <h1 className="landing-title">OléFUT</h1>
                <p className="landing-tagline">
                    Simulador de futebol brasileiro estilo SNES.
                    <br />
                    Gerencie. Conquiste. Construa seu legado.
                </p>
            </header>

            <section className="landing-features">
                <div className="landing-feature">
                    <strong>170 clubes reais</strong>
                    <span>Brasil &middot; Europa &middot; América do Sul</span>
                </div>
                <div className="landing-feature">
                    <strong>Engine determinística</strong>
                    <span>Match-engine ao vivo, narração lance a lance</span>
                </div>
                <div className="landing-feature">
                    <strong>100% offline</strong>
                    <span>Sem signup, sem cobrança, joga no navegador</span>
                </div>
            </section>

            <div className="landing-cta-row">
                <button
                    type="button"
                    className="landing-cta-primary"
                    onClick={handleEnter}
                >
                    Jogar agora
                </button>
                <button
                    type="button"
                    className="landing-cta-skip"
                    onClick={handleEnter}
                >
                    Pular intro
                </button>
            </div>

            <footer className="landing-footer">
                <a
                    href="https://github.com/dudujarra/olefut"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-github"
                >
                    GitHub &middot; MIT License
                </a>
            </footer>
        </div>
    );
}

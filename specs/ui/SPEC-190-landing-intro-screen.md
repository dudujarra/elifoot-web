# SPEC-190: Landing intro screen for first-time visitors

> **Bloco 3.4 Fase D part 3**. Site atual abre direto no jogo (StartView). Visitante novo cai sem contexto: "o que é isso?", "como joga?", "vou perder tempo?". Hero intro screen pra primeiro acesso converte visitante curioso em jogador, e funciona como landing para social shares.

---

## O que é

Componente React `LandingIntro` que renderiza ANTES do `StartView` quando localStorage flag `olefut_seen_intro` ausente. Mostra:
- Hero: logo + tagline curta
- 3 bullets do que é jogo (1 linha cada)
- 1 screenshot do match em ação (statico, no asset folder)
- CTA primário "Jogar agora" → set flag + render StartView
- Link secundário "Pular intro" (mesma ação, menor)
- Link sutil "GitHub" pro repo

Implementação minimalista. Sem rotas novas. Sem novo componente library. Reusa design tokens (Pixelify + verde estádio + CSS classes existentes).

**Por que não landing.html separado:**
- Mais arquivos = mais sync, mais bugs (404 estilo, font preload, etc)
- React component + localStorage flag = same SPA, zero rotas, zero deploy mudança
- Skippable em 1 click pra returning users (flag persiste)

**OUT of scope** (specs separadas/futuras):
- Vídeo trailer (SPEC-191 launch kit)
- Tour interativo das views (futuro)
- Tutorial avançado (já existe TutorialView)

---

## Input

### Arquivos a tocar
- `src/components/LandingIntro.jsx` — NEW componente
- `src/components/LandingIntro.css` — NEW estilo (ou inline tokens — preferir CSS file per Mandamento brutal #4)
- `src/App.jsx` — gate condicional antes do StartView
- `public/screenshots/match-hero.png` — NEW (ou reuso de og-image se aceitável)
- `tests/integration/spec-190-landing-intro.test.js` — NEW harness

### LocalStorage flag
- Key: `olefut_seen_intro`
- Value: `'1'` ou `'0'` (string)
- Lifetime: persistente; reset apenas via "Resetar tudo" do App

### Origem
- Site live abre direto no StartView (sem contexto)
- Brand v1.1: tokens em `docs/design-tokens.css`
- Logo: `src/assets/olefut_logo.png`

---

## Output esperado

### 1. `src/components/LandingIntro.jsx`

```jsx
import { useState } from 'react';
import logo from '../assets/olefut_logo.png';
import './LandingIntro.css';

export function LandingIntro({ onEnter }) {
    const handleEnter = () => {
        try {
            localStorage.setItem('olefut_seen_intro', '1');
        } catch (_e) { /* localStorage indisponível */ }
        onEnter();
    };

    return (
        <div className="landing-intro">
            <header className="landing-hero">
                <img src={logo} alt="OléFUT" className="landing-logo" />
                <h1 className="landing-title">OléFUT</h1>
                <p className="landing-tagline">
                    Simulador de futebol brasileiro estilo SNES.<br/>
                    Gerencie. Conquiste. Construa seu legado.
                </p>
            </header>

            <section className="landing-features">
                <div className="landing-feature">
                    <strong>170 clubes reais</strong>
                    <span>Brasil · Europa · América do Sul</span>
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
                <button className="landing-cta-primary" onClick={handleEnter}>
                    Jogar agora
                </button>
                <button className="landing-cta-skip" onClick={handleEnter}>
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
                    GitHub · MIT License
                </a>
            </footer>
        </div>
    );
}
```

### 2. `src/components/LandingIntro.css`

Mínimo, usar design tokens. Mobile-first, fluid. Sem inline styles.

### 3. `src/App.jsx` (edit)

Adicionar gate condicional. Pseudo:
```jsx
const [showIntro, setShowIntro] = useState(() => {
    try {
        return localStorage.getItem('olefut_seen_intro') !== '1';
    } catch {
        return true;
    }
});

if (showIntro) {
    return <LandingIntro onEnter={() => setShowIntro(false)} />;
}
// ... rest of App (StartView, etc)
```

### 4. Screenshot
- Caminho: `public/screenshots/match-hero.png` ou reuso de `public/og-image.png` (SPEC-188)
- Decisão padrão: NÃO incluir screenshot real neste PR. Hero é só logo + texto. Screenshot opcional addable posteriormente.

### 5. Harness

```javascript
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingIntro } from '../../src/components/LandingIntro';

describe('SPEC-190: LandingIntro', () => {
    test('renders title + tagline + 3 features + CTAs + github link', () => {
        const onEnter = vi.fn();
        render(<LandingIntro onEnter={onEnter} />);
        expect(screen.getByText('OléFUT')).toBeInTheDocument();
        expect(screen.getByText(/170 clubes reais/i)).toBeInTheDocument();
        expect(screen.getByText(/Engine determinística/i)).toBeInTheDocument();
        expect(screen.getByText(/100% offline/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Jogar agora/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Pular intro/i })).toBeInTheDocument();
        expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
    });

    test('clicking primary CTA sets localStorage flag + calls onEnter', () => {
        localStorage.removeItem('olefut_seen_intro');
        const onEnter = vi.fn();
        render(<LandingIntro onEnter={onEnter} />);
        fireEvent.click(screen.getByRole('button', { name: /Jogar agora/i }));
        expect(localStorage.getItem('olefut_seen_intro')).toBe('1');
        expect(onEnter).toHaveBeenCalledOnce();
    });

    test('skip button also sets flag (same handler)', () => {
        localStorage.removeItem('olefut_seen_intro');
        const onEnter = vi.fn();
        render(<LandingIntro onEnter={onEnter} />);
        fireEvent.click(screen.getByRole('button', { name: /Pular intro/i }));
        expect(localStorage.getItem('olefut_seen_intro')).toBe('1');
        expect(onEnter).toHaveBeenCalledOnce();
    });
});
```

E test estático em App.jsx:
```javascript
test('App.jsx gates LandingIntro behind olefut_seen_intro flag', () => {
    const src = fs.readFileSync(path.join(projectRoot, 'src/App.jsx'), 'utf-8');
    expect(src).toMatch(/LandingIntro/);
    expect(src).toMatch(/olefut_seen_intro/);
});
```

---

## Regras de validação

- [ ] `LandingIntro` renderiza em primeiro acesso (localStorage flag ausente)
- [ ] Click em qualquer CTA seta `olefut_seen_intro=1` e chama `onEnter`
- [ ] Returning users (flag presente) NÃO veem intro, vão direto pro StartView
- [ ] Zero inline styles (CSS classes apenas — Mandamento brutal #4)
- [ ] Mobile responsive (375px width sem overflow)
- [ ] GitHub link abre em new tab com `rel="noopener noreferrer"`
- [ ] Suite 1841 → 1846 (+5 SPEC-190)
- [ ] Build clean
- [ ] Lint 0 errors

---

## Forbidden

1. **Rotas novas** (react-router) — single SPA, gate por estado.
2. **Inline styles** (Mandamento brutal #4) — CSS classes ou design tokens.
3. **Emoji em código novo** (Mandamento brutal #3) — Phosphor icons opcional, sem emoji puro.
4. **Tracking pixels** ou analytics scripts dedicados (SPEC-189 já cobre, não duplicar).
5. **Bloquear returning users** — flag respeitada, intro pulável sempre.
6. **Vídeo/GIF auto-play** — mobile-hostile, bandwidth-hostile.
7. **Botão "Comprar"/"Premium"** — jogo é free per design.

---

## Dependências
- React 19.2 (existing)
- `@testing-library/react` (já em devDeps)
- `src/assets/olefut_logo.png` (existing)

## Estimativa
- LandingIntro.jsx: 15min
- LandingIntro.css: 15min
- App.jsx gate: 10min
- harness: 20min
- build + test + commit + PR: 15min
- **Total: ~1h15min**

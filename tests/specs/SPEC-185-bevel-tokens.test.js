import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..', '..');

describe('SPEC-185: Stitch-Wins Bevel System Restoration', () => {
  test('design-tokens.css declares bevel utility tokens', () => {
    const css = fs.readFileSync(path.join(root, 'assets/design-tokens.css'), 'utf8');
    expect(css).toContain('--component-bevel-raised');
    expect(css).toContain('--component-bevel-pressed');
    expect(css).toContain('--component-bevel-elevated');
    expect(css).toContain('--frame-bevel-highlight: #2D6A4F');
    expect(css).toContain('--frame-bevel-shadow: #040805');
  });

  test('design-tokens.css declares neon glow utility tokens', () => {
    const css = fs.readFileSync(path.join(root, 'assets/design-tokens.css'), 'utf8');
    expect(css).toContain('--component-glow-neon');
    expect(css).toContain('--component-glow-neon-soft');
    expect(css).toContain('--component-glow-trophy');
    expect(css).toContain('--component-glow-danger');
  });

  test('no orphan "box-shadow removed for brand compliance" comments remain', () => {
    const filesToCheck = [
      'src/index.css',
      'src/styles/isssd-premium.css',
      'src/styles/animations.css',
      'src/styles/progressive-disclosure.css',
      'src/styles/gdd-systems.css',
      'src/components/dashboard/dashboard.css',
    ];
    for (const file of filesToCheck) {
      const content = fs.readFileSync(path.join(root, file), 'utf8');
      const orphans = content.match(/\/\* box-shadow removed for brand compliance \*\//g) || [];
      expect(orphans.length, `${file} has orphan removed-shadow comments`).toBe(0);
    }
  });

  test('button primary states use bevel tokens', () => {
    const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');
    const btnPrimaryMatch = css.match(/\.btn-primary\s*\{[^}]+\}/);
    expect(btnPrimaryMatch).toBeTruthy();
    expect(btnPrimaryMatch[0]).toContain('--component-bevel-raised');

    const btnActiveMatch = css.match(/\.btn-primary:active\s*\{[^}]+\}/);
    expect(btnActiveMatch).toBeTruthy();
    expect(btnActiveMatch[0]).toContain('--component-bevel-pressed');
  });

  test('ef-pulse-glow keyframe uses neon tokens', () => {
    const css = fs.readFileSync(path.join(root, 'src/styles/animations.css'), 'utf8');
    const keyframeMatch = css.match(/@keyframes ef-pulse-glow\s*\{[^}]+\}[^}]*\}/);
    expect(keyframeMatch).toBeTruthy();
    expect(keyframeMatch[0]).toContain('--component-glow-neon');
  });

  test('panels (ef-panel-hero) combine bevel + neon glow', () => {
    const css = fs.readFileSync(path.join(root, 'src/styles/isssd-premium.css'), 'utf8');
    const heroMatch = css.match(/\.ef-panel-hero\s*\{[^}]+\}/);
    expect(heroMatch).toBeTruthy();
    expect(heroMatch[0]).toMatch(/--component-bevel-elevated/);
    expect(heroMatch[0]).toMatch(/--component-glow-neon/);
  });
});

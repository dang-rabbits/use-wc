import { expect, describe, it } from 'vite-plus/test';
import { render } from 'vitest-browser-lit';
import { html } from 'lit';

import './use-scrollarea';
import { UseScrollarea } from './use-scrollarea';

describe('use-scrollarea', () => {
  describe('initial states (no overflow)', () => {
    it('has all four edge states when content does not overflow', async () => {
      render(html`
        <use-scrollarea style="height: 200px; overflow: auto;">
          <p>Short content</p>
        </use-scrollarea>
      `);
      const el = document.querySelector('use-scrollarea') as UseScrollarea;
      await el.updateComplete;

      expect(el.matches(':state(at-block-start)')).toBe(true);
      expect(el.matches(':state(at-block-end)')).toBe(true);
      expect(el.matches(':state(at-inline-start)')).toBe(true);
      expect(el.matches(':state(at-inline-end)')).toBe(true);
    });
  });

  describe('vertical scroll states', () => {
    it('has at-block-start but not at-block-end when content overflows vertically', async () => {
      render(html`
        <use-scrollarea style="height: 100px; overflow: auto;">
          ${Array.from({ length: 20 }, (_, i) => html`<p style="margin:0;line-height:2rem">Line ${i}</p>`)}
        </use-scrollarea>
      `);
      const el = document.querySelector('use-scrollarea') as UseScrollarea;
      await el.updateComplete;

      expect(el.matches(':state(at-block-start)')).toBe(true);
      expect(el.matches(':state(at-block-end)')).toBe(false);
    });

    it('has at-block-end but not at-block-start after scrolling to bottom', async () => {
      render(html`
        <use-scrollarea style="height: 100px; overflow: auto;">
          ${Array.from({ length: 20 }, (_, i) => html`<p style="margin:0;line-height:2rem">Line ${i}</p>`)}
        </use-scrollarea>
      `);
      const el = document.querySelector('use-scrollarea') as UseScrollarea;
      await el.updateComplete;

      el.scrollTop = el.scrollHeight;
      el.dispatchEvent(new Event('scroll'));
      await el.updateComplete;

      expect(el.matches(':state(at-block-start)')).toBe(false);
      expect(el.matches(':state(at-block-end)')).toBe(true);
    });
  });

  describe('horizontal scroll states', () => {
    it('has at-inline-start but not at-inline-end when content overflows horizontally', async () => {
      render(html`
        <use-scrollarea style="width: 100px; overflow: auto; white-space: nowrap;">
          <span style="display:inline-block;width:800px;">wide content</span>
        </use-scrollarea>
      `);
      const el = document.querySelector('use-scrollarea') as UseScrollarea;
      await el.updateComplete;

      expect(el.matches(':state(at-inline-start)')).toBe(true);
      expect(el.matches(':state(at-inline-end)')).toBe(false);
    });

    it('has at-inline-end but not at-inline-start after scrolling to end', async () => {
      render(html`
        <use-scrollarea style="width: 100px; overflow: auto; white-space: nowrap;">
          <span style="display:inline-block;width:800px;">wide content</span>
        </use-scrollarea>
      `);
      const el = document.querySelector('use-scrollarea') as UseScrollarea;
      await el.updateComplete;

      el.scrollLeft = el.scrollWidth;
      el.dispatchEvent(new Event('scroll'));
      await el.updateComplete;

      expect(el.matches(':state(at-inline-start)')).toBe(false);
      expect(el.matches(':state(at-inline-end)')).toBe(true);
    });
  });

  describe('dynamic content', () => {
    it('updates states when content is added that causes overflow', async () => {
      render(html`
        <use-scrollarea style="height: 100px; overflow: auto;">
          <p style="margin:0;line-height:2rem">Line 1</p>
        </use-scrollarea>
      `);
      const el = document.querySelector('use-scrollarea') as UseScrollarea;
      await el.updateComplete;

      expect(el.matches(':state(at-block-end)')).toBe(true);

      for (let i = 2; i <= 20; i++) {
        const p = document.createElement('p');
        p.style.cssText = 'margin:0;line-height:2rem';
        p.textContent = `Line ${i}`;
        el.appendChild(p);
      }

      await new Promise((r) => setTimeout(r, 50));

      expect(el.matches(':state(at-block-end)')).toBe(false);
    });
  });
});

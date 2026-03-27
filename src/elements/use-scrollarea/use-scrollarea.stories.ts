import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { UseScrollarea } from './use-scrollarea';
import './use-scrollarea';

const meta: Meta<UseScrollarea> = {
  title: 'Web Components/use-scrollarea',
  component: 'use-scrollarea',
  tags: ['autodocs', '!dev', 'utility'],
};
export default meta;

type Story = StoryObj<UseScrollarea>;

const scrollShadowStyles = html`
  <style>
    .scroll-demo {
      overflow: auto;
      height: 200px;
      width: 300px;
      border: 1px solid currentColor;
      position: relative;
    }

    .scroll-demo::before,
    .scroll-demo::after {
      content: '';
      display: block;
      position: sticky;
      inset-inline: 0;
      height: 24px;
      pointer-events: none;
      z-index: 1;
    }

    .scroll-demo::before {
      top: 0;
      background: rgba(255, 0, 0, 0.5);
    }

    .scroll-demo::after {
      bottom: 0;
      background: rgba(255, 0, 0, 0.5);
    }

    .scroll-demo:state(at-block-start)::before {
      display: none;
    }

    .scroll-demo:state(at-block-end)::after {
      display: none;
    }

    .scroll-demo p {
      margin: 0;
      padding: 0.5rem;
    }
  </style>
`;

export const Vertical: Story = {
  render: () => html`
    ${scrollShadowStyles}
    <use-scrollarea class="scroll-demo">
      ${Array.from({ length: 20 }, (_, i) => html`<p>Line ${i + 1} — scroll to see shadows appear and disappear</p>`)}
    </use-scrollarea>
  `,
};

export const Horizontal: Story = {
  render: () => html`
    <style>
      .scroll-h-wrapper {
        position: relative;
        width: 300px;
        height: 80px;
      }

      .scroll-demo-h {
        overflow: auto;
        height: 100%;
        width: 100%;
        border: 1px solid currentColor;
        white-space: nowrap;
      }

      .scroll-h-wrapper::before,
      .scroll-h-wrapper::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 24px;
        background: rgba(255, 0, 0, 0.5);
        pointer-events: none;
        z-index: 1;
      }

      .scroll-h-wrapper::before {
        left: 0;
      }

      .scroll-h-wrapper::after {
        right: 0;
      }

      .scroll-h-wrapper:has(use-scrollarea:state(at-inline-start))::before {
        display: none;
      }

      .scroll-h-wrapper:has(use-scrollarea:state(at-inline-end))::after {
        display: none;
      }

      .scroll-demo-h p {
        display: inline;
        padding: 0 0.5rem;
      }
    </style>
    <div class="scroll-h-wrapper">
      <use-scrollarea class="scroll-demo-h">
        ${Array.from({ length: 20 }, (_, i) => html`<p>Item ${i + 1}</p>`)}
      </use-scrollarea>
    </div>
  `,
};

export const Bidirectional: Story = {
  render: () => html`
    <style>
      .scroll-2d-wrapper {
        position: relative;
        width: 300px;
        height: 200px;
      }

      .scroll-demo-2d {
        overflow: auto;
        width: 100%;
        height: 100%;
        border: 1px solid currentColor;
      }

      .scroll-2d-shadow {
        position: absolute;
        background: rgba(255, 0, 0, 0.5);
        pointer-events: none;
        z-index: 1;
      }

      .scroll-2d-shadow-top,
      .scroll-2d-shadow-bottom {
        left: 0;
        right: 0;
        height: 24px;
      }

      .scroll-2d-shadow-top {
        top: 0;
      }

      .scroll-2d-shadow-bottom {
        bottom: 0;
      }

      .scroll-2d-shadow-left,
      .scroll-2d-shadow-right {
        top: 0;
        bottom: 0;
        width: 24px;
      }

      .scroll-2d-shadow-left {
        left: 0;
      }

      .scroll-2d-shadow-right {
        right: 0;
      }

      .scroll-2d-wrapper:has(use-scrollarea:state(at-block-start)) .scroll-2d-shadow-top {
        display: none;
      }

      .scroll-2d-wrapper:has(use-scrollarea:state(at-block-end)) .scroll-2d-shadow-bottom {
        display: none;
      }

      .scroll-2d-wrapper:has(use-scrollarea:state(at-inline-start)) .scroll-2d-shadow-left {
        display: none;
      }

      .scroll-2d-wrapper:has(use-scrollarea:state(at-inline-end)) .scroll-2d-shadow-right {
        display: none;
      }

      .scroll-demo-2d-inner {
        width: 800px;
      }

      .scroll-demo-2d p {
        margin: 0;
        padding: 0.5rem;
        white-space: nowrap;
      }

      .scroll-status {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        font-family: monospace;
      }
    </style>
    <div class="scroll-2d-wrapper">
      <div class="scroll-2d-shadow scroll-2d-shadow-top"></div>
      <div class="scroll-2d-shadow scroll-2d-shadow-bottom"></div>
      <div class="scroll-2d-shadow scroll-2d-shadow-left"></div>
      <div class="scroll-2d-shadow scroll-2d-shadow-right"></div>
      <use-scrollarea
        class="scroll-demo-2d"
        @scroll=${(e: Event) => {
          const area = e.currentTarget as UseScrollarea;
          const status = area.closest('.scroll-2d-wrapper')?.nextElementSibling;
          if (status) {
            const states = ['at-block-start', 'at-block-end', 'at-inline-start', 'at-inline-end']
              .filter((s) => area.matches(`:state(${s})`))
              .join(', ');
            status.textContent = `Active states: ${states || 'none'}`;
          }
        }}
      >
        <div class="scroll-demo-2d-inner">
          ${Array.from(
            { length: 20 },
            (_, i) => html`<p>Row ${i + 1} — wide content that overflows horizontally to trigger inline states</p>`
          )}
        </div>
      </use-scrollarea>
    </div>
    <div class="scroll-status">Active states: at-block-start, at-inline-start</div>
  `,
};

export const DynamicContent: Story = {
  render: () => {
    let count = 5;
    return html`
      ${scrollShadowStyles}
      <use-scrollarea class="scroll-demo" id="dynamic-scroll">
        ${Array.from({ length: count }, (_, i) => html`<p>Item ${i + 1}</p>`)}
      </use-scrollarea>
      <button
        type="button"
        style="margin-top: 0.5rem; display: block;"
        @click=${() => {
          const area = document.querySelector('#dynamic-scroll');
          if (area) {
            count++;
            const p = document.createElement('p');
            p.textContent = `Item ${count}`;
            area.appendChild(p);
          }
        }}
      >
        Add item
      </button>
      <p style="font-size: 0.85rem; margin-top: 0.25rem;">
        Add items until overflow — bottom shadow appears automatically.
      </p>
    `;
  },
};

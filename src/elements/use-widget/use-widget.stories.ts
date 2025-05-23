import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseWidget } from './use-widget';

const meta: Meta<UseWidget> = {
  component: 'use-widget',
  title: 'Web Components/use-widget',
  tags: ['autodocs', '!dev', 'utility'],
  args: {},
  render: () => {
    return html`
      <style>
        use-widget {
          display: block;
          border: 1px solid light-dark(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.25));
          padding: 1rem;
          margin: 1rem;
        }
      </style>
      <use-widget aria-label="widget one">
        <button>hello</button>
        <button>hello</button>
        <input />
        <button>hello</button>
      </use-widget>
      <use-widget aria-label="widget two">
        <button>hello</button>
        <div>
          <use-listbox>
            <use-option>hello</use-option>
            <use-option>hello</use-option>
            <use-option>hello</use-option>
          </use-listbox>
        </div>
        <button>hello</button>
      </use-widget>
      <use-widget aria-label="widget three">
        <button>hello</button>
        <button>hello</button>
        <button>hello</button>
      </use-widget>
    `;
  },
};

export default meta;
type Story = StoryObj<UseWidget>;

export const Default: Story = {};

export const Inert: Story = {
  render: () => {
    return html`
      <use-widget aria-label="inert widget" inert>
        <button>hello</button>
        <button>hello</button>
        <input />
        <button>hello</button>
      </use-widget>
    `;
  },
};

export const Details: Story = {
  render: () => {
    return html`
      <use-widget aria-label="details widget" details>
        <button>hello</button>
        <button>hello</button>
        <details>
          <summary>hello</summary>
          <button type="button">hello</button>
          <button type="button">hello</button>
          <button type="button">hello</button>
        </details>
      </use-widget>
    `;
  },
};

export const InjectWhileActive: Story = {
  render: () => {
    function handleInject() {
      const focusgroup = document.querySelector('#injectable') as UseWidget;
      const button = document.createElement('button');
      button.type = 'button';
      button.innerText = 'injected';
      focusgroup.appendChild(button);
      focusgroup.appendChild(button.cloneNode(true));
      focusgroup.appendChild(button.cloneNode(true));
    }

    return html`
      <use-widget id="injectable">
        <button type="button">markup</button>
        <button type="button">markup</button>
        <hr />
        <button @click=${handleInject} type="button">inject</button>
      </use-widget>
    `;
  },
};

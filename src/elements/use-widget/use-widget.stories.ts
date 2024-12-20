import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseWidget } from './use-widget';

const meta: Meta<UseWidget> = {
  component: 'use-widget',
  title: 'Web Components/use-widget',
  tags: ['autodocs', '!dev'],
  args: {},
  render: () => {
    return html`
      <style>
        use-widget {
          display: block;
          border: 1px solid light-dark(rgba(0,0,0,.25), rgba(255,255,255,.25));
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
  }
};

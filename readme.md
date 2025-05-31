[Documentation (usewc.com)](https://usewc.com)

[![Storybook documentation](https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg)](https://usewc.com) ![NPM Version](https://img.shields.io/npm/v/use-wc/latest) ![NPM Version (with dist tag)](https://img.shields.io/npm/v/use-wc/pre)

# About `use-wc`

`use-wc` is a library of accessible web components for rapidly developing highly customizable user interfaces. These web components are only intended to extend native HTML elements where they fall short. One example of this is replacing `table` with `use-grid` to provide keyboard navigation for various controls like data grids, master detail, and chip inputs with custom styling.

## Mission

Provide reusable components with built-in accessibility, internationalization, and theming using baseline web standards and APIs.

## Guiding principles

1. Predefined styles only apply to custom element names, named parts, and default slots
2. Third-party libraries should only be used if there isn't a baseline API available (like `floating-ui`) or the library provides battle-tested, single-use logic (like `tabbable`)
3. Input-type controls must return serializable data (`typeof string` or `FormData`) as its `value` property so it can be used inside `form` elements
4. The web components in this library should only provide solutions for gaps in baseline web features

## Install

```sh
npm i use-wc@pre
```

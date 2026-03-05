# Using use-wc

A library of accessible web components built with Lit.dev. These components extend native HTML where it falls short, providing keyboard navigation, accessibility, and internationalization out of the box.

## Basic Usage

Import the entire library in your app's entry point:

```javascript
import 'use-wc';
```

## Component Reference

All component properties, methods, and types are defined in the TypeScript definitions at `dist/use-wc.d.ts` and individual component files at `dist/elements/*/`.

## TypeScript Support

Import component classes for type checking:

```typescript
import { UseSelect, UseCalendar, UseOption } from 'use-wc';

const select = document.querySelector<UseSelect>('use-select');
const calendar = document.querySelector<UseCalendar>('use-calendar');
```

Refer to `dist/use-wc.d.ts` and `dist/elements/*/` for complete type definitions including:

- Component properties and methods
- Event interfaces
- Custom type definitions
- JSDoc comments with usage examples

## Styling with CSS Parts

Components use Shadow DOM with CSS parts for customization:

```css
use-select::part(trigger) {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
}

use-calendar::part(day-selected) {
  background-color: #007bff;
  color: white;
}
```

Refer to component source files for available CSS parts and custom state selectors.

## Form Integration

Form-associated custom elements work with native forms:

```html
<form>
  <use-select name="country">
    <use-option value="us">United States</use-option>
  </use-select>
  <use-date name="birthdate"></use-date>
  <button type="submit">Submit</button>
</form>
```

Access values via FormData:

```javascript
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  console.log(formData.get('country'));
  console.log(formData.get('birthdate'));
});
```

## VS Code Integration

For IntelliSense, add to `.vscode/settings.json`:

```json
{
  "html.customData": ["node_modules/use-wc/vscode.html-custom-data.json"],
  "css.customData": ["node_modules/use-wc/vscode.css-custom-data.json"]
}
```

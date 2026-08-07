import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

async function handleCopyToClipboard() {
  const value = (document.getElementById("output") as HTMLInputElement)?.value;
  await window.top?.navigator.clipboard.writeText(value);
}

const meta: Meta = {
  title: "Token Name Builder",
  tags: ["autodocs", "!dev", "utility"],
  parameters: { allowTheme: true },
  args: {},
  render: () => {
    function handleFormChange(event: Event) {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const output = document.getElementById("output") as HTMLOutputElement;
      const tokenName = [
        "--usewc",
        formData.get("category"),
        formData.get("component"),
        formData.get("type"),
        formData.get("part"),
        formData.get("variant"),
        formData.get("property"),
        formData.get("modifier"),
        formData.get("state"),
      ]
        .filter(Boolean)
        .join("-");
      output.value = tokenName;
    }
    return html`
      <form @change=${handleFormChange}>
        <table width="100%">
          <thead>
            <tr>
              <th width="12.5%">Category</th>
              <th width="12.5%">Component</th>
              <th width="12.5%">Type</th>
              <th width="12.5%">Part</th>
              <th width="12.5%">Variant</th>
              <th width="12.5%">Property</th>
              <th width="12.5%">Modifier</th>
              <th width="12.5%">State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <select size="15" name="category" style="width: 100%">
                  <option>color</option>
                  <option>size</option>
                  <option>space</option>
                  <option>layout</option>
                  <option>font</option>
                  <option>effect</option>
                </select>
              </td>
              <td>
                <select size="15" name="component" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>document</option>
                  <option>form</option>
                  <option>input</option>
                  <option>selector</option>
                  <option>action</option>
                </select>
              </td>
              <td>
                <select size="15" name="type" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>checkbox</option>
                  <option>radio</option>
                  <option>switch</option>
                  <option>button</option>
                  <option>link</option>
                </select>
              </td>
              <td>
                <select size="15" name="part" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>trigger</option>
                  <option>segment</option>
                  <option>indicator</option>
                  <option>text</option>
                  <option>label</option>
                  <option>helper-text</option>
                  <option>header</option>
                  <option>body</option>
                  <option>aside</option>
                  <option>footer</option>
                </select>
              </td>
              <td>
                <select size="15" name="variant" style="width: 100%">
                  <option value="" selected>-</option>
                  <optgroup label="Intent">
                    <option>base</option>
                    <option>primary</option>
                    <option>auxiliary</option>
                    <option>danger</option>
                    <option>attention</option>
                    <option>info</option>
                    <option>success</option>
                  </optgroup>
                  <optgroup label="Scale">
                    <option>small</option>
                    <option>medium</option>
                    <option>large</option>
                  </optgroup>
                </select>
              </td>
              <td>
                <select size="15" name="property" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>background</option>
                  <option>border</option>
                  <option>padding</option>
                  <option>gap</option>
                  <option>size</option>
                  <option>line-height</option>
                  <option>outline</option>
                  <option>shadow</option>
                </select>
              </td>
              <td>
                <select size="15" name="modifier" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>inline</option>
                  <option>inline-start</option>
                  <option>inline-end</option>
                  <option>block</option>
                  <option>block-start</option>
                  <option>block-end</option>
                  <option>inside</option>
                  <option>outside</option>
                </select>
              </td>
              <td>
                <select size="15" name="state" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>static</option>
                  <option>hover</option>
                  <option>focus</option>
                  <option>active</option>
                  <option>disabled</option>
                  <option>readonly</option>
                  <option>placeholder</option>
                  <option>valid</option>
                  <option>invalid</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <input id="output" type="text" readonly style="font-family: monospace; width: 100%;" />
      <button type="button" @click=${handleCopyToClipboard}>Copy to clipboard</button>
    `;
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

async function handleCopyToClipboard() {
  const value = (document.getElementById("output") as HTMLInputElement)?.value;
  await window.top?.navigator.clipboard.writeText(value);
}

const meta: Meta = {
  title: "Design System/Tools/Token Name Builder",
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
              <th width="14%">Category</th>
              <th width="14%">Component</th>
              <th width="14%">Part</th>
              <th width="14%">Variant</th>
              <th width="14%">Property</th>
              <th width="14%">Modifier</th>
              <th width="14%">State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <select size="15" name="category" style="width: 100%">
                  <option>color</option>
                  <option>layout</option>
                  <option>font</option>
                  <option>effect</option>
                  <option>transition</option>
                </select>
              </td>
              <td>
                <select size="15" name="component" style="width: 100%">
                  <option value="" selected>-</option>
                  <optgroup label="Document">
                    <option>document</option>
                    <option>surface</option>
                    <option>page</option>
                    <option>region</option>
                    <option>prose</option>
                    <option>code</option>
                    <option>quote</option>
                  </optgroup>
                  <optgroup label="Form">
                    <option>form</option>
                    <option>entry</option>
                    <option>input</option>
                    <option>select</option>
                    <option>selector</option>
                    <option>range</option>
                    <option>control</option>
                  </optgroup>
                  <optgroup label="Action">
                    <option>button</option>
                    <option>link</option>
                    <option>menu</option>
                    <option>breadcrumb</option>
                  </optgroup>
                  <optgroup label="Overlay">
                    <option>popover</option>
                    <option>dropdown</option>
                  </optgroup>
                  <optgroup label="Collection">
                    <option>grid</option>
                    <option>tree</option>
                    <option>sidebar</option>
                    <option>card</option>
                    <option>badge</option>
                    <option>avatar</option>
                  </optgroup>
                </select>
              </td>
              <td>
                <select size="15" name="part" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>trigger</option>
                  <option>segment</option>
                  <option>indicator</option>
                  <option>icon</option>
                  <option>label</option>
                  <option>helper</option>
                  <option>header</option>
                  <option>title</option>
                  <option>item</option>
                  <option>row</option>
                  <option>cell</option>
                  <option>track</option>
                  <option>thumb</option>
                  <option>chip</option>
                </select>
              </td>
              <td>
                <select size="15" name="variant" style="width: 100%">
                  <option value="" selected>-</option>
                  <optgroup label="Intent">
                    <option>base</option>
                    <option>primary</option>
                    <option>danger</option>
                    <option>auxiliary</option>
                  </optgroup>
                  <optgroup label="Scale">
                    <option>compact</option>
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
                  <option>text</option>
                  <option>padding</option>
                  <option>gap</option>
                  <option>size</option>
                  <option>line-height</option>
                  <option>radius</option>
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
                  <option>inset</option>
                  <option>outset</option>
                </select>
              </td>
              <td>
                <select size="15" name="state" style="width: 100%">
                  <option value="" selected>-</option>
                  <option>static</option>
                  <option>hover</option>
                  <option>focus</option>
                  <option>active</option>
                  <option>pressed</option>
                  <option>checked</option>
                  <option>selected</option>
                  <option>visited</option>
                  <option>disabled</option>
                  <option>readonly</option>
                  <option>placeholder</option>
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

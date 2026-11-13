import { expect, describe, it } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-focusgroup";
import "../use-menu/use-menu";
import "../use-caret/use-caret";
import { UseMenu } from "../use-menu/use-menu";

function waitForOpenState(menu: UseMenu, expected: boolean) {
  return new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + 1000;
    const check = () => {
      if (menu.matches(":popover-open") === expected) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`Timed out waiting for :popover-open to be ${expected}`));
        return;
      }
      setTimeout(check, 10);
    };
    check();
  });
}

function settle() {
  return new Promise<void>((resolve) => setTimeout(resolve, 100));
}

describe("use-focusgroup", () => {
  it("moves focus between items with arrow keys", async () => {
    render(html`
      <use-focusgroup features="inline">
        <button type="button" id="first">first</button>
        <button type="button" id="second">second</button>
      </use-focusgroup>
    `);
    await settle();

    const first = document.getElementById("first") as HTMLButtonElement;
    const second = document.getElementById("second") as HTMLButtonElement;

    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(second);
    expect(first.getAttribute("tabindex")).toBe("-1");

    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(first);
  });

  describe("with a menu", () => {
    async function renderToolbar() {
      render(html`
        <use-focusgroup features="inline">
          <button type="button" id="before">before</button>
          <button type="button" id="font" popovertarget="font-menu">
            <use-caret>font</use-caret>
          </button>
          <use-menu id="font-menu" aria-label="font">
            <button type="button" role="menuitem">Arial</button>
            <button type="button" role="menuitem">Times New Roman</button>
            <button type="button" role="menuitem" popovertarget="size-menu">
              <use-caret>size</use-caret>
            </button>
            <use-menu id="size-menu" aria-label="size">
              <button type="button" role="menuitem">small</button>
              <button type="button" role="menuitem">large</button>
            </use-menu>
          </use-menu>
          <button type="button" id="bold">bold</button>
        </use-focusgroup>
      `);

      const font = document.getElementById("font") as HTMLButtonElement;
      const menu = document.getElementById("font-menu") as UseMenu;
      const submenu = document.getElementById("size-menu") as UseMenu;
      const items = Array.from(menu.querySelectorAll<HTMLElement>(':scope > [role="menuitem"]'));
      await menu.updateComplete;
      await settle();

      font.focus();
      await userEvent.keyboard("{ArrowDown}");
      await waitForOpenState(menu, true);

      return { font, menu, submenu, items };
    }

    it("ignores ArrowLeft and ArrowRight while focus is inside the open menu", async () => {
      const { menu, items } = await renderToolbar();

      await userEvent.keyboard("{ArrowRight}");
      await settle();
      expect(document.activeElement).toBe(items[0]);

      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{ArrowLeft}");
      await settle();
      expect(document.activeElement).toBe(items[1]);
      expect(menu.matches(":popover-open")).toBe(true);
    });

    it("leaves the menu items out of the roving set", async () => {
      const { items } = await renderToolbar();

      expect(items.some((item) => item.hasAttribute("data-usewc-focusgroup-tabindex"))).toBe(false);
    });

    it("resumes navigation from the trigger after Escape closes the menu", async () => {
      const { font, menu } = await renderToolbar();

      await userEvent.keyboard("{Escape}");
      await waitForOpenState(menu, false);
      await settle();
      expect(document.activeElement).toBe(font);

      await userEvent.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(document.getElementById("bold"));
    });

    it("still opens a submenu with ArrowRight", async () => {
      const { menu, submenu, items } = await renderToolbar();

      items[2].focus();
      await userEvent.keyboard("{ArrowRight}");
      await waitForOpenState(submenu, true);
      await settle();

      expect(menu.matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(submenu.querySelector('[role="menuitem"]'));
    });
  });

  describe("with a dialog", () => {
    async function renderDialog(mode: "showModal" | "show") {
      render(html`
        <use-focusgroup features="inline">
          <button type="button" id="open">open</button>
          <dialog id="dialog">
            <button type="button" id="one">one</button>
            <button type="button" id="two">two</button>
          </dialog>
          <button type="button" id="after">after</button>
        </use-focusgroup>
      `);
      await settle();

      const open = document.getElementById("open") as HTMLButtonElement;
      const dialog = document.getElementById("dialog") as HTMLDialogElement;
      const one = document.getElementById("one") as HTMLButtonElement;
      const two = document.getElementById("two") as HTMLButtonElement;

      open.focus();
      dialog[mode]();
      await settle();

      return { open, dialog, one, two };
    }

    for (const mode of ["showModal", "show"] as const) {
      it(`leaves the dialog's controls out of the roving set when opened with ${mode}()`, async () => {
        const { dialog, one, two } = await renderDialog(mode);

        expect(one.hasAttribute("tabindex")).toBe(false);
        expect(two.hasAttribute("tabindex")).toBe(false);

        one.focus();
        await userEvent.keyboard("{Tab}");
        expect(document.activeElement).toBe(two);

        dialog.close();
      });

      it(`ignores ArrowLeft and ArrowRight inside a dialog opened with ${mode}()`, async () => {
        const { dialog, one, two } = await renderDialog(mode);

        two.focus();
        await userEvent.keyboard("{ArrowRight}");
        expect(document.activeElement).toBe(two);

        await userEvent.keyboard("{ArrowLeft}");
        expect(document.activeElement).toBe(two);
        expect(one.hasAttribute("tabindex")).toBe(false);

        dialog.close();
      });
    }

    it("lets Escape close a modal dialog natively", async () => {
      const { open, dialog, two } = await renderDialog("showModal");

      two.focus();
      await userEvent.keyboard("{Escape}");
      await settle();

      expect(dialog.open).toBe(false);
      expect(document.activeElement).toBe(open);
    });

    it("resumes navigation once the dialog closes", async () => {
      const { open, dialog } = await renderDialog("showModal");

      dialog.close();
      await settle();
      open.focus();
      await userEvent.keyboard("{ArrowRight}");

      expect(document.activeElement).toBe(document.getElementById("after"));
    });
  });
});

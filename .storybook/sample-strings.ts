import type { UseWcStrings } from "../src/i18n/i18n";

export const sampleStrings = {
  fr: {
    "use-grid": {
      selectAllRows: "Tout sélectionner",
      selectRow: "Sélectionner {label}",
      selectRowNumber: "Sélectionner la ligne {index}",
    },
  },
  de: {
    "use-grid": {
      selectAllRows: "Alle auswählen",
      selectRow: "{label} auswählen",
      selectRowNumber: "Zeile {index} auswählen",
    },
  },
  es: {
    "use-grid": {
      selectAllRows: "Seleccionar todo",
      selectRow: "Seleccionar {label}",
      selectRowNumber: "Seleccionar fila {index}",
    },
  },
  ja: {
    "use-grid": {
      selectAllRows: "すべて選択",
      selectRow: "{label}を選択",
      selectRowNumber: "{index}行目を選択",
    },
  },
  ar: {
    "use-grid": {
      selectAllRows: "تحديد الكل",
      selectRow: "تحديد {label}",
      selectRowNumber: "تحديد الصف {index}",
    },
  },
  "zh-Hans": {
    "use-grid": {
      selectAllRows: "全选",
      selectRow: "选择{label}",
      selectRowNumber: "选择第 {index} 行",
    },
  },
} satisfies Record<string, UseWcStrings>;

import { writeFileSync } from "node:fs";
import { catalogPath, readComponentStrings, renderCatalog } from "./strings-catalog.mjs";

const stringsByComponent = readComponentStrings();
writeFileSync(catalogPath, renderCatalog(stringsByComponent), "utf-8");

console.log(`Generated strings types for ${Object.keys(stringsByComponent).length} components.`);

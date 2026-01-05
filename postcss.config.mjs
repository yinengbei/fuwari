import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import postcssNesting from "tailwindcss/nesting/index.js";
import fontDisplaySwap from "./src/plugins/postcss-font-display.mjs";

export default {
	plugins: {
		"postcss-import": postcssImport, // to combine multiple css files
		"tailwindcss/nesting": postcssNesting,
		tailwindcss: tailwindcss,
		"font-display-swap": fontDisplaySwap, // add font-display: swap to all fonts
	},
};

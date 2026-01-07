/**
 * PostCSS plugin to add font-display: swap to all @font-face rules
 * This ensures fonts use swap strategy to avoid FOIT
 */
export default function fontDisplaySwap() {
	return {
		postcssPlugin: "font-display-swap",
		AtRule: {
			"font-face"(atRule) {
				// Check if font-display is already set
				const hasFontDisplay = atRule.nodes.some(
					(node) => node.prop === "font-display",
				);

				// Add font-display: swap if not present
				if (!hasFontDisplay) {
					atRule.append({
						prop: "font-display",
						value: "swap",
						raws: { before: "\n  " },
					});
				} else {
					// Update existing font-display to swap
					atRule.nodes.forEach((node) => {
						if (node.prop === "font-display" && node.value !== "swap") {
							node.value = "swap";
						}
					});
				}
			},
		},
	};
}

fontDisplaySwap.postcss = true;

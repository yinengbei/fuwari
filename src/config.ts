import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "提瓦特博客",
	subtitle: "Tech otakus save the world",
	lang: "zh_CN",
	themeColor: {
		hue: 250,
		fixed: true,
	},
	banner: {
		enable: true,
		src: "https://imoss.tiwat.cn/2025/12/14/f865399ae020306c54e0063e554bbca2259895991.png_t",
		position: "top",
		credit: {
			enable: true,
			text: "纯洁的艾玛 ~善良的艾玛 ~乖孩子艾玛~",
			url: "https://www.bilibili.com/video/BV12aUUBvEc3/",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [
		{
			src: "https://mc.tiwat.cn/images/tap_blue_white.png",
			theme: "light",
			sizes: "32x32",
		},
	],
}; 
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		//{
		//	name: "MC服务器",
		//	url: "https://mc.tiwat.cn/",
		//	external: true,
		//},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "https://imoss.tiwat.cn/2025/12/13/b_15313f6eacd791534499363de72c30ea.webp_t", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "依依Yiyi",
	bio: "Tech otakus save the world",
	  links: [
		{
		  name: "bilibili",
		  icon: "fa6-brands:bilibili",
		  url: "https://space.bilibili.com/473378169",
		},
		{
		  name: "GitHub",
		  icon: "fa6-brands:github",
		  url: "https://github.com/yinengbei/fuwari",
		},
	  ],
	};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

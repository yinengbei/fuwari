/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly GITHUB_TOKEN?: string;
	readonly GH_TOKEN?: string;
	readonly GITHUB_PERSONAL_ACCESS_TOKEN?: string;
}

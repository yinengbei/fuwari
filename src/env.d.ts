/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare namespace ImportMetaEnv {
	interface ImportMetaEnv {
		readonly BUILD_VERSION?: string;
	}
}

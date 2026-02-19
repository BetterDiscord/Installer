import adapter from "@sveltejs/adapter-static";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";


/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({fallback: "index.html"}),
        alias: {
            "@assets/*": "./src/lib/assets/*",
            "@backend/*": "./src/lib/wails/installer/internal/services/*",
            "@backend": "./src/lib/wails/installer/internal/services/index.ts",
        }
    }
};

export default config;

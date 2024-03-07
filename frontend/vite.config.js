import fs from "fs";
import path from "path";
import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";

// eslint-disable-next-line no-undef
const license = fs.readFileSync(path.join(__dirname, "..", "assets", "license.txt")).toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  define: {
    __INSTALLER_LICENSE__: JSON.stringify(license)
  }
});

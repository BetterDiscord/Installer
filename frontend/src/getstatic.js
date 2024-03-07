// import path from "path";
// import * as url from "url";

// TODO: determine if needed
const isDevelopment = true; // process.env.NODE_ENV !== "production";

export default function getStatic(val) {
  return `assets/${val}`;
    // if (isDevelopment) {
    //   return url.resolve(window.location.origin, val);
    // }
    // return path.resolve(__static, val);
}
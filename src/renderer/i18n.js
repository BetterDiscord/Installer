// src/i18n.js
import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import("../../assets/lang/en.json"));
register('de', () => import("../../assets/lang/de.json"));

export default function(){
    init({
        fallbackLocale: 'en',
        initialLocale: "de",
    });
};

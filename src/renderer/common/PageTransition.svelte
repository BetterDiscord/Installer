<script context="module">
    import { cubicInOut } from 'svelte/easing';

    export function page(node, {
        delay = 0,
        duration = 250,
        easing = cubicInOut,
        x = 0,
        y = 0
    }) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;

        return {
            delay,
            duration,
            easing,
            css: t => `
                transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);`
        };
    }
</script>
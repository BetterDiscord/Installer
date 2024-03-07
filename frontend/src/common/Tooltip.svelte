<script>
    export let text = "";
    export let color = "default";
    export let position = "top";
    export let x = 0;
    export let y = 0;
    export let element = undefined; // eslint-disable-line no-undef-init

    $: colors = ["default", "danger", "accent"];
    $: positions = ["top", "bottom", "left", "right"];
</script>

<svelte:options accessors/>

<div bind:this={element}
    style="--tooltip-x: {x}px; --tooltip-y: {y}px;"
    class="tooltip {positions.includes(position) ? `position-${position}` : "position-top"} {colors.includes(color) ? `color-${color}` : "color-default"}"
>
    <div class="tooltip-pointer"></div>
    <span class="tooltip-content">{text}</span>
</div>

<style>
    @keyframes tooltip-in {
        0% {
            transform: scale(.95);
            opacity: 0;
        }
        100% {
            transform: none;
            opacity: 1;
        }
    }
    @keyframes tooltip-out {
        0% {
            transform: none;
            opacity: 1;
        }
        100% {
            transform: scale(.95);
            opacity: 0;
        }
    }
    .tooltip-wrapper {
        width: fit-content;
        display: inline-block;
    }
    .tooltip {
        user-select: none;
        opacity: 1;
        position: fixed;
        top: var(--tooltip-y);
        left: var(--tooltip-x);
        border-radius: 2px;
        font-weight: 500;
        font-size: 12px;
        line-height: normal;
        max-width: 190px;
        word-wrap: break-word;
        z-index: 1002;
        will-change: opacity, transform;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
        background-color: var(--tooltip-background);
        color: var(--tooltip-text);
        transition: 50ms ease-in-out opacity, 50ms ease-in-out transform;
        animation: tooltip-in 50ms ease-in-out;
    }
    .tooltip.closing {
        opacity: 0;
        transform: scale(0.95);
        animation: tooltip-out 50ms ease-in-out;
    }

    /* Colors */
    .tooltip.color-default {
        --tooltip-background: var(--text-light);
        --tooltip-text: var(--bg1);
    }
    .tooltip.color-danger {
        --tooltip-background: var(--danger);
        --tooltip-text: #fff;
    }
    .tooltip.color-accent {
        --tooltip-background: var(--accent);
        --tooltip-text: #fff;
    }

    /* Positioning */
    .tooltip.position-top {
        transform-origin: 50% 100%;
    }
    .tooltip.position-top .tooltip-pointer {
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-top-width: 5px;
        border-top-color: var(--tooltip-background);
    }
    .tooltip.position-bottom {
        transform-origin: 50% 0;
    }
    .tooltip.position-bottom .tooltip-pointer {
        bottom: 100%;
        left: 50%;
        margin-left: -5px;
        border-bottom-width: 5px;
        border-bottom-color: var(--tooltip-background);
    }
    .tooltip.position-left {
        transform-origin: 100% 50%;
    }
    .tooltip.position-left .tooltip-pointer {
        left: 100%;
        top: 50%;
        margin-top: -5px;
        border-left-width: 5px;
        border-left-color: var(--tooltip-background);
    }
    .tooltip.position-right {
        transform-origin: 0 50%;
    }
    .tooltip.position-right .tooltip-pointer {
        right: 100%;
        top: 50%;
        margin-top: -5px;
        border-right-width: 5px;
        border-right-color: var(--tooltip-background);
    }

    /* Pointers */
    .tooltip-pointer {
        width: 0;
        height: 0;
        border: 5px solid transparent;
        position: absolute;
    }

    /* Inner Tooltip */
    .tooltip-content {
        padding: 4px 8px;
        overflow: hidden;
        display: block;
    }
</style>
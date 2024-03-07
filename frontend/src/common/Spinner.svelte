<script>
    import {afterUpdate, onMount} from "svelte";
    export let value = undefined; // eslint-disable-line no-undef-init
    let className = undefined; // eslint-disable-line no-undef-init
    export {className as class};

    let circle;

    function updateValue() {
        const circumference = Math.PI * (circle.getAttribute("r") * 2);
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        circle.style.strokeDashoffset = ((100 - value) / 100) * circumference;
    }

    onMount(updateValue);
    afterUpdate(updateValue);
</script>

<svg
    class="spinner {className}"
    class:indeterminate={!value}
    width="32"
    height="32" 
    viewBox="0 0 16 16"
    role="progressbar"
    aria-valuemin={value ? 0 : undefined}
    aria-valuemax={value ? 100 : undefined}
    aria-valuenow={value}
    {...$$restProps}
>
    <circle class="spinner-ring" cx="50%" cy="50%" r="7"></circle>
    <circle class="spinner-fill" cx="50%" cy="50%" r="7" stroke-dasharray="3" bind:this={circle}></circle>
</svg>

<style>
    @keyframes spinner-indeterminate {
        0% {
            stroke-dasharray: 0.01px 43.97px;
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(450deg);
            stroke-dasharray: 21.99px 21.99px;
        }
        100% {
            stroke-dasharray: 0.01px 43.97px;
            transform: rotate(1080deg);
        }
    }

    .spinner {
        width: 32px;
        height: 32px;
    }

    .spinner circle {
        fill: none;
        transform: rotate(-90deg);
        transition: all 0.2s ease-in-out;
        stroke-width: 2;
        stroke-linecap: round;
        transform-origin: 50% 50%;
    }

    .spinner-ring {
        stroke: var(--bg3);
    }

    .spinner .spinner-fill {
        stroke: var(--accent);
        stroke-dasharray: 43.75;
        animation: spinner 2s linear infinite;
    }

    .spinner.indeterminate .spinner-fill {
        animation: spinner-indeterminate 2s linear infinite;
    }
</style>
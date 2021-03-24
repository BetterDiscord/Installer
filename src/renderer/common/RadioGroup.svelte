<script>
    export let index = 0;
</script>

<div style="--index: {index};" class="radio-group">
    <slot />
    <div class="selection-indicator"></div>
</div>

<style>
    .radio-group {
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .selection-indicator {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        background-color: var(--accent);
        border-radius: 3px;
        transition: 250ms ease;
        z-index: 0;
        transform: translateY(calc((100% + 12px) * var(--index)));
    }
</style>
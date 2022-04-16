<script>
    export let value = 0;
    export let max = 100;
    let className;
    export {className as class};
</script>

<div class="progress-bar {className}" {...$$restProps}>
    <div class="progress-fill" style="width: {(value / max) * 100}%;"></div>
</div>

<style>
    .progress-bar {
        width: 100%;
        height: 6px;
        border-radius: 6px;
        overflow: hidden;
        background-color: var(--bg3);
    }

    .progress-fill {
        height: 100%;
        border-radius: 6px;
        overflow: hidden;
        transition: 500ms ease width, 150ms ease background-color;
        transform-origin: left;
        background-color: var(--accent);
    }

    :global(.progress-bar.error .progress-fill) {
        background-color: var(--danger);
    }

    :global(.progress-bar.success .progress-fill) {
        background-color: #3ac172;
    }
</style>
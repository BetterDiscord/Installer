<script>
    export let value = 0;
    export let max = 100;
</script>

<div class="progress">
    <div class="bar" style="width: {(value / max) * 100}%;"></div>
</div>

<style>
    .progress {
        width: 100%;
        height: 6px;
        border-radius: 6px;
        overflow: hidden;
        background-color: var(--bg3);
    }

    .bar {
        height: 100%;
        border-radius: 6px;
        overflow: hidden;
        transition: 500ms ease width;
        transform-origin: left;
        background-color: var(--accent);
    }
</style>
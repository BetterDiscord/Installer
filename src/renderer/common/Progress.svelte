<script>
    // import Spinner from "./Spinner.svelte";
    export let value = 0;
    export let max = 100;
</script>

<!-- <progress {value} {max} /> -->
<div class="progress">
    <!-- <div class="bar" style="transform: scaleX({value / max});"></div> -->
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
        /* width: 100%; */
        border-radius: 6px;
        overflow: hidden;
        /* transform: scaleX(0); */
        transition: 500ms ease width;
        transform-origin: left;
        background-color: var(--accent);
    }

    /* progress {
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        border-radius: 4px;
        overflow: hidden;
    }

    progress::-webkit-progress-bar {
        background-color: var(--bg3);
    }

    progress::-webkit-progress-value {
        background-color: var(--accent);
    } */
    /* .textarea {
        background: var(--bg3);
        padding: 5px;
        color: var(--text-normal);
        font-size: 12px;
        border-radius: 5px;
        flex: 1;
        word-wrap: normal;
        overflow-y: auto;
        margin-bottom: 10px;
        white-space: pre-wrap;
    }

    .textarea.loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .textarea::-webkit-scrollbar {
        width: 4px;
    }

    .textarea::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .textarea::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.075);
    }

    .textarea::-webkit-scrollbar-thumb:active {
        background-color: rgba(255, 255, 255, 0.1);
    } */
</style>
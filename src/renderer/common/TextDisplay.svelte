<script>
    import Spinner from "./Spinner.svelte";
    export let value;
    export let element;
</script>

<div class="textarea{value ? "" : " loading"}" bind:this={element}>
{#if value}
{value}
{:else}
<Spinner />
{/if}
</div>

<style>
    .textarea {
        background: var(--bg3);
        /* border: 1px solid var(--text-light); */
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
    }
</style>
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
        padding: 8px;
        color: var(--text-normal);
        font-size: 12px;
        border-radius: 2px;
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
</style>
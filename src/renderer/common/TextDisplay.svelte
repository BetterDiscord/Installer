<script>
    import Spinner from "./Spinner.svelte";
    import Button from "./Button.svelte";
    import {beforeUpdate, afterUpdate} from "svelte";
    export let value;
    export let element;
    export let autoscroll;

    let scrollEventCount = 0;
    let autoscrollEnabled;
    let scroller;
    
    let copyInputContainer;
    let isCopyButtonActive = false;

    function copyDisplayContents() {
        const range = document.createRange();
        range.selectNode(element);
        window.getSelection().addRange(range);
        document.execCommand("Copy");
        document.getSelection().removeAllRanges();
        isCopyButtonActive = true;
        setTimeout(() => {
            isCopyButtonActive = false;
        }, 500);
    }

    if (autoscroll) {
        beforeUpdate(() => {
            autoscrollEnabled = scroller && (scroller.offsetHeight + scroller.scrollTop) > (scroller.scrollHeight);
        });
        afterUpdate(() => {
            if (autoscrollEnabled) scroller.scrollTo(0, scroller.scrollHeight);
        });
    }

    $: if (autoscroll && scroller && scrollEventCount < 2) {
        setImmediate(() => scroller.scrollTop = scroller.scrollHeight);
    }
</script>

<div class="text-display{value ? "" : " loading"}" bind:this={element}>
    {#if value}
    <div on:scroll={() => {if (autoscroll) scrollEventCount++;}} bind:this={scroller} class="display-inner">{value}</div>
    <div bind:this={copyInputContainer} class="copy-input">
        {#if isCopyButtonActive}
            <Button type="primary" on:click={copyDisplayContents}>Copied!</Button>
        {:else}
            <Button type="secondary" on:click={copyDisplayContents}>Copy</Button>
        {/if}
    </div>
    {:else}
    <Spinner />
    {/if}
</div>

<style>

    :global(.text-display .copy-input .btn[class]) {
        background-color: var(--bg4);
        border: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    :global(.text-display .copy-input .btn[class]:hover) {
        color: var(--text-light);
    }
    
    .copy-input {
        opacity: 0;
        transition: 150ms ease;
        position: absolute;
        bottom: 8px;
        right: 8px;
    }

    .text-display:hover .copy-input {
        opacity: 1;
    }

    .text-display {
        position: relative;
        display: flex;
        flex: 1;
        min-height: 0;
        margin-bottom: 10px;
        background: var(--bg3);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 2px;
    }

    .text-display .display-inner {
        font-family: 'Fira Code', 'Courier New', Courier, monospace;
        color: var(--text-normal);
        font-size: 12px;
        word-wrap: normal;
        white-space: pre-wrap;
        user-select: text;
        height: 100%;
        width: 100%;
        overflow: auto;
        padding: 12px;
    }

    .text-display.loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
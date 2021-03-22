<script>
    import Button from "./Button.svelte";
    import LoadingPage from "../pages/Loading.svelte";
    import {beforeUpdate, afterUpdate} from "svelte";
    import {fade} from "svelte/transition";
    export let value;
    export let element;
    export let autoscroll;

    let scrollEventCount = 0;
    let autoscrollEnabled;
    let scroller;
    
    let copyInputContainer;
    let copyButtonActive = false;
    let copyButtonVisible = false;

    function copyDisplayContents() {
        const range = document.createRange();
        range.selectNode(element);
        window.getSelection().addRange(range);
        document.execCommand("Copy");
        document.getSelection().removeAllRanges();
        copyButtonActive = true;
        setTimeout(() => {
            copyButtonActive = false;
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

{#if value}
    <div on:mousemove={() => copyButtonVisible = true} on:mouseleave={() => copyButtonVisible = false} class="text-display{value ? "" : " loading"}" bind:this={element}>
        <div on:scroll={() => {if (autoscroll) {scrollEventCount++;} copyButtonVisible = false;}} bind:this={scroller} class="display-inner">{value}</div>
        {#if copyButtonVisible}
            <div transition:fade={{duration: 100}} bind:this={copyInputContainer} class="copy-input">
                {#if copyButtonActive}
                    <Button type="primary" on:click={copyDisplayContents}>Copied!</Button>
                {:else}
                    <Button type="secondary" on:click={copyDisplayContents}>Copy</Button>
                {/if}
            </div>
        {/if}
    </div>
{:else}
    <LoadingPage />
{/if}

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
        transition: 150ms ease;
        position: absolute;
        bottom: 8px;
        right: 8px;
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
        color: var(--text-normal);
        font-size: 13px;
        line-height: 1.5;
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
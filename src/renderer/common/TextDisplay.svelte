<script>
    import Button from "./Button.svelte";
    import LoadingPage from "../pages/Loading.svelte";
    import {beforeUpdate, afterUpdate, onMount} from "svelte";
    export let value;
    export let element;
    export let autoscroll;

    let scroller;
    
    let copyInputContainer;
    let copyButtonActive = false;

    // Copy button
    function copyDisplayContents() {
        copyButtonActive = true;
        const range = document.createRange();
        range.selectNode(element);
        window.getSelection().addRange(range);
        document.execCommand("Copy");
        document.getSelection().removeAllRanges();
        setTimeout(() => {
            copyButtonActive = false;
        }, 500);
    }

    function handleKeyboardCopyToggle() {
        if (event.key === "Enter" || event.key === " ") copyDisplayContents();
    }

    // Autoscroll
    beforeUpdate(() => {
        autoscroll = scroller && (scroller.offsetHeight + scroller.scrollTop) > (scroller.scrollHeight - 20);
    });

    afterUpdate(() => {
        if (autoscroll) scroller.scrollTo(0, scroller.scrollHeight);
    });
</script>

{#if value}
    <article class="text-display{value ? "" : " loading"}" bind:this={element}>
        <div bind:this={scroller} class="display-inner" tabindex="0">
            {value}
        </div>
        <div bind:this={copyInputContainer} class="copy-input">
            {#if copyButtonActive}
                <Button tabindex="0" type="primary" on:keypress={handleKeyboardCopyToggle} on:click={copyDisplayContents}>Copied!</Button>
            {:else}
                <Button tabindex="0" type="secondary" on:keypress={handleKeyboardCopyToggle} on:click={copyDisplayContents}>Copy</Button>
            {/if}
        </div>
    </article>
{:else}
    <LoadingPage />
{/if}

<style>
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
        border-radius: inherit;
    }

    .text-display.loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Copy Button */

    .copy-input {
        position: absolute;
        bottom: 8px;
        right: 8px;
    }

    :global(.copy-input .btn) {
        border: none !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    :global(.copy-input .btn.secondary) {
        background-color: var(--bg4) !important;
    }

    :global(.copy-input .btn:hover) {
        color: var(--text-light) !important;
    }

    :global(.copy-input .btn:not(.primary)) {
        opacity: 0;
    }

    :global(.text-display:hover .copy-input .btn),
    :global(.text-display.focus-visible .copy-input .btn),
    :global(.copy-input .btn.focus-visible) {
        opacity: 1;
    }
</style>
<script>
    // NOTES: preventing the default click event behavior is needed to stop the change event being fired twice when the spacebar is pressed.
    import {handleKeyboardToggle, checkItem} from "../stores/controls.js";

    export let checked = false;
    export let label = undefined; // eslint-disable-line no-undef-init

    let checkbox;

    function handleKeyDown(e) {
        if (e.key === " ") {
            e.preventDefault();
            checkItem(checkbox);
        }
    }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<!-- https://github.com/sveltejs/svelte/issues/5528 -->
<label class="checkbox-container" on:keypress={handleKeyboardToggle(checkbox)}>
    <div class="checkbox-inner">
        <input class="checkbox" type="checkbox" bind:this={checkbox} bind:checked on:change on:keydown={handleKeyDown} {...$$restProps} />
        <svg class="checkbox-glyph" viewBox="0 0 24 24">
            <path d="M0.73, 11.91 8.1,19.28 22.79,4.59" fill="none"/>
        </svg>
    </div>
    {#if label}
        <span class="checkbox-label">{label}</span>
    {/if}
</label>

<style>
    .checkbox-container {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .checkbox-label {
        display: inline-block;
        color: var(--text-normal);
        font-size: 13px;
        line-height: normal;
        font-weight: 400;
    }

    .checkbox-inner {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 8px;
    }

    .checkbox-glyph {
        position: absolute;
        width: 12px;
        height: 12px;
        color: #fff;
    }

    .checkbox-glyph path {
        transform: scale(0.8);
        transform-origin: center;
        stroke: currentColor;
        stroke-width: 2.45;
        stroke-dasharray: 32;
        stroke-dashoffset: 32;
    }

    .checkbox {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        -webkit-appearance: none;
        appearance: none;
        box-sizing: border-box;
        flex: 0 0 auto;
        margin: 0;
        border-radius: 2px;
        width: 20px;
        height: 20px;
        border: 1px solid var(--bg4);
    }

    .checkbox:active {
        background-color: var(--bg3);
    }

    .checkbox:checked {
        background-color: var(--accent);
        border-color: var(--accent);
    }

    .checkbox:checked + .checkbox-glyph path {
        transition: 250ms cubic-bezier(0.55, 0, 0, 1) stroke-dashoffset;
        stroke-dashoffset: 0;
    }

    .checkbox:checked:active {
        background-color: var(--accent-hover);
        border-color: var(--accent-hover);
    }
</style>
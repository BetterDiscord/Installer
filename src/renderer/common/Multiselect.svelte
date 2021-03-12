<script>
    import Button from "./Button.svelte";
    import {createEventDispatcher} from "svelte";
    
    export let value;
    export let disabled = false;
    export let checked = false;

    const dispatch = createEventDispatcher();
    function click() {
        dispatch("click", value);
    }
</script>

<label class="check-container">
    <input type="checkbox" hidden {disabled} {checked} on:change {value}>
    <div class="check-item" class:disabled>
        <div class="icon-wrapper"><slot name="icon" /></div>
        <div class="check-item-label">
            <span><slot name="label" /></span>
            <span class="details"><slot /></span>
            
        </div>
        <div class="right">
            <Button type="secondary" on:click={click}>Browse</Button>
        </div>
    </div>
</label>

<style>
    .check-item {
        display: flex;
        align-items: center;
        border-radius: 3px;
        background-color: var(--bg3);
        padding: 12px;
        margin-bottom: 12px;
        color: var(--text-normal);
        font-weight: 500;
        font-size: 13px;
        user-select: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: 100ms ease;
        flex-wrap: nowrap;
        position: relative;
        overflow: hidden;
    }

    .check-item:hover {
        color: var(--text-light);
    }

    .check-item.disabled {
        background-color: var(--bg2-alt);
    }

    .check-item.disabled .check-item-label,
    .check-item.disabled .icon-wrapper {
        opacity: 0.5;
    }

    .right {
        /* position: absolute;
        right: 12px; */
        margin-left: auto;
    }

    /* .end {
        margin-left: auto;
        background: none;
        outline: 0;
        border: 1px solid var(--text-muted);
        color: var(--text-normutedmal);
        cursor: pointer;
    } */

    .check-item-label {
        display: flex;
        flex-direction: column;
        margin-left: 10px;
        overflow: hidden;
    }

    /* .check-item span {margin-left: 10px} */

    .details {
        color: var(--text-muted);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* margin-left: 10px; */
    }

    .check-container input:checked + .check-item {
        color: #fff;
        background-color: var(--accent);
    }
</style>
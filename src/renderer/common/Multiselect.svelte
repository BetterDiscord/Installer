<script>
    import Button from "./Button.svelte";
    import {createEventDispatcher} from "svelte";
    
    export let value;
    export let title = "Unknown";
    export let description;
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
        <div class="icon">
            <slot name="icon" />
        </div>
        <div class="content">
            <h5>{title}</h5>
            <span title={description}>{description}</span>
        </div>
        <div class="button">
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
        user-select: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: 100ms ease;
        flex-wrap: nowrap;
        position: relative;
        overflow: hidden;
    }

    .check-container {
        margin-bottom: 12px;
    }

    .check-container:last-child {
        margin: 0;  
    }

    .check-item.disabled {
        background-color: var(--bg2-alt);
        cursor: not-allowed;
    }
    
    .check-container input:checked + .check-item {
        background-color: var(--accent);
    }

    .check-item.disabled .content,
    .check-item.disabled .icon {
        opacity: 0.5;
        pointer-events: none;
    }

    .button,
    .icon {
        flex: 0 0 auto;
    }

    :global(.icon img) {
        width: 32px;
        height: 32px;
    }

    .content {
        display: flex;
        flex-direction: column;
        margin: 0 10px;
        overflow: hidden;
        flex: 1 1 auto;
    }

    .content span,
    .content h5 {
        transition: 100ms ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: normal;
    }

    .content span {
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 400;
    }

    .content h5 {
        color: var(--text-normal);
        font-weight: 600;
        font-size: 13px;
        margin: 0;
    }

    .check-item:not(.disabled):hover .content h5 {
        color: var(--text-light);
    }

    .check-item:not(.disabled):hover .content span {
        color: var(--text-normal);
    }

    .check-container input:checked + .check-item .content h5,
    .check-container input:checked + .check-item .content span {
        color: #fff;
    }

    :global(.check-container input:checked + .check-item .btn) {
        background-color: #fff;
        border-color: transparent;
        color: var(--accent);
    }

    :global(.check-container input:checked + .check-item .btn:active) {
        opacity: .8;
    }
</style>
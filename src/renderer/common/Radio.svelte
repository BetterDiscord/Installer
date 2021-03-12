<script>  
    export let group;
    export let value;
</script>

<label class="radio-container">
    <input type="radio" hidden bind:group on:change {value}>
    <div class="radio-item">
        <slot name="icon"></slot>
        <slot></slot>
    </div>
</label>

<style>
    .radio-item {
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
    }

    .radio-item:hover {
        color: var(--text-light);
    }

    :global(.radio-item svg) {
        width: 16px;
        height: 16px;
        margin-right: 10px;
    }

    .radio-container input:checked + .radio-item {
        color: #fff;
        background-color: var(--accent);
    }
</style>
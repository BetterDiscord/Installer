<script>
    export let type = "secondary";
    export let disabled = false;
</script>

<button type="button"{disabled} on:keypress on:click|preventDefault|stopPropagation class="btn {(type == "primary" || type == "secondary") ? type : "secondary"}">
    <span>
        <slot></slot>
    </span>
</button>

<style>
    .btn {
        width: auto;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        transition: 150ms ease;
        cursor: pointer;
        padding: 0 12px;
        height: 28px;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 400;
        border-radius: 2px;
    }

    .btn[disabled] {
        opacity: .5;
        pointer-events: none;
    }

    .btn span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .btn.primary {
        border: 1px solid transparent;
        background-color: var(--accent);
        color: #ffffff;
    }

    .btn.primary:hover {
        background-color: var(--accent-hover);
    }

    .btn.secondary {
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--text-normal);
    }

    .btn.secondary:hover {
        border-color: rgba(255, 255, 255, 0.1);
    }
</style>
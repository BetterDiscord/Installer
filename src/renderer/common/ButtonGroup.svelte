<div class="btn-group">
    <slot></slot>
</div>

<style>
    .btn-group {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: -5px;
        margin-right: -5px;
    }

    :global(.btn-group > *) {
        margin-top: 5px;
        margin-right: 5px;
    }
</style>
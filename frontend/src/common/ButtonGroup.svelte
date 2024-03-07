<div class="button-group" {...$$restProps}>
    <slot></slot>
</div>

<style>
    .button-group {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: -5px;
        margin-right: -5px;
    }

    :global(.button-group > *) {
        margin-top: 5px;
        margin-right: 5px;
    }
</style>
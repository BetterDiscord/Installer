<script>
    export let hasMargin;
</script>

<h3 class="{(hasMargin == true) ? 'has-margin' : undefined} header">
    <slot></slot>
</h3>

<style>
    .header {
        margin: 0;
        color: var(--text-light);
        font-weight: 600;
        font-size: 16px;
        line-height: normal;
    }

    .header.has-margin {
        margin-bottom: 14px;
    }
</style>
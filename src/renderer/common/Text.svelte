<script>
    export let hasMargin = undefined;;
    export let type = "paragraph";
    let className = undefined;
    export { className as class };
</script>

{#if type === "header"}
    <h3 class="header {className}" class:has-margin={hasMargin} {...$$restProps}>
        <slot/>
    </h3>
    {:else if type === "paragraph"}
    <p class="paragraph {className}" class:has-margin={hasMargin} {...$$restProps}>
        <slot/>
    </p>
    {:else if type === "subtext"}
    <span class="subtext {className}" class:has-margin={hasMargin} {...$$restProps}>
        <slot/>
    </span>
{/if}

<style>
    .header,
    .paragraph,
    .subtext {
        margin: 0;
        line-height: normal;
    }

    .has-margin {
        margin-bottom: 10px;
    }

    .header {
        color: var(--text-light);
        font-weight: 600;
        font-size: 16px;
    }

    .paragraph {
        color: var(--text-normal);
        font-weight: 400;
        font-size: 14px;
    }

    .subtext {
        color: var(--text-muted);
        font-weight: 400;
        font-size: 12px;
    }
</style>
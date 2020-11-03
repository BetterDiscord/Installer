<script>
    import Button from '../common/Button.svelte';
    import ButtonGroup from '../common/ButtonGroup.svelte';
    import Checkbox from '../common/Checkbox.svelte';
    import SocialLinks from '../common/SocialLinks.svelte';

    export let hasLicense = false;

    let hasAgreed = false;
    function toggleAgree({detail}) {
        hasAgreed = detail;
    }

</script>

<footer class="install-footer">
    {#if hasLicense}
        <Checkbox label="I accept the license agreement." on:change={toggleAgree} />
    {:else}
        <SocialLinks/>
    {/if}

    <ButtonGroup>
        {#if hasLicense == true}
            <Button type="secondary" on:click={()=>{alert('closed :)')}}>Close</Button>
            <Button type="primary" disabled={!hasAgreed}>Next</Button>
        {:else}
            <Button type="secondary">Back</Button>
            <Button type="primary">Next</Button>
        {/if}
    </ButtonGroup>
</footer>

<style>
    .install-footer {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        flex: 0 0 auto;
        margin-top: 10px;
    }
</style>
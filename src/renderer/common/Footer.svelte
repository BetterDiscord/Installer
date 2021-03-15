<script>
    import quit from "../actions/quit";
    import Button from "./Button.svelte";
    import ButtonGroup from "./ButtonGroup.svelte";
    import SocialLinks from "./SocialLinks.svelte";
    import {canGoForward, canGoBack, nextPage} from "../stores/navigation";
    import {push, pop} from "svelte-spa-router";

    let hasAgreed = false;
    function toggleAgree({detail}) {
        hasAgreed = detail;
    }

    async function goToNext() {
        if ($nextPage) push($nextPage);
        else quit();
    }

    function goBack() {
        pop();
    }

</script>

<footer class="install-footer">
    <SocialLinks/>
    <ButtonGroup>
        <Button type="secondary" disabled={!$canGoBack} on:click={goBack}>Back</Button>
        <Button type="primary" disabled={!$canGoForward} on:click={goToNext}>{#if $nextPage}Next{:else}Close{/if}</Button>
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
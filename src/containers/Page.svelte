<script>
    import Footer from '../containers/Footer.svelte';
    import LoadingPage from '../pages/Loading.svelte';
    import LicensePage from '../pages/License.svelte';
    import ActionsPage from '../pages/Actions.svelte';
    import PlatformsPage from '../pages/Platforms.svelte';
    import RepairPage from '../pages/Repair.svelte';
    import UninstallPage from '../pages/Uninstall.svelte';
    import InstallPage from '../pages/Install.svelte';

    // Temporary page test
    let currentPage = LicensePage;
</script>

<section class="page">
    <svelte:component this={currentPage}/>
</section>

{#if currentPage == LicensePage}
    <Footer hasLicense/>
{:else if currentPage != LoadingPage}
    <Footer/>
{/if}

<style>
    .page {
        flex: 1 1 auto;
        overflow: auto;
    }
</style>
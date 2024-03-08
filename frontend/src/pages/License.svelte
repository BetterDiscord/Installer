<script>
    import PageHeader from "../common/PageHeader.svelte";
    import page from "../transitions/page.js";
    import Checkbox from "../common/Checkbox.svelte";
    import TextDisplay from "../common/TextDisplay.svelte";
    // import fs from "fs";
    // import path from "path";
    import {canGoBack, canGoForward, nextPage, hasLoaded} from "../stores/navigation";
    import {hasAgreed} from "../stores/installation";
    import {onMount} from "svelte";

    onMount(() => {
        hasLoaded.set(true); // Use this to avoid initial transition caused by router
    });

    if (!$hasAgreed) canGoForward.set(false);
    else canGoForward.set(true);
    canGoBack.set(false);

    function toggleAgree({target}) {
        hasAgreed.set(target.checked);
        canGoForward.set(target.checked);
    }

    nextPage.set("/actions");

    const licenseText = __INSTALLER_LICENSE__;

</script>

<section class="page" in:page="{{duration: $hasLoaded ? undefined : 0}}" out:page="{{out: true}}">
    <!-- svelte-ignore component-name-lowercase -->
    <PageHeader>
        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 6.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/>
            <path d="M13.032 2.325a1.75 1.75 0 0 0-2.064 0L3.547 7.74c-.978.713-.473 2.26.736 2.26H4.5v5.8A2.75 2.75 0 0 0 3 18.25v1.5c0 .413.336.75.75.75h16.5a.75.75 0 0 0 .75-.75v-1.5a2.75 2.75 0 0 0-1.5-2.45V10h.217c1.21 0 1.713-1.547.736-2.26l-7.421-5.416zm-1.18 1.211a.25.25 0 0 1 .295 0L18.95 8.5H5.05l6.803-4.964zM18 10v5.5h-2V10h2zm-3.5 0v5.5h-1.75V10h1.75zm-3.25 0v5.5H9.5V10h1.75zm-5.5 7h12.5c.69 0 1.25.56 1.25 1.25V19h-15v-.75c0-.69.56-1.25 1.25-1.25zM6 15.5V10h2v5.5H6z"/>
        </svg>
        License Agreement
    </PageHeader>
    <TextDisplay value={licenseText} />
    <Checkbox checked={$hasAgreed} label="I accept the license agreement." on:change={toggleAgree} />
</section>
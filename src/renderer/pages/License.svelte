<script>
    import Header from "../common/Header.svelte";
    import page from "../transitions/page.js";
    import Checkbox from "../common/Checkbox.svelte";
    import TextDisplay from "../common/TextDisplay.svelte";
    import fs from "fs";
    import path from "path";
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

    let licenseText = "";

    function readLicenseFile() {
        fs.readFile(path.join(__static, "/license.txt"), (err, data) => {
            if (err) return licenseText = "See license at https://github.com/rauenzi/BetterDiscordApp/blob/master/LICENSE";
            licenseText = data;
        });
    }

    // setTimeout(readLicenseFile, 5000); // Use for testing spinner
    readLicenseFile();
</script>

<section class="page" in:page="{{duration: $hasLoaded ? undefined : 0}}" out:page="{{out: true}}">
    <Header hasMargin>License Agreement</Header>
    <TextDisplay value={licenseText} />
    <Checkbox checked={$hasAgreed} disabled={!licenseText} label="I accept the license agreement." on:change={toggleAgree} />
</section>
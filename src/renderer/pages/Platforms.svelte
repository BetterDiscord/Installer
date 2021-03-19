<script>
    import {page} from "../common/PageTransition.svelte";
    import Header from "../common/Header.svelte";
    import Multiselect from "../common/Multiselect.svelte";
    import {canGoBack, canGoForward, nextPage} from "../stores/navigation";
    import {action, platforms, paths} from "../stores/installation";
    import {platforms as platformLabels, validatePath, getBrowsePath} from "../actions/paths";
    import {remote} from "electron";

    if (Object.values($platforms).some(r => r)) canGoForward.set(true);
    else canGoForward.set(false);
    canGoBack.set(true);
    nextPage.set(`/${$action}`);

    function change({target}) {
        platforms.update(s => {
            s[target.value] = target.checked;
            return s;
        });

        if (Object.values($platforms).some(r => r)) canGoForward.set(true);
        else canGoForward.set(false);
    }

    async function click(event) {
        const platform = event.detail;
        const result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: `Browsing to ${platformLabels[platform]}`,
            defaultPath: getBrowsePath(platform),
            properties: ["openDirectory", "treatPackageAsDirectory"]
        });
        if (result.canceled || !result.filePaths[0]) return;

        const resourcesPath = validatePath(platform, result.filePaths[0]);
        paths.update(obj => {
            obj[platform] = resourcesPath;
            return obj;
        });
    }
</script>

<section class="page" in:page="{{x: 550, duration: 250}}" out:page="{{x: -550, duration: 250}}">
    <Header hasMargin>Choose Discord Versions</Header>

    {#each Object.entries(platformLabels) as [channel, label]}
        <Multiselect title={label} description={($paths[channel]) ? $paths[channel] : "Not Found"} on:change={change} on:click={click} value={channel} checked={$paths[channel] && $platforms[channel]} disabled={!$paths[channel]}>
            <img src="images/{channel}.png" slot="icon" alt="Platform Icon" />
        </Multiselect>
    {/each}
</section>
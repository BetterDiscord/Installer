<script lang="ts">
    import Multiselect from "$lib/components/Multiselect.svelte";
    import app from "$lib/stores/state.svelte";
    import {BrowseForDiscord as findDiscordDialog} from "@backend/dialogservice";

    import stableUrl from "@assets/images/stable.png";
    import canaryUrl from "@assets/images/canary.png";
    import ptbUrl from "@assets/images/ptb.png";
    import {labels, type DiscordChannel} from "$lib/types";
    import Page from "$lib/components/Page.svelte";


    const imageUrls: Record<DiscordChannel, string> = {stable: stableUrl, canary: canaryUrl, ptb: ptbUrl};

    const nextLabel = $derived(app.action[0].toUpperCase() + app.action.slice(1));
    async function click(platform: DiscordChannel) {
        const resourcesPath = await findDiscordDialog(platform);
        app.corePaths[platform] = resourcesPath;
        app.channels[platform] = Boolean(resourcesPath);
    }
</script>

<Page title="Choose Discord Versions" previous="/actions" next="/actions/perform/{app.action}" {nextLabel} canGoNext={Object.values(app.channels).some(r => r)}>
    {#snippet icon()}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M17.75 3C19.5449 3 21 4.45507 21 6.25V12.0218C20.5368 11.7253 20.0335 11.4858 19.5 11.3135V8.5H4.5V17.75C4.5 18.7165 5.2835 19.5 6.25 19.5H11.3135C11.4858 20.0335 11.7253 20.5368 12.0218 21H6.25C4.45507 21 3 19.5449 3 17.75V6.25C3 4.45507 4.45507 3 6.25 3H17.75ZM17.75 4.5H6.25C5.2835 4.5 4.5 5.2835 4.5 6.25V7H19.5V6.25C19.5 5.2835 18.7165 4.5 17.75 4.5Z" />
            <path d="M23 17.5C23 20.5376 20.5376 23 17.5 23C14.4624 23 12 20.5376 12 17.5C12 14.4624 14.4624 12 17.5 12C20.5376 12 23 14.4624 23 17.5ZM20.8536 15.1464C20.6583 14.9512 20.3417 14.9512 20.1464 15.1464L16.5 18.7929L14.8536 17.1464C14.6583 16.9512 14.3417 16.9512 14.1464 17.1464C13.9512 17.3417 13.9512 17.6583 14.1464 17.8536L16.1464 19.8536C16.3417 20.0488 16.6583 20.0488 16.8536 19.8536L20.8536 15.8536C21.0488 15.6583 21.0488 15.3417 20.8536 15.1464Z" />
        </svg>
    {/snippet}

    {#each Object.entries(labels) as [channel, label] (channel)}
        <Multiselect
            onclick={() => click(channel as DiscordChannel)}
            description={app.corePaths[channel as DiscordChannel] || "Not Found"}
            bind:checked={app.channels[channel as DiscordChannel]}
            disabled={!app.corePaths[channel as DiscordChannel]}
        >
            {#snippet icon()}
                <img src={imageUrls[channel as DiscordChannel]} alt="Platform Icon" />
            {/snippet}
            {label}
        </Multiselect>
    {/each}
</Page>
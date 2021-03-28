<script>
    // import Page from "./containers/Page.svelte";
    import Titlebar from "./common/Titlebar.svelte";
    import Footer from "./common/Footer.svelte";
    import Router from "svelte-spa-router";
    import routes from "./routes";
    require("focus-visible");
</script>

<div class="main-window platform-{process.platform}">
    {#if process.platform == "darwin"}
        <Titlebar macButtons />
    {:else}
        <Titlebar />
    {/if}
    <main class="installer-body">
        <div class="sections">
            <Router {routes} />
        </div>
        <Footer />
    </main>
</div>

<style>
    @import url('https://rsms.me/inter/inter.css');

    :global(.focus-visible) {
        box-shadow: 0 0 0 4px var(--accent-faded) !important;
    }

    :root {
        --bg1: #040405;
        --bg2: #0c0d10;
        --bg2-alt: #101116;
        --bg3: #14151b;
        --bg3-alt: #191a21;
        --bg4: #20212b;
        --text-light: #f1f1f1;
        --text-normal: #bfc4c9;
        --text-muted: #95989d;
        --accent: #3a71c1;
        --accent-hover: #2f5b9d;
        --accent-faded: rgba(58, 113, 193, .4);
    }

    :global(html),
    :global(body),
    :global(#app) {
        overflow: hidden;
        margin: 0;
        height: 100%;
        width: 100%;
    }

    :global(*),
    :global(*::after),
    :global(*::before) {
        box-sizing: border-box;
        -webkit-user-drag: none;
        font-family: "Inter", sans-serif;
        user-select: none;
        outline: none;
    }

    :global(a) {
        color: var(--accent);
        text-decoration: none;
    }

    :global(::selection) {
        background-color: var(--accent-faded);
        color: var(--text-normal);
    }

    :global(::-webkit-scrollbar) {
        width: 4px;
    }

    :global(::-webkit-scrollbar-thumb) {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background-color: rgba(255, 255, 255, 0.075);
    }

    :global(::-webkit-scrollbar-thumb:active) {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .main-window {
        display: flex;
        flex-direction: column;
        /* border-radius: 3px; */
        overflow: hidden;
        contain: strict;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
        /* margin: 11.5px 7.5px; */
        width: 100%;
        height: 100%;
    }

    .main-window.platform-darwin {
        border-radius: 0;
        box-shadow: none;
        width: 100%;
        height: 100%;
        margin: 0;
    }

    .installer-body {
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        z-index: 1;
        padding: 20px;
        background: radial-gradient(var(--bg2) 50%, var(--bg2-alt));
        flex: 1;
    }

    .installer-body::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: var(--background);
        background-size: 60px;
        background-repeat: repeat;
        background-position: center;
        z-index: -1;
        opacity: 0.35;
        pointer-events: none;
        mask: radial-gradient(transparent, #000);
        -webkit-mask: radial-gradient(transparent, #000);
    }

    :global(.page) {
        flex: 1 1 auto;
        overflow: visible;
        display: flex;
        flex-direction: column;
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .sections {
        flex: 1 1 auto;
        overflow: visible;
        position: relative;
    }
</style>
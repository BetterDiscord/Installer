<script>
    // import Page from "./containers/Page.svelte";
    import Titlebar from "./common/Titlebar.svelte";
    import Footer from "./common/Footer.svelte";
    import Router from "svelte-spa-router";
    import routes from "./routes";
</script>

<div class="main-window platform-{process.platform}">
    {#if process.platform == 'darwin'}
        <Titlebar macButtons />
    {:else}
        <Titlebar />
    {/if}
    <main class="installer-body">
        <section class="page">
            <Router {routes} />
        </section>
        <Footer />
    </main>
</div>

<style>
    // Variables and imports
    @import url('https://rsms.me/inter/inter.css');
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');

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
    }

    // General styling applied everywhere
    :global {
        html,
        body,
        #app {
            font-family: "Inter", sans-serif;
            overflow: hidden;
            margin: 0;
            height: 100%;
            width: 100%;
        }

        *,
        *::after,
        *::before {
            box-sizing: border-box;
            -webkit-user-drag: none;
            user-select: none;
            outline: none;
        }

        a {
            color: var(--accent);
            text-decoration: none;
        }

        ::selection {
            background-color: var(--accent);
            color: #fff;
        }

        ::-webkit-scrollbar {
            width: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.075);
        }

        ::-webkit-scrollbar-thumb:active {
            background-color: rgba(255, 255, 255, 0.1);
        }
    }


    // Window background and page configuration
    .main-window {
        display: flex;
        flex-direction: column;
        border-radius: 3px;
        overflow: hidden;
        contain: strict;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
        margin: 11.5px 7.5px;
        width: calc(100% - 15px);
        height: calc(100% - 23px);
        &.platform-darwin {
            border-radius: 0;
            box-shadow: none;
            width: 100%;
            height: 100%;
            margin: 0;
        }
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
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('images/background.png');
            z-index: -1;
            opacity: 0.35;
            pointer-events: none;
            mask: radial-gradient(transparent, #000);
            -webkit-mask: radial-gradient(transparent, #000);
        }
    }

    .page {
        flex: 1 1 auto;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
</style>
<script>
    // import Page from "./containers/Page.svelte";
    import Titlebar from "./common/Titlebar.svelte";
    import Footer from "./common/Footer.svelte";
    import Router from "svelte-spa-router";
    import routes from "./routes";
</script>

<div class="main-window">
    <Titlebar />
    <main class="installer-body">
        <section class="page">
            <Router {routes} />
        </section>
        <Footer />
    </main>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

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

    :global(body) {
        border-radius: 3px;
        overflow: hidden;
        contain: strict;
        box-shadow: rgb(0 0 0 / 2%) 0px 0.221381px 0.304398px 0px, rgb(0 0 0 / 4%) 0px 0.532008px 0.731511px 0px, rgb(0 0 0 / 4%) 0px 1.00172px 1.37737px 0px, rgb(0 0 0 / 6%) 0px 1.7869px 2.45699px 0px, rgb(0 0 0 / 6%) 0px 3.34221px 4.59554px 0px, rgb(0 0 0 / 9%) 0px 8px 11px 0px;
        margin: 10px;
        width: calc(100% - 24px);
        height: calc(100% - 24px);
    }

    :global(html),
    :global(#app) {
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
        overflow: hidden;
        height: 100%;
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
        background-image: url('images/background.png');
        z-index: -1;
        opacity: 0.35;
        pointer-events: none;
        mask: radial-gradient(transparent, #000);
        -webkit-mask: radial-gradient(transparent, #000);
    }

    .page {
        flex: 1 1 auto;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
</style>
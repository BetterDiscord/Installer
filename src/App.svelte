<script>
    import Page from './containers/Page.svelte';
</script>

<main class="installer-body">
    <Page/>
</main>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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

    :global(*),
    :global(*::after),
    :global(*::before) {
        box-sizing: border-box;
        -webkit-user-drag: none;
        font-family: "Inter", sans-serif;
        user-select: none;
        outline: none;
    }

    .installer-body {
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        z-index: 1;
        padding: 20px;
        background: radial-gradient(var(--bg2) 50%, var(--bg2-alt));
        width: 500px;
        height: 300px;
    }

    .installer-body::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('../assets/images/background.png');
        z-index: -1;
        opacity: 0.35;
        pointer-events: none;
        mask: radial-gradient(transparent, #000);
        -webkit-mask: radial-gradient(transparent, #000);
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
</style>
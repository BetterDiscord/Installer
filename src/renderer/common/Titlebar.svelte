<script>
    import {remote} from "electron";
    import quit from "../actions/quit";

    function minimize() {
        remote.BrowserWindow.getFocusedWindow().minimize();
    }

</script>

<header class="titlebar">
        <button on:click={minimize}>&ndash;</button>
        <button on:click={quit} class="danger">&times;</button>
</header>

<style>
    .titlebar {
        background-color: #0C0D10;
        color: white;
        height: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        -webkit-app-region: drag;
    }

    button {
        -webkit-app-region: no-drag;
        height: 20px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        transition: 150ms ease background;
        padding: 0 12px;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 400;
        background-color: transparent;
        color: var(--text-normal);
    }

    button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    button.danger:hover {
        background-color: rgba(255, 0, 0, 0.2);
    }
</style>
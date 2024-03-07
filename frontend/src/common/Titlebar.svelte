<script>
    import {remote} from "electron";
    import quit from "../actions/quit";
    import {version} from "../../../package.json";

    export let macButtons;

    function minimize() {
        remote.BrowserWindow.getFocusedWindow().minimize();
    }

</script>

<header class="titlebar {macButtons === true ? "type-mac" : "type-standard"}">
    <svg class="wordmark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2000 2000">
        <path d="M1402.2,631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442,398V490.7h257c274.5,0,274.5,344.9,0,344.9H597.6v329.5h169.8c274.5,0,274.5,344.8,0,344.8h-699v354.9h691.2c356.3,0,632.8-142.6,642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7,915.8,1402.2,794.3,1402.2,631.7z"/>
        <path d="M1262.5,135.2L1262.5,135.2l-76.8,0c26.6,13.3,51.7,28.1,75,44.3c70.7,49.1,126.1,111.5,164.6,185.3c39.9,76.6,61.5,165.6,64.3,264.6l0,1.2v1.2c0,141.1,0,596.1,0,737.1v1.2l0,1.2c-2.7,99-24.3,188-64.3,264.6c-38.5,73.8-93.8,136.2-164.6,185.3c-22.6,15.7-46.9,30.1-72.6,43.1h72.5c346.2,1.9,671-171.2,671-567.9V716.7C1933.5,312.2,1608.7,135.2,1262.5,135.2z"/>
    </svg>
    <span class="title">BetterDiscord Installer v{version}</span>
    <div class="window-controls">
        {#if macButtons === true}
            <button tabindex="-1" on:click={quit} id="close">
                <svg width="12" height="12" viewBox="0 0 12 12">
                    <path stroke="#4c0000" fill="none" d="M8.5,3.5 L6,6 L3.5,3.5 L6,6 L3.5,8.5 L6,6 L8.5,8.5 L6,6 L8.5,3.5 Z"></path>
                </svg>
            </button>
            <button tabindex="-1" on:click={minimize} id="minimize">
                <svg width="12" height="12" viewBox="0 0 12 12">
                    <rect fill="#975500" width="6" height="1" x="3" y="5.5" fill-rule="evenodd"></rect>
                </svg>
            </button>
            <button id="maximize" disabled></button>
        {:else}
            <button tabindex="-1" on:click={minimize} id="minimize">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2 9.75C2 9.33579 2.33579 9 2.75 9H17.25C17.6642 9 18 9.33579 18 9.75C18 10.1642 17.6642 10.5 17.25 10.5H2.75C2.33579 10.5 2 10.1642 2 9.75Z"/>
                </svg>
            </button>
            <button tabindex="-1" on:click={quit} id="close">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M3.52499 3.71761L3.61612 3.61612C4.07173 3.1605 4.79155 3.13013 5.28239 3.52499L5.38388 3.61612L14 12.233L22.6161 3.61612C23.1043 3.12796 23.8957 3.12796 24.3839 3.61612C24.872 4.10427 24.872 4.89573 24.3839 5.38388L15.767 14L24.3839 22.6161C24.8395 23.0717 24.8699 23.7915 24.475 24.2824L24.3839 24.3839C23.9283 24.8395 23.2085 24.8699 22.7176 24.475L22.6161 24.3839L14 15.767L5.38388 24.3839C4.89573 24.872 4.10427 24.872 3.61612 24.3839C3.12796 23.8957 3.12796 23.1043 3.61612 22.6161L12.233 14L3.61612 5.38388C3.1605 4.92827 3.13013 4.20845 3.52499 3.71761L3.61612 3.61612L3.52499 3.71761Z"/>
                </svg>
            </button>
        {/if}
    </div>
</header>

<style>
    .titlebar {
        background-color: var(--bg2);
        color: white;
        height: 28px;
        display: flex;
        align-items: center;
        -webkit-app-region: drag;
    }

    .wordmark {
        width: 15px;
        height: auto;
        margin: 0 8px;
        fill: var(--text-muted);
        opacity: .5;
    }

    .title {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
        color: var(--text-muted);
        font-size: 14px;
    }

    .window-controls {
        display: flex;
        align-items: center;
        margin-left: auto;
        -webkit-app-region: no-drag;
    }

    .window-controls button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
    }

    /* Standard Titlebar */

    .type-standard button {
        height: 28px;
        width: 40px;
        transition: 50ms ease;
        background-color: transparent;
        color: var(--text-muted);
    }

    .type-standard button svg {
        width: 12px;
        height: 12px;
        fill: currentColor;
    }

    .type-standard button:hover {
        background-color: var(--bg3);
    }

    .type-standard button:active {
        background-color: var(--bg3-alt);
    }

    .type-standard button#close:hover {
        background-color: #d13d3d;
        color: #fff;
    }

    .type-standard button#close:active {
        background-color: #b12a2a;
        color: #fff;
    }

    /* Mac Titlebar */

    .type-mac {
        justify-content: space-between;
    }

    .type-mac .window-controls {
        order: -1;
        margin: 0 3px;
    }

    .type-mac .window-controls button {
        margin: 0 4px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-size: auto 12px;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
    }

    .type-mac .window-controls svg {
        visibility: hidden;
        width: 12px;
        height: 12px;
    }

    .type-mac .window-controls:hover svg {
        visibility: visible;
    }

    .type-mac .window-controls button:not([disabled]):active {
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 0 0 12px rgba(0,0,0,0.25);
    }

    .type-mac .window-controls #close {
        margin-left: 6px;
        background-color: #ff5e57;
    }

    .type-mac .window-controls #minimize {
        background-color: #ffbb2e;
    }

    .type-mac .window-controls button[disabled] {
        background-color: var(--bg3-alt);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.012);
    }
</style>
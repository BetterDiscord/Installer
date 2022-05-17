<script>
    import {remote} from "electron";
    import quit from "../actions/quit";

    export let macButtons;

    function minimize() {
        remote.BrowserWindow.getFocusedWindow().minimize();
    }

</script>

<header class="titlebar {macButtons === true ? "type-mac" : "type-standard"}">

    <svg class="wordmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 447" id="1ff83782"><path fill="#99AAB5" d="M221,117.1l-33.8-33.8l70-70c9.3-9.3,24.5-9.3,33.8,0l0,0c9.3,9.3,9.3,24.5,0,33.8L221,117.1L221,117.1z"/><path fill="#23272A" d="M216.3,121.7l-33.8-33.8c-2.6-2.6-2.6-6.8,0-9.3l70-70c11.9-11.9,31.2-11.9,43.1,0s11.9,31.2,0,43.1l-70,70 C223,124.3,218.9,124.3,216.3,121.7z M196.5,83.3l24.5,24.5l65.3-65.3c6.7-6.7,6.7-17.7,0-24.5c-6.7-6.7-17.7-6.7-24.5,0L196.5,83.3 L196.5,83.3z"/><path fill="#99AAB5" d="M312.7,208.8L278.9,175l70-70c9.3-9.3,24.5-9.3,33.8,0l0,0c9.3,9.3,9.3,24.5,0,33.8L312.7,208.8L312.7,208.8z"/><path fill="#23272A" d="M308,213.4l-33.8-33.8c-2.6-2.6-2.6-6.8,0-9.3l70-70c11.9-11.9,31.2-11.9,43.1,0s11.9,31.2,0,43.1l-70,70 C314.8,216,310.6,216,308,213.4z M288.2,175l24.5,24.5l65.3-65.3c6.7-6.7,6.7-17.7,0-24.5s-17.7-6.7-24.5,0L288.2,175L288.2,175z"/><path fill="#23272A" d="M303,257L138.9,92.9c-2.7-2.7-2.7-7,0-9.7L163,59.1c2.7-2.7,7-2.7,9.7,0l164.1,164.1c2.7,2.7,2.7,7,0,9.7 L312.7,257C310,259.7,305.7,259.7,303,257z M153.4,88.1l154.5,154.5l14.5-14.5L167.9,73.6L153.4,88.1z"/><path fill="#7289DA" d="M161.2,327.6l-92.9-92.9c-14.3-14.3-14.3-37.6,0-51.9l85.1-85.1l144.8,144.8l-85.1,85.1 C198.8,342,175.5,342,161.2,327.6z"/><path fill="#23272A" d="M156.4,332.4l-92.9-92.9c-17-17-17-44.6,0-61.6l85.1-85.1c2.7-2.7,7-2.7,9.7,0L303,237.7c2.7,2.7,2.7,7,0,9.7 L218,332.4C201,349.4,173.3,349.4,156.4,332.4z M153.4,107.4l-80.2,80.2c-11.7,11.7-11.7,30.6,0,42.3l92.9,92.9 c11.7,11.7,30.6,11.7,42.3,0l80.2-80.2L153.4,107.4z"/><path fill="#23272A" d="M95.4,329.5l-29-29c-2.7-2.7-2.7-7,0-9.7l29-29c2.7-2.7,7-2.7,9.7,0l29,29c2.7,2.7,2.7,7,0,9.7l-29,29 C102.4,332.1,98.1,332.1,95.4,329.5z M81,295.7l19.3,19.3l19.3-19.3l-19.3-19.3L81,295.7z"/><path fill="#23272A" d="M143.7,445.3L81,382.6c-21.3-21.3-21.3-55.9,0-77.2c2.7-2.7,7-2.7,9.7,0c2.7,2.7,2.7,7,0,9.7 c-16,16-16,42,0,57.9l62.8,62.8c2.7,2.7,2.7,7,0,9.7S146.4,448,143.7,445.3z"/><path fill="#23272A" transform="rotate(-45.001 237.859 158.089)" d="M220.8 42H254.9V274.1H220.8z"/><path fill="#23272A" transform="rotate(-45.001 100.275 295.663)" d="M79.8 275.2H120.8V316.2H79.8z"/></svg>

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
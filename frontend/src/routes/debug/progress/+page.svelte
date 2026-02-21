<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import {Window} from "@wailsio/runtime";
    import {onMount} from "svelte";

    onMount(() => {
        // eslint-disable-next-line new-cap
        void Window.SetSize(1100, 700);
        // eslint-disable-next-line new-cap
        setTimeout(() => void Window.Center(), 100);
    });

    let progress = $state(0);
    let status = $state("default");

    function getRndInteger(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function animate() {
        setTimeout(() => {progress = 10;}, 200);
        setTimeout(() => {progress = 25;}, 500);
        setTimeout(() => {progress = 50;}, 1300);
        setTimeout(() => {status = "error";}, 2300);
        setTimeout(() => {status = "default";}, 3800);
        setTimeout(() => {progress = 75;}, 4300);
        setTimeout(() => {progress = 100;}, 4800);
        setTimeout(() => {status = "success";}, 5000);
    }

    function animate2() {
        const states = ["error", "default", "success"];
        setTimeout(() => {progress = getRndInteger(0, 100);}, 200);
        setTimeout(() => {progress = getRndInteger(0, 100);}, 500);
        setTimeout(() => {progress = getRndInteger(0, 100);}, 1300);
        setTimeout(() => {status = states[getRndInteger(0, 2)];}, 2300);
        setTimeout(() => {status = states[getRndInteger(0, 2)];}, 3800);
        setTimeout(() => {progress = getRndInteger(0, 100);}, 4300);
        setTimeout(() => {progress = getRndInteger(0, 100);}, 4400);
        setTimeout(() => {status = "";}, 3975);
    }

    animate();
    setTimeout(() => animate2(), 8000);
</script>


<Page title="Progress Bars">
     {#snippet icon()}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 6.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z" />
            <path d="M13.032 2.325a1.75 1.75 0 0 0-2.064 0L3.547 7.74c-.978.713-.473 2.26.736 2.26H4.5v5.8A2.75 2.75 0 0 0 3 18.25v1.5c0 .413.336.75.75.75h16.5a.75.75 0 0 0 .75-.75v-1.5a2.75 2.75 0 0 0-1.5-2.45V10h.217c1.21 0 1.713-1.547.736-2.26l-7.421-5.416zm-1.18 1.211a.25.25 0 0 1 .295 0L18.95 8.5H5.05l6.803-4.964zM18 10v5.5h-2V10h2zm-3.5 0v5.5h-1.75V10h1.75zm-3.25 0v5.5H9.5V10h1.75zm-5.5 7h12.5c.69 0 1.25.56 1.25 1.25V19h-15v-.75c0-.69.56-1.25 1.25-1.25zM6 15.5V10h2v5.5H6z" />
        </svg>
    {/snippet}

    <div class="container">
        <ProgressBar class={status} indeterminate={true} />
        <br class="gap" />
        <ProgressBar class="" indeterminate={true} />
        <br class="gap" />
        <ProgressBar class="success" indeterminate={true} />
        <br class="gap" />
        <ProgressBar class="error" indeterminate={true} />

        <br class="gap" /><br class="gap" />
        <Spinner />
        <br class="gap" /><br class="gap" />

        <ProgressBar value={progress} class={status} indeterminate={status === ""} />
        <br class="gap" />
        <ProgressBar value={progress} class="" indeterminate={status === ""} />
        <br class="gap" />
        <ProgressBar value={progress} class="success" indeterminate={status === ""} />
        <br class="gap" />
        <ProgressBar value={progress} class="error" indeterminate={status === ""} />

        <br class="gap" /><br class="gap" />
        <Spinner />
        <br class="gap" /><br class="gap" />

        <ProgressBar value={100 - progress} class={status} indeterminate={status === ""} />
        <br class="gap" />
        <ProgressBar value={100 - progress} class="" indeterminate={status === ""} />
        <br class="gap" />
        <ProgressBar value={100 - progress} class="success" indeterminate={status === ""} />
        <br class="gap" />
        <ProgressBar value={100 - progress} class="error" indeterminate={status === ""} />
    </div>
</Page>


<style>
    .gap {
        margin-bottom: 50px;
    }

    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
</style>

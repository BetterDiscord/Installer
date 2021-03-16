<script>
    import {onDestroy} from "svelte";
    import Header from "../common/Header.svelte";
    import Progress from "../common/Progress.svelte";
    import TextDisplay from "../common/TextDisplay.svelte";
    import {canGoBack, canGoForward, nextPage} from "../stores/navigation";
    import {action, paths, progress} from "../stores/installation";
    import logs from "../stores/logs";
    import install from "../actions/install";

    canGoForward.set(false);
    canGoBack.set(false);

    let display;
    const unsubscribe = logs.subscribe(() => {
        if (!display) return;
    });

    onDestroy(unsubscribe);

    install(Object.values($paths)).then(() => {
        nextPage.set(null);
        canGoForward.set(true);
        canGoBack.set(true);
    });
</script>

<Header hasMargin>{$action[0].toUpperCase()}{$action.slice(1)}</Header>
<TextDisplay value={$logs.join("\n")} bind:this={display} autoscroll />
<Progress value={$progress} max={100} />
<script>
    import {fly} from "svelte/transition";
    import {onDestroy} from "svelte";
    import Header from "../common/Header.svelte";
    import Progress from "../common/Progress.svelte";
    import TextDisplay from "../common/TextDisplay.svelte";
    import {canGoBack, canGoForward, nextPage} from "../stores/navigation";
    import {action, paths, progress, platforms} from "../stores/installation";
    import logs from "../stores/logs";
    import install from "../actions/install";
    import debug from "../actions/debug";

    canGoForward.set(false);
    canGoBack.set(false);

    let display;
    const unsubscribe = logs.subscribe(() => {
        if (!display) return;
    });

    onDestroy(unsubscribe);

    const currentAction = $action;
    logs.set([]);

    const installPaths = {};
    for (const channel in $paths) {
        if ($platforms[channel]) installPaths[channel] = $paths[channel];
    }

    if (currentAction == "install") {
        install(Object.values(installPaths)).then(() => {
            nextPage.set(null);
            canGoForward.set(true);
            canGoBack.set(true);
        });
    }
    else {
        debug(Object.values(installPaths)).then(() => {
            nextPage.set(null);
            canGoForward.set(true);
            canGoBack.set(true);
        });
    }
</script>

<section class="page" in:fly="{{x: 550, duration: 500}}" out:fly="{{x: -550, duration: 500}}">
    <Header hasMargin>{currentAction[0].toUpperCase()}{currentAction.slice(1)}</Header>
    <TextDisplay value={$logs.join("\n")} bind:this={display} autoscroll />
    <Progress value={$progress} max={100} />
</section>
<script>
    import page from "../transitions/page.js";
    import PageHeader from "../common/PageHeader.svelte";
    import Progress from "../common/Progress.svelte";
    import TextDisplay from "../common/TextDisplay.svelte";
    import logs from "../stores/logs";
    import install from "../actions/install";
    import debug from "../actions/debug";
    import {canGoBack, canGoForward, nextPage} from "../stores/navigation";
    import {action, paths, progress, platforms, status} from "../stores/installation";
    import {onDestroy} from "svelte";

    canGoForward.set(false);
    canGoBack.set(false);
    status.set("");

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

<section class="page" in:page out:page="{{out: true}}">
    <PageHeader>{currentAction[0].toUpperCase()}{currentAction.slice(1)}</PageHeader>
    <TextDisplay value={$logs.join("\n")} bind:this={display} autoscroll />
    <Progress value={$progress} max={100} className={$status} />
</section>
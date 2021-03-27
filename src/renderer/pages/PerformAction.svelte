<script>
    import page from "../transitions/page.js";
    import PageHeader from "../common/PageHeader.svelte";
    import Progress from "../common/Progress.svelte";
    import TextDisplay from "../common/TextDisplay.svelte";
    import logs from "../stores/logs";
    import install from "../actions/install";
    import repair from "../actions/repair";
    import uninstall from "../actions/uninstall";
    import debug from "../actions/debug";
    import {canGoBack, canGoForward, nextPage} from "../stores/navigation";
    import {action, paths, progress, platforms, status} from "../stores/installation";
    import {onDestroy} from "svelte";

    canGoForward.set(false);
    canGoBack.set(false);
    status.set("");

    let display;
    let pageIcon;
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

    // Run action scripts
    if (currentAction == "install") {
        pageIcon = `<path xmlns="http://www.w3.org/2000/svg" d="M18.2498 20.4999C18.664 20.4998 19 20.8355 19 21.2497C19 21.6639 18.6644 21.9998 18.2502 21.9999L5.25022 22.0037C4.836 22.0038 4.5 21.6681 4.5 21.2539C4.5 20.8397 4.83557 20.5038 5.24978 20.5037L18.2498 20.4999ZM11.6482 2.01173L11.75 2.00488C12.1297 2.00488 12.4435 2.28704 12.4932 2.65311L12.5 2.75488L12.499 16.4399L16.2208 12.7196C16.4871 12.4533 16.9038 12.4291 17.1974 12.647L17.2815 12.7197C17.5477 12.986 17.5719 13.4026 17.354 13.6962L17.2814 13.7803L12.2837 18.7769C12.0176 19.043 11.6012 19.0673 11.3076 18.8498L11.2235 18.7772L6.22003 13.7806C5.92694 13.4879 5.92661 13.0131 6.21931 12.72C6.48539 12.4535 6.90204 12.429 7.1958 12.6467L7.27997 12.7192L10.999 16.4329L11 2.75488C11 2.37519 11.2822 2.06139 11.6482 2.01173L11.75 2.00488L11.6482 2.01173Z"/>`;
        install(installPaths).then(() => {
            nextPage.set(null);
            canGoForward.set(true);
            canGoBack.set(true);
        });
    }
    else if (currentAction == "repair") {
        pageIcon = `<path d="M10.5001 7.75146C10.5001 4.57583 13.0745 2.00146 16.2501 2.00146C17.196 2.00146 18.0906 2.23045 18.8794 2.63666C19.0924 2.74632 19.2401 2.95107 19.2771 3.18771C19.314 3.42435 19.2358 3.66441 19.0664 3.83377L16.3006 6.59955L17.3613 7.66021L20.1398 4.88166C20.3081 4.71343 20.5461 4.635 20.7814 4.67029C21.0167 4.70557 21.2213 4.85039 21.3327 5.06057C21.759 5.86423 22.0001 6.7808 22.0001 7.75146C22.0001 10.9271 19.4258 13.5015 16.2501 13.5015C15.7895 13.5015 15.3408 13.4472 14.9104 13.3444L7.54552 20.9633C6.42372 22.1237 4.59212 22.2096 3.36665 21.1592C2.03293 20.016 1.93771 17.9855 3.15859 16.7226L10.6339 8.98949C10.5462 8.5902 10.5001 8.17585 10.5001 7.75146ZM16.2501 3.50146C13.9029 3.50146 12.0001 5.40425 12.0001 7.75146C12.0001 8.18343 12.0643 8.59903 12.1832 8.98998C12.2624 9.25056 12.1942 9.53361 12.0049 9.72943L4.23708 17.7651C3.61648 18.4071 3.66488 19.4392 4.34283 20.0203C4.96577 20.5543 5.8968 20.5106 6.46704 19.9207L14.1435 11.9796C14.3435 11.7727 14.6443 11.6985 14.9176 11.7886C15.3358 11.9265 15.7834 12.0015 16.2501 12.0015C18.5973 12.0015 20.5001 10.0987 20.5001 7.75146C20.5001 7.40932 20.4598 7.07709 20.3838 6.75903L17.8916 9.2512C17.5987 9.54409 17.1238 9.54409 16.831 9.2512L14.7096 7.12988C14.4167 6.83699 14.4167 6.36211 14.7096 6.06922L17.1763 3.60252C16.8785 3.53638 16.5686 3.50146 16.2501 3.50146Z"/>`;
        // TODO: Finish repair script
        repair(installPaths).then(() => {
            nextPage.set(null);
            canGoForward.set(true);
            canGoBack.set(true);
        });
    }
    else if (currentAction == "uninstall") {
        pageIcon = `<path xmlns="http://www.w3.org/2000/svg" d="M12 1.75C13.733 1.75 15.1492 3.10645 15.2449 4.81558L15.25 5H20.5C20.9142 5 21.25 5.33579 21.25 5.75C21.25 6.1297 20.9678 6.44349 20.6018 6.49315L20.5 6.5H19.704L18.4239 19.5192C18.2912 20.8683 17.1984 21.91 15.8626 21.9945L15.6871 22H8.31293C6.95734 22 5.81365 21.0145 5.59883 19.6934L5.57614 19.5192L4.295 6.5H3.5C3.1203 6.5 2.80651 6.21785 2.75685 5.85177L2.75 5.75C2.75 5.3703 3.03215 5.05651 3.39823 5.00685L3.5 5H8.75C8.75 3.20507 10.2051 1.75 12 1.75ZM18.197 6.5H5.802L7.06893 19.3724C7.12768 19.9696 7.60033 20.4343 8.18585 20.4936L8.31293 20.5H15.6871C16.2872 20.5 16.7959 20.0751 16.9123 19.4982L16.9311 19.3724L18.197 6.5ZM13.75 9.25C14.1297 9.25 14.4435 9.53215 14.4932 9.89823L14.5 10V17C14.5 17.4142 14.1642 17.75 13.75 17.75C13.3703 17.75 13.0565 17.4678 13.0068 17.1018L13 17V10C13 9.58579 13.3358 9.25 13.75 9.25ZM10.25 9.25C10.6297 9.25 10.9435 9.53215 10.9932 9.89823L11 10V17C11 17.4142 10.6642 17.75 10.25 17.75C9.8703 17.75 9.55651 17.4678 9.50685 17.1018L9.5 17V10C9.5 9.58579 9.83579 9.25 10.25 9.25ZM12 3.25C11.0818 3.25 10.3288 3.95711 10.2558 4.85647L10.25 5H13.75C13.75 4.0335 12.9665 3.25 12 3.25Z"/>`;
        uninstall(installPaths).then(() => {
            nextPage.set(null);
            canGoForward.set(true);
            canGoBack.set(true);
        });
    }
    else {
        // If the option is invalid, run the debug script
        debug(Object.values(installPaths)).then(() => {
            nextPage.set(null);
            canGoForward.set(true);
            canGoBack.set(true);
        });
    }
</script>

<section class="page" in:page out:page="{{out: true}}">
    <PageHeader>
        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            {@html pageIcon}
        </svg>
        {currentAction[0].toUpperCase()}{currentAction.slice(1)}  
    </PageHeader>
    <TextDisplay value={$logs.join("\n")} bind:this={display} autoscroll />
    <Progress value={$progress} max={100} className={$status} />
</section>
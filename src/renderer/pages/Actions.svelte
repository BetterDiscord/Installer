<script>
    import {fly} from "svelte/transition";
    import Header from "../common/Header.svelte";
    import Radio from "../common/Radio.svelte";
    import {canGoBack, canGoForward, nextPage} from "../stores/navigation";
    import {action} from "../stores/installation";

    let group = $action;

    canGoBack.set(true);

    function update() {
        canGoForward.set(true);
        nextPage.set(`/setup/${group}`);
        action.set(group);
    }

    update();
</script>

<section class="page" in:fly="{{x: 550, duration: 500}}" out:fly="{{x: -550, duration: 500}}">
    <Header hasMargin>Choose an Action</Header>
    <Radio bind:group on:change={update} value={"install"}>
        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Install BetterDiscord</span>
    </Radio>
    <Radio bind:group on:change={update} value={"repair"}>
        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        <span>Repair BetterDiscord</span>
    </Radio>
    <Radio bind:group on:change={update} value={"uninstall"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        <span>Uninstall BetterDiscord</span>
    </Radio>
</section>
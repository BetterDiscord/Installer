<script>
    import page from "../transitions/page.js";
    import PageHeader from "../common/PageHeader.svelte";
    import Radio from "../common/Radio.svelte";
    import RadioGroup from "../common/RadioGroup.svelte";
    import {canGoBack, canGoForward, nextPage, hasLoaded} from "../stores/navigation";
    import {radioSelectedIndex} from "../stores/controls";
    import {action} from "../stores/installation";
    import {onMount} from "svelte";

    onMount(() => {
        hasLoaded.set(true); // Use this to avoid initial transition caused by router
    });

    let group = $action;
    canGoBack.set(false);

    function update(i) {
        canGoForward.set(true);
        nextPage.set(`/setup/${group}`);
        action.set(group);
        radioSelectedIndex.set(i);
    }

    update($radioSelectedIndex);
</script>

<section class="page" in:page="{{duration: $hasLoaded ? undefined : 0}}" out:page="{{out: true}}">
    <PageHeader>
        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8.75 13.5C10.2869 13.5 11.5747 14.5668 11.9131 16.0003L21.25 16C21.6642 16 22 16.3358 22 16.75C22 17.1297 21.7178 17.4435 21.3518 17.4932L21.25 17.5L11.9129 17.5007C11.5741 18.9337 10.2866 20 8.75 20C7.21345 20 5.92594 18.9337 5.58712 17.5007L2.75 17.5C2.33579 17.5 2 17.1642 2 16.75C2 16.3703 2.28215 16.0565 2.64823 16.0068L2.75 16L5.58688 16.0003C5.92534 14.5668 7.21309 13.5 8.75 13.5ZM15.25 4C16.7869 4 18.0747 5.06682 18.4131 6.50034L21.25 6.5C21.6642 6.5 22 6.83579 22 7.25C22 7.6297 21.7178 7.94349 21.3518 7.99315L21.25 8L18.4129 8.00066C18.0741 9.43368 16.7866 10.5 15.25 10.5C13.7134 10.5 12.4259 9.43368 12.0871 8.00066L2.75 8C2.33579 8 2 7.66421 2 7.25C2 6.8703 2.28215 6.55651 2.64823 6.50685L2.75 6.5L12.0869 6.50034C12.4253 5.06682 13.7131 4 15.25 4Z"/>
        </svg>
        Choose an Action
    </PageHeader>
    <RadioGroup index={$radioSelectedIndex}>
        <Radio bind:group on:change={() => update(0)} value="install">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Install BetterDiscord</span>
        </Radio>
        <Radio bind:group on:change={() => update(1)} value="repair">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            <span>Repair BetterDiscord</span>
        </Radio>
        <Radio bind:group on:change={() => update(2)} value="uninstall">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            <span>Uninstall BetterDiscord</span>
        </Radio>
    </RadioGroup>
</section>
<script>
    import Spinner from "../common/Spinner.svelte";
</script>

<div class="loader">
    <Spinner/>
</div>

<style>
    .loader {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
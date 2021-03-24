<script>
    import {toggleCheck} from "../stores/controls.js";

    export let label;
    export let checked = false;
    export let disabled = false;

    let checkbox;
</script>

<div class="checkbox" on:keypress={() => toggleCheck(checkbox)}>
    <label>
        <input type="checkbox" {disabled} bind:this={checkbox} bind:checked on:change>
        {#if label}
            <span>{label}</span>
        {/if}
    </label>
</div>

<style> 
    .checkbox label {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .checkbox span {
        display: inline-block;
        color: var(--text-normal);
        font-size: 13px;
        line-height: normal;
        font-weight: 400;
    }

    .checkbox input {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        -webkit-appearance: none;
        appearance: none;
        box-sizing: border-box;
        margin: 0;
        border-radius: 2px;
        width: 20px;
        height: 20px;
        border: 1px solid var(--bg4);
        margin-right: 8px;
    }

    .checkbox input:active {
        background-color: var(--bg3);
    }

    .checkbox input:checked {
        background-color: var(--accent);
        border-color: var(--accent);
    }

    .checkbox input:checked:active {
        background-color: var(--accent-hover);
        border-color: var(--accent-hover);
    }

    .checkbox input:checked::after {
        content: "";
        width: 14px;
        height: 14px;
        background-color: #fff;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Cpath d='M40.1389 12.8711C40.6243 13.362 40.6198 14.1535 40.1289 14.6389L17.8789 36.6389C17.3947 37.1176 16.6163 37.1208 16.1283 36.6459L6.87831 27.6459C6.38351 27.1645 6.37267 26.3731 6.85409 25.8783C7.33552 25.3835 8.1269 25.3727 8.62169 25.8541L16.993 33.9991L38.3711 12.8611C38.862 12.3757 39.6535 12.3802 40.1389 12.8711Z' fill='%23ffffff'/%3E%3C/svg%3E") center/contain no-repeat;
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Cpath d='M40.1389 12.8711C40.6243 13.362 40.6198 14.1535 40.1289 14.6389L17.8789 36.6389C17.3947 37.1176 16.6163 37.1208 16.1283 36.6459L6.87831 27.6459C6.38351 27.1645 6.37267 26.3731 6.85409 25.8783C7.33552 25.3835 8.1269 25.3727 8.62169 25.8541L16.993 33.9991L38.3711 12.8611C38.862 12.3757 39.6535 12.3802 40.1389 12.8711Z' fill='%23ffffff'/%3E%3C/svg%3E") center/contain no-repeat;
    }
</style>
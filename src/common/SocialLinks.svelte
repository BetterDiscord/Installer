<script>
    const webUrl = 'https://betterdiscord.app';
    const githubUrl = 'http://github.com/BetterDiscord/BetterDiscord';
    const donateUrl = 'https://www.patreon.com/Zerebos';
</script>

<div class="social-links">
    <a class="social" id="twitter" target="_blank" href={webUrl}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    </a>
    <a class="social" id="github" target="_blank" href={githubUrl}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
    </a>
    <a class="social" id="donate" target="_blank" href={donateUrl}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    </a>
</div>

<style>
    .social-links {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: -5px;
        margin-right: -5px;
    }

    .social {
        width: 28px;
        height: 28px;
        margin-top: 5px;
        margin-right: 5px;
        background-color: var(--bg3-alt);
        border-radius: 50%;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 150ms ease;
        outline: none;
    }

    .social:hover {
        color: var(--text-normal);
    }

    .social:active {
        background-color: var(--bg4);
    }

    .social svg {
        width: 14px;
        height: auto;
    }
</style>
const supportedChannels = ["stable", "ptb", "canary"];

const createDefaultCliConfig = () => ({
    silent: false,
    action: null,
    channels: []
});

function parseCliConfig() {
    const input = process.env.BD_INSTALLER_CLI_CONFIG;
    if (!input) return createDefaultCliConfig();

    try {
        const parsed = JSON.parse(input);
        return {
            silent: Boolean(parsed.silent),
            action: ["install", "repair", "uninstall"].includes(parsed.action) ? parsed.action : null,
            channels: Array.isArray(parsed.channels) ? parsed.channels.filter(c => supportedChannels.includes(c)) : []
        };
    }
    catch {
        return createDefaultCliConfig();
    }
}

export const cli = parseCliConfig();

export const isSilentInstall = Boolean(cli.silent && cli.action === "install");

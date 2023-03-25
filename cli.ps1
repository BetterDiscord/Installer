Param(
    [ValidateSet('Ptb', 'Canary', 'Stable')]
    [string] $client
)
if ($PSBoundParameters.ContainsKey('client')) {$client = "Stable"}
winget install git.git -e --force
winget install OpenJS.NodeJS -e --force
if(-not (Get-Command git -Type Application -ErrorAction Ignore)) {
    throw "unable to install git"
}
npm install -g pnpm 
try {
    pnpm | Out-Null
}
catch [System.Management.Automation.CommandNotFoundException]{
  throw "unable to install pnpm"
}
Set-Location ~/downloads
git clone https://github.com/BetterDiscord/BetterDiscord
Set-Location BetterDiscord
pnpm recursive install
pnpm run build
switch($client) {
    Canary {
            if (!(Test-Path ~\AppData\Local\DiscordCanary))
        {
            winget install discord.discord.canary
        }
        pnpm run inject canary
    }
    Ptb {
        if (!(Test-Path ~\AppData\Local\DiscordPTB))
        {
            winget install discord.discord.ptb
        }
        pnpm run inject ptb
    }
    Default {
        if (!(Test-Path ~\AppData\Local\Discord))
        {
            winget install discord.discord
        }
        pnpm run inject
    }
  }



Write-Host "sucessfully instlled to BetterDiscord" -ForegroundColor Green

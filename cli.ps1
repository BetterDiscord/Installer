Param(
  [Switch]$ptb,
  [Switch]$canary
)
Invoke-WebRequest -URI "https://community.chocolatey.org/install.ps1" -OutFile "choco.ps1"
Start-Process -FilePath "pwsh" -Wait -ArgumentList "-f ./choco.ps1" -Verb RunAs
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
Set-Location ~
git clone https://github.com/BetterDiscord/BetterDiscord
Set-Location BetterDiscord
pnpm recursive install
pnpm run build
if($ptb)
{
    if (!(Test-Path ~\AppData\Local\DiscordPTB))
    {
        winget install discord.discord.ptb
    }
    pnpm run inject ptb
}
elseif ($canary)
{
    if (!(Test-Path ~\AppData\Local\DiscordCanary))
    {
        winget install discord.discord.canary
    }
    pnpm run inject canary
}
else
{
    if (!(Test-Path ~\AppData\Local\Discord))
    {
        winget install discord.discord
    }
    pnpm run inject
}
Write-Output "sucessfully instlled to BetterDiscord"

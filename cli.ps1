Param(
  [Switch]$ptb,
  [Switch]$canary,
  [Switch]$Stable
)
Invoke-WebRequest -URI "https://community.chocolatey.org/install.ps1" -OutFile "choco.ps1"
Start-Process -FilePath "pwsh" -Wait -ArgumentList "-f ./choco.ps1" -Verb RunAs
choco upgrade git -y
choco upgarde nodejs -y
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
    choco install discord -y
    pnpm run inject ptb
}
if($canary)
{
    if (!(Test-Path ~\AppData\Local\DiscordCanary))
    {
        invoke-WebRequest -URI "https://dl-canary.discordapp.net/distro/app/canary/win/x86/1.0.49/DiscordCanarySetup.exe" -OutFile "canary.exe"
        Start-Process -FilePath "./canary.exe" -Wait -Verb RunAs
        Remove-Item ".\canary.exe" -Force
    }
    pnpm run inject canary
}
if(($stable) -or (!($ptb) -and !($canary) -and !($Stable)))
{
    if (!(Test-Path ~\AppData\Local\Discord))
    {

        invoke-WebRequest -URI "https://dl.discordapp.net/distro/app/stable/win/x86/1.0.9006/DiscordSetup.exe" -OutFile "stable.exe"
        Start-Process -FilePath "./stable.exe" -Wait  -Verb RunAs
        Remove-Item "./stable.exe" -Force
    }
    pnpm run inject
}
Write-Output "sucessfully instlled to BetterDiscord"

@ECHO OFF
cd .\dist\win-ia32-unpacked\
DEL ..\BetterDiscord-Windows.7z
..\..\lzma1900\bin\7zr.exe a ..\BetterDiscord-Windows.7z -r * -mx -mf=BCJ2
cd ..\..\
REM copy /b concatenates files
copy /b .\lzma1900\bin\7zSD.sfx + .\scripts\7z_config.txt + .\dist\BetterDiscord-Windows.7z .\dist\BetterDiscord-Windows.exe
ECHO Next line will fail if resource hacker is not installed!
"%PROGRAMFILES(X86)%\Resource Hacker\ResourceHacker.exe" -open dist\BetterDiscord-Windows.exe -save dist\BetterDiscord-Windows.exe -action addoverwrite -res assets\icon.ico -mask ICONGROUP,MAINICON,

using System.Diagnostics;
using System.Formats.Tar;
using System.IO.Compression;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using AngleSharp.Html.Parser;
using Octokit;

namespace cstest;

public static class Installer
{
    private static OS Platform => OsMetadata.Platform;
    private static OsMetadata PlatformMeta => OsMetadata.PlatformMeta;

    // Store a single HttpClient instance, so that we don't build a new on on each request.
    private static readonly HttpClient HttpClient = new();

    private static async Task DownloadAsync(string url, string path)
    {
        // The logic that was previously here was repeated, reuse the RequestAsync method
        // that we already had, which did the same thing
        var results = await RequestAsync(url);

        // I just like File.Create, same thing. (this is just opinion)
        FileStream fileStream = File.Create(path);

        await results.Content.CopyToAsync(fileStream);

        fileStream.Close();
        fileStream.Dispose();
        results.Dispose();
    }

    private static async Task<HttpResponseMessage> RequestAsync(string url)
    {
        // The `using` keyword will automatically Dispose() the message when `requestMessage`
        // falls out of scope (at the end of this method)
        using var requestMessage = new HttpRequestMessage(HttpMethod.Get, url);
        requestMessage.Headers.Add("user-agent", "foo");
        return await HttpClient.SendAsync(requestMessage);
    }

    public static async Task Main(string[] args)
    {
        var branch = Branch.Stable;

        if (args.Length != 0)
        {
            // This will assign to the `branch` variable above, and with throw the exception if the
            // string can't be parsed to a valid branch
            // verify branch is empty or is valid or not
            if (!Enum.TryParse(args[0], out branch)) {
                throw new Exception("The branch is not valid. valid branches are : [ Stable , Canary ,  PTB ]");
            }
        }

        var branchName = branch.DisplayName();

        //retrieve system information & get ready variables
        string arch = RuntimeInformation.OSArchitecture.ToString().ToLower();

        if (!DiscordIsInstalled(branch)) {
            throw new Exception("Discord " + branchName + " is not installed");
        }

        Console.WriteLine("Your OS is: " + Platform);
        Console.WriteLine("Your Architecture type is: " + arch);
        Console.WriteLine("Your Temp folder is: " + PlatformMeta.TempPath);

        //download source code and dependencies
        string workspaceName = "BetterDiscord";
        string repositoryName = "BetterDiscord";

        var client = new GitHubClient(new ProductHeaderValue(repositoryName));

        // Retrieve a List of Releases in the Repository, and get latest zipball
        var temp = PlatformMeta.TempPath;
        var releases = await client.Repository.Release.GetLatest(workspaceName, repositoryName);
        await DownloadAsync(releases.ZipballUrl, Path.Combine(temp + "betterdiscord.zip"));
        Console.WriteLine("Downloaded BD");

        ZipFile.ExtractToDirectory(Path.Combine(temp + "betterdiscord.zip"), temp, true);
        Console.WriteLine(temp + @"BetterDiscord-BetterDiscord*");
        Console.WriteLine(string.Join("\n", Directory.GetDirectories(temp, @"BetterDiscord-BetterDiscord*")));
        string bddir = Directory.GetDirectories(temp, @"BetterDiscord-BetterDiscord*")[0];
        Console.WriteLine("Extracted BD");


        //detect node
        var process = Process.Start(new ProcessStartInfo()
        {
            FileName = "node",
            Arguments = "--version",
            CreateNoWindow = true,
            RedirectStandardOutput = true,
        });
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            //set up node
            Console.WriteLine("Node.js is not installed!");
            const string nodebaseurl = @"https://nodejs.org/dist/latest/";
            var results = await RequestAsync(nodebaseurl);
            var parser = new HtmlParser();
            var document = parser.ParseDocument(await results.Content.ReadAsStringAsync());
            // Can use LINQ instead of `new List<string>` + the foreach with list.Add
            List<string?> hrefTags = document
                .QuerySelectorAll("a")
                .Select(element => element.GetAttribute("href"))
                .ToList();

            var myRegex = new Regex("^.*-" + Platform + "-" + arch + PlatformMeta.ArchiveExt + "$");
            // Use .First() instead of .ToList()[0], so that we don't allocate an entire new array
            string nodeVer = hrefTags.First(x => myRegex.IsMatch(x));
            Console.WriteLine("The NodeJS version that will be downloaded is: " + nodeVer);
            results.Dispose();

            await DownloadAsync(nodebaseurl + nodeVer, Path.Combine(temp + "node" + PlatformMeta.ArchiveExt));
            if (Platform == OS.win)
            {
                ZipFile.ExtractToDirectory(Path.Combine(temp + "node.zip"), temp, true);
            }
            else
            {
                TarFile.ExtractToDirectory(Path.Combine(temp + "node.tar.xz"), temp, true);
            }

            Console.WriteLine("Extracted NodeJS");
            Console.WriteLine("Installing pnpm");
            Directory.SetCurrentDirectory(bddir);
            var node = nodeVer.Replace(PlatformMeta.ArchiveExt, "");
            string nodedir = Path.Combine(temp + node);
            process = new Process();
            process.StartInfo.UseShellExecute = true;
            process.StartInfo.FileName = nodedir + "/npm" + PlatformMeta.ArchiveExt;
            process.StartInfo.WorkingDirectory = bddir;
            process.StartInfo.Arguments = "i pnpm -g";
            process.StartInfo.WorkingDirectory = nodedir;
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardOutput = true;
            process.Start();
            Console.WriteLine("Installing dependencies");
            await process.WaitForExitAsync();
            process.StartInfo.FileName = "pnpm";
            process.StartInfo.Arguments = "install";
            process.Start();
            Console.WriteLine("Building");
            await process.WaitForExitAsync();
            process.StartInfo.Arguments = "build";
            process.Start();
            Console.WriteLine("Installing");
            await process.WaitForExitAsync();
            process.StartInfo.Arguments = "inject" + branch;
            process.Start();
            await process.WaitForExitAsync();
            Console.WriteLine("Done");


        }
        else
        {
            Console.WriteLine("Installing pnpm");
            process = new Process();
            process.StartInfo.FileName = "npm";
            process.StartInfo.WorkingDirectory = bddir;
            process.StartInfo.Arguments = "i pnpm -g";
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardOutput = false;
            process.StartInfo.UseShellExecute = true;
            process.Start();
            Console.WriteLine("Installing dependencies");
            await process.WaitForExitAsync();
            process.StartInfo.FileName = "pnpm";
            process.StartInfo.Arguments = "install";
            process.Start();
            Console.WriteLine("Building");
            await process.WaitForExitAsync();
            process.StartInfo.Arguments = "build";
            process.Start();
            Console.WriteLine("Installing");
            await process.WaitForExitAsync();
            process.StartInfo.Arguments = "inject" + branch;
            process.Start();
            await process.WaitForExitAsync();
            Console.WriteLine("Done");
        }
    }

    private static bool DiscordIsInstalled(Branch branch)
    {
        var branchName = branch.DisplayName();

        switch (Platform)
        {
            case OS.win:
                return Directory.Exists(Environment.GetEnvironmentVariable("localappdata") + @"\Discord" + branchName);
            case OS.darwin:
                return Directory.Exists("/Library/Application Support/Discord" + branchName);
            case OS.linux:
            {
                try
                {
                    Process discord = new Process();
                    discord.StartInfo.UseShellExecute = true;
                    discord.StartInfo.FileName = "discord" + branchName;
                    discord.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                    discord.Start();
                    discord.Kill();
                    discord.WaitForExit();
                    discord.Dispose();
                }
                catch {
                    return false;
                }

                return true;
            }
            case OS.Unknown:
                throw new Exception("OS is Not Supported");
            default:
                throw new NotImplementedException();
        }
    }
}

enum Branch
{
    Stable,
    Canary,
    PTB,
}

internal static class BranchExtensions
{
    public static string DisplayName(this Branch branch)
        => branch switch
        {
            Branch.Stable => "",
            Branch.Canary => "Canary",
            Branch.PTB => "PTB",
        };
}

enum OS
{
    Unknown,
    linux,
    darwin,
    win,
}

class OsMetadata
{
    public required string TempPath { get; init; }
    public required string ExeExt { get; init; }
    public required string ArchiveExt { get; init; }

#region statics
    public static readonly OS Platform = GetPlatform();
    public static readonly OsMetadata PlatformMeta = Platform switch
    {
        OS.win => new OsMetadata
        {
            TempPath = Path.GetTempPath(),
            ArchiveExt = ".zip",
            ExeExt = ".exe",
        },
        OS.darwin => new OsMetadata
        {
            TempPath = "~/Library/Caches",
            ArchiveExt = ".tar.xz",
            ExeExt = "",
        },
        OS.linux => new OsMetadata
        {
            TempPath = "/tmp",
            ArchiveExt = ".tar.xz",
            ExeExt = "",
        },
    };

    private static OS GetPlatform()
    {
        if (OperatingSystem.IsLinux()) return OS.linux;
        if (OperatingSystem.IsMacOS()) return OS.darwin;
        if (OperatingSystem.IsWindows()) return OS.win;
        return OS.Unknown;
    }
#endregion statics
}
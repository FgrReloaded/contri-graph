#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const promises_1 = require("node:readline/promises");
const node_process_1 = require("node:process");
const API_BASE = "https://cg.nitishk.dev/api/github";
const BLOCK_START = "# >>> contri-graph start >>>";
const BLOCK_END = "# <<< contri-graph end <<<";
const HELP = `
  contri-graph — GitHub contribution graph in your terminal

  Usage:
    contri-graph <username>
    contri-graph --user <username> [options]
    npx contri-graph-cli <username>

  Options:
    --user, -u     GitHub username
    --year, -y     Year to display (default: current year)
    --color, -c    Color: green, blue, purple, orange, yellow, pink, cyan, white
    --compact      Condensed 3-row output
    --install-shell [shell]  Install startup hook (zsh|bash|fish|auto)
    --uninstall-shell [shell] Remove startup hook
    --status-shell [shell]    Show startup hook status
    --shell        Print shell setup snippet
    --help, -h     Show this help

  Examples:
    contri-graph torvalds
    contri-graph --user torvalds --color purple --compact
    contri-graph --install-shell --user torvalds
    contri-graph --install-shell fish --user torvalds
    contri-graph --status-shell
    contri-graph --uninstall-shell zsh
    contri-graph --shell
`;
const SHELL_SETUP = `
  # Add to your shell config file:

  # Bash (~/.bashrc):
  export CONTRI_GRAPH_USER="YOUR_USERNAME"
  npx -y contri-graph-cli "$CONTRI_GRAPH_USER"

  # Zsh (~/.zshrc):
  export CONTRI_GRAPH_USER="YOUR_USERNAME"
  npx -y contri-graph-cli "$CONTRI_GRAPH_USER"

  # Fish (~/.config/fish/config.fish):
  set -gx CONTRI_GRAPH_USER "YOUR_USERNAME"
  npx -y contri-graph-cli $CONTRI_GRAPH_USER

  # Or use the shell script for faster startup (no Node overhead):
  bash /path/to/contri-graph.sh
`;
function parseArgs(argv) {
    const args = argv.slice(2);
    const opts = {
        user: process.env.CONTRI_GRAPH_USER || "",
        year: new Date().getFullYear().toString(),
        color: "green",
        compact: false,
        help: false,
        shell: false,
        installShell: false,
        uninstallShell: false,
        statusShell: false,
        targetShell: "",
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "--user":
            case "-u":
                opts.user = args[++i] || "";
                break;
            case "--year":
            case "-y":
                opts.year = args[++i] || opts.year;
                break;
            case "--color":
            case "-c":
                opts.color = args[++i] || opts.color;
                break;
            case "--compact":
                opts.compact = true;
                break;
            case "--help":
            case "-h":
                opts.help = true;
                break;
            case "--shell":
                opts.shell = true;
                break;
            case "--install-shell":
                opts.installShell = true;
                if (args[i + 1] && !args[i + 1].startsWith("-")) {
                    opts.targetShell = args[++i];
                }
                break;
            case "--uninstall-shell":
                opts.uninstallShell = true;
                if (args[i + 1] && !args[i + 1].startsWith("-")) {
                    opts.targetShell = args[++i];
                }
                break;
            case "--status-shell":
                opts.statusShell = true;
                if (args[i + 1] && !args[i + 1].startsWith("-")) {
                    opts.targetShell = args[++i];
                }
                break;
            default:
                if (!arg.startsWith("-") && !opts.user) {
                    opts.user = arg;
                }
                break;
        }
    }
    return opts;
}
function normalizeShell(value) {
    if (!value)
        return null;
    const cleaned = value.toLowerCase().replace(/^.*\//, "");
    if (cleaned === "zsh" || cleaned === "bash" || cleaned === "fish") {
        return cleaned;
    }
    if (cleaned === "auto") {
        return detectCurrentShell();
    }
    return null;
}
function detectCurrentShell() {
    const current = (process.env.SHELL || "").toLowerCase();
    if (current.endsWith("/zsh") || current === "zsh")
        return "zsh";
    if (current.endsWith("/bash") || current === "bash")
        return "bash";
    if (current.endsWith("/fish") || current === "fish")
        return "fish";
    return null;
}
function resolveTargetShell(targetShell) {
    const explicit = normalizeShell(targetShell);
    if (explicit)
        return explicit;
    const detected = detectCurrentShell();
    if (detected)
        return detected;
    console.error("Could not detect current shell. Pass one explicitly: --install-shell zsh|bash|fish");
    process.exit(1);
}
function getShellConfigPath(shell) {
    const home = node_os_1.default.homedir();
    if (shell === "zsh")
        return node_path_1.default.join(home, ".zshrc");
    if (shell === "bash")
        return node_path_1.default.join(home, ".bashrc");
    return node_path_1.default.join(home, ".config", "fish", "config.fish");
}
function buildManagedBlock(shell, username) {
    const escapedUsername = username.replaceAll('"', '\\"');
    const userLine = shell === "fish"
        ? `set -gx CONTRI_GRAPH_USER "${escapedUsername}"`
        : `export CONTRI_GRAPH_USER="${escapedUsername}"`;
    const command = 'if command -v contri-graph >/dev/null 2>&1; then contri-graph "$CONTRI_GRAPH_USER"; else npx -y contri-graph-cli "$CONTRI_GRAPH_USER"; fi';
    if (shell === "fish") {
        return `${BLOCK_START}
# Auto-generated by contri-graph --install-shell
${userLine}
if status is-interactive
    if set -q CONTRI_GRAPH_USER
        if type -q contri-graph
            contri-graph $CONTRI_GRAPH_USER
        else
            npx -y contri-graph-cli $CONTRI_GRAPH_USER
        end
    end
end
${BLOCK_END}`;
    }
    return `${BLOCK_START}
# Auto-generated by contri-graph --install-shell
${userLine}
if [[ $- == *i* ]] && [[ -n "\${CONTRI_GRAPH_USER:-}" ]]; then
  ${command}
fi
${BLOCK_END}`;
}
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function hasManagedBlock(content) {
    const blockRegex = new RegExp(`${escapeRegex(BLOCK_START)}[\\s\\S]*?${escapeRegex(BLOCK_END)}`, "m");
    return blockRegex.test(content);
}
function upsertManagedBlock(content, block) {
    const blockRegex = new RegExp(`${escapeRegex(BLOCK_START)}[\\s\\S]*?${escapeRegex(BLOCK_END)}`, "m");
    const trimmed = content.trimEnd();
    if (blockRegex.test(trimmed)) {
        return `${trimmed.replace(blockRegex, block)}\n`;
    }
    if (!trimmed)
        return `${block}\n`;
    return `${trimmed}\n\n${block}\n`;
}
function removeManagedBlock(content) {
    const blockRegex = new RegExp(`\\n?${escapeRegex(BLOCK_START)}[\\s\\S]*?${escapeRegex(BLOCK_END)}\\n?`, "m");
    return content.replace(blockRegex, "\n").trimEnd() + "\n";
}
async function readFileSafe(filePath) {
    try {
        return await node_fs_1.promises.readFile(filePath, "utf8");
    }
    catch (error) {
        if (error.code === "ENOENT") {
            return "";
        }
        throw error;
    }
}
async function resolveInstallUsername(inputUsername) {
    if (inputUsername.trim())
        return inputUsername.trim();
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        console.error("No username provided. Pass one with --user <github-username> when running non-interactively.");
        process.exit(1);
    }
    const rl = (0, promises_1.createInterface)({ input: node_process_1.stdin, output: node_process_1.stdout });
    try {
        const answer = (await rl.question("GitHub username for contri-graph startup: ")).trim();
        if (!answer) {
            console.error("Username is required for shell install. Use --user <github-username>.");
            process.exit(1);
        }
        return answer;
    }
    finally {
        rl.close();
    }
}
async function installShellHook(targetShell, inputUsername) {
    const shell = resolveTargetShell(targetShell);
    const configPath = getShellConfigPath(shell);
    const username = await resolveInstallUsername(inputUsername);
    await node_fs_1.promises.mkdir(node_path_1.default.dirname(configPath), { recursive: true });
    const existing = await readFileSafe(configPath);
    const updated = upsertManagedBlock(existing, buildManagedBlock(shell, username));
    await node_fs_1.promises.writeFile(configPath, updated, "utf8");
    console.log(`Installed contri-graph startup hook for ${shell}.`);
    console.log(`Updated config: ${configPath}`);
    console.log(`Configured username: ${username}`);
}
async function uninstallShellHook(targetShell) {
    const shell = resolveTargetShell(targetShell);
    const configPath = getShellConfigPath(shell);
    const existing = await readFileSafe(configPath);
    if (!hasManagedBlock(existing)) {
        console.log(`No contri-graph startup hook found in ${configPath}`);
        return;
    }
    const updated = removeManagedBlock(existing);
    await node_fs_1.promises.writeFile(configPath, updated, "utf8");
    console.log(`Removed contri-graph startup hook from ${configPath}`);
}
async function statusShellHook(targetShell) {
    const shell = resolveTargetShell(targetShell);
    const configPath = getShellConfigPath(shell);
    const existing = await readFileSafe(configPath);
    const installed = hasManagedBlock(existing);
    console.log(`Shell: ${shell}`);
    console.log(`Config: ${configPath}`);
    console.log(`Hook installed: ${installed ? "yes" : "no"}`);
}
async function main() {
    const opts = parseArgs(process.argv);
    if (opts.help) {
        console.log(HELP);
        process.exit(0);
    }
    if (opts.shell) {
        console.log(SHELL_SETUP);
        process.exit(0);
    }
    if (opts.installShell) {
        await installShellHook(opts.targetShell, opts.user);
        process.exit(0);
    }
    if (opts.uninstallShell) {
        await uninstallShellHook(opts.targetShell);
        process.exit(0);
    }
    if (opts.statusShell) {
        await statusShellHook(opts.targetShell);
        process.exit(0);
    }
    if (!opts.user) {
        console.error("Error: No username provided. Use: contri-graph <username>");
        console.error("Or set CONTRI_GRAPH_USER environment variable.");
        process.exit(1);
    }
    const params = new URLSearchParams({
        year: opts.year,
        color: opts.color,
    });
    if (opts.compact)
        params.set("compact", "true");
    const url = `${API_BASE}/${opts.user}/terminal?${params}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            console.error(text || `Failed to fetch contribution graph (HTTP ${res.status})`);
            process.exit(1);
        }
        const text = await res.text();
        console.log(text);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Failed to connect to API: ${errorMessage}`);
        process.exit(1);
    }
}
main();

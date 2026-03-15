#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

const API_BASE = "https://cg.nitishk.dev/api/github";
const BLOCK_START = "# >>> contri-graph start >>>";
const BLOCK_END = "# <<< contri-graph end <<<";
type ShellName = "zsh" | "bash" | "fish";

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
    contri-graph --install-shell
    contri-graph --install-shell fish
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

type CliOptions = {
  user: string;
  year: string;
  color: string;
  compact: boolean;
  help: boolean;
  shell: boolean;
  installShell: boolean;
  uninstallShell: boolean;
  statusShell: boolean;
  targetShell: string;
};

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const opts: CliOptions = {
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

function normalizeShell(value: string): ShellName | null {
  if (!value) return null;
  const cleaned = value.toLowerCase().replace(/^.*\//, "");
  if (cleaned === "zsh" || cleaned === "bash" || cleaned === "fish") {
    return cleaned;
  }
  if (cleaned === "auto") {
    return detectCurrentShell();
  }
  return null;
}

function detectCurrentShell(): ShellName | null {
  const current = (process.env.SHELL || "").toLowerCase();
  if (current.endsWith("/zsh") || current === "zsh") return "zsh";
  if (current.endsWith("/bash") || current === "bash") return "bash";
  if (current.endsWith("/fish") || current === "fish") return "fish";
  return null;
}

function resolveTargetShell(targetShell: string): ShellName {
  const explicit = normalizeShell(targetShell);
  if (explicit) return explicit;
  const detected = detectCurrentShell();
  if (detected) return detected;

  console.error(
    "Could not detect current shell. Pass one explicitly: --install-shell zsh|bash|fish",
  );
  process.exit(1);
}

function getShellConfigPath(shell: ShellName): string {
  const home = os.homedir();
  if (shell === "zsh") return path.join(home, ".zshrc");
  if (shell === "bash") return path.join(home, ".bashrc");
  return path.join(home, ".config", "fish", "config.fish");
}

function buildManagedBlock(shell: ShellName): string {
  const command =
    'if command -v contri-graph >/dev/null 2>&1; then contri-graph "$CONTRI_GRAPH_USER"; else npx -y contri-graph-cli "$CONTRI_GRAPH_USER"; fi';

  if (shell === "fish") {
    return `${BLOCK_START}
# Auto-generated by contri-graph --install-shell
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
if [[ $- == *i* ]] && [[ -n "\${CONTRI_GRAPH_USER:-}" ]]; then
  ${command}
fi
${BLOCK_END}`;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasManagedBlock(content: string): boolean {
  const blockRegex = new RegExp(`${escapeRegex(BLOCK_START)}[\\s\\S]*?${escapeRegex(BLOCK_END)}`, "m");
  return blockRegex.test(content);
}

function upsertManagedBlock(content: string, block: string): string {
  const blockRegex = new RegExp(`${escapeRegex(BLOCK_START)}[\\s\\S]*?${escapeRegex(BLOCK_END)}`, "m");
  const trimmed = content.trimEnd();
  if (blockRegex.test(trimmed)) {
    return `${trimmed.replace(blockRegex, block)}\n`;
  }
  if (!trimmed) return `${block}\n`;
  return `${trimmed}\n\n${block}\n`;
}

function removeManagedBlock(content: string): string {
  const blockRegex = new RegExp(`\\n?${escapeRegex(BLOCK_START)}[\\s\\S]*?${escapeRegex(BLOCK_END)}\\n?`, "m");
  return content.replace(blockRegex, "\n").trimEnd() + "\n";
}

async function readFileSafe(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

async function installShellHook(targetShell: string): Promise<void> {
  const shell = resolveTargetShell(targetShell);
  const configPath = getShellConfigPath(shell);
  await fs.mkdir(path.dirname(configPath), { recursive: true });

  const existing = await readFileSafe(configPath);
  const updated = upsertManagedBlock(existing, buildManagedBlock(shell));
  await fs.writeFile(configPath, updated, "utf8");

  console.log(`Installed contri-graph startup hook for ${shell}.`);
  console.log(`Updated config: ${configPath}`);
  if (!process.env.CONTRI_GRAPH_USER) {
    console.log('Tip: set CONTRI_GRAPH_USER in your shell config, e.g. export CONTRI_GRAPH_USER="your-username"');
  }
}

async function uninstallShellHook(targetShell: string): Promise<void> {
  const shell = resolveTargetShell(targetShell);
  const configPath = getShellConfigPath(shell);
  const existing = await readFileSafe(configPath);

  if (!hasManagedBlock(existing)) {
    console.log(`No contri-graph startup hook found in ${configPath}`);
    return;
  }

  const updated = removeManagedBlock(existing);
  await fs.writeFile(configPath, updated, "utf8");
  console.log(`Removed contri-graph startup hook from ${configPath}`);
}

async function statusShellHook(targetShell: string): Promise<void> {
  const shell = resolveTargetShell(targetShell);
  const configPath = getShellConfigPath(shell);
  const existing = await readFileSafe(configPath);
  const installed = hasManagedBlock(existing);

  console.log(`Shell: ${shell}`);
  console.log(`Config: ${configPath}`);
  console.log(`Hook installed: ${installed ? "yes" : "no"}`);
}

async function main(): Promise<void> {
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
    await installShellHook(opts.targetShell);
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
  if (opts.compact) params.set("compact", "true");

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
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Failed to connect to API: ${errorMessage}`);
    process.exit(1);
  }
}

main();

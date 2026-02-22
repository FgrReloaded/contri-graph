#!/usr/bin/env node

const API_BASE = 'https://cg.nitishk.dev/api/github';

const HELP = `
  contri-graph — GitHub contribution graph in your terminal

  Usage:
    contri-graph <username>
    contri-graph --user <username> [options]
    npx contri-graph <username>

  Options:
    --user, -u     GitHub username
    --year, -y     Year to display (default: current year)
    --color, -c    Color: green, blue, purple, orange, yellow, pink, cyan, white
    --compact      Condensed 3-row output
    --shell        Print shell setup snippet
    --help, -h     Show this help

  Examples:
    contri-graph torvalds
    contri-graph --user torvalds --color purple --compact
    contri-graph --shell
`;

const SHELL_SETUP = `
  # Add to your shell config file:

  # Bash (~/.bashrc):
  export CONTRI_GRAPH_USER="YOUR_USERNAME"
  npx -y contri-graph "$CONTRI_GRAPH_USER"

  # Zsh (~/.zshrc):
  export CONTRI_GRAPH_USER="YOUR_USERNAME"
  npx -y contri-graph "$CONTRI_GRAPH_USER"

  # Fish (~/.config/fish/config.fish):
  set -gx CONTRI_GRAPH_USER "YOUR_USERNAME"
  npx -y contri-graph $CONTRI_GRAPH_USER

  # Or use the shell script for faster startup (no Node overhead):
  bash /path/to/contri-graph.sh
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    user: process.env.CONTRI_GRAPH_USER || '',
    year: new Date().getFullYear().toString(),
    color: 'green',
    compact: false,
    help: false,
    shell: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--user': case '-u':
        opts.user = args[++i] || '';
        break;
      case '--year': case '-y':
        opts.year = args[++i] || opts.year;
        break;
      case '--color': case '-c':
        opts.color = args[++i] || opts.color;
        break;
      case '--compact':
        opts.compact = true;
        break;
      case '--help': case '-h':
        opts.help = true;
        break;
      case '--shell':
        opts.shell = true;
        break;
      default:
        if (!arg.startsWith('-') && !opts.user) {
          opts.user = arg;
        }
        break;
    }
  }

  return opts;
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

  if (!opts.user) {
    console.error('Error: No username provided. Use: contri-graph <username>');
    console.error('Or set CONTRI_GRAPH_USER environment variable.');
    process.exit(1);
  }

  const params = new URLSearchParams({
    year: opts.year,
    color: opts.color,
  });
  if (opts.compact) params.set('compact', 'true');

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
    console.error(`Failed to connect to API: ${err.message}`);
    process.exit(1);
  }
}

main();

# Orca Summon

Summon [Claude Code](https://claude.com/claude-code) into any [Orca](https://onorca.dev) worktree from [Raycast](https://raycast.com), with your question already typed in.

## Commands

- **Summon Claude**: a form with a multi-line question, a worktree picker (every live Orca worktree, grouped by repo) and a permission mode picker. It remembers your last worktree and mode.
- **Quick Summon**: type `qsu`, TAB, then the question, then Enter. It reuses the worktree and mode you last picked in Summon Claude.

Both open Claude Code in a new Orca tab of that worktree, focus it, and reset Raycast to the root search.

## Permission modes

`--permission-mode` of Claude Code: Auto (default), Bypass (yolo), Accept edits, Plan and Manual.

## Requirements

- macOS with Orca installed in `/Applications`.
- Claude Code (`claude`) on your login shell `PATH`.

## Install

```sh
git clone https://github.com/AlexTemina/orca-summon.git
cd orca-summon
npm install && npm run dev
```

Wait for `ready - built extension successfully`, then stop it with `Ctrl+C`. `npm run dev` registers the extension in Raycast, and it stays installed after you stop it. `npm run build` alone only compiles: it does not add the extension to Raycast.

To update: `git pull && npm run dev`, then `Ctrl+C`.

## Tip

For `orsu` + space to jump straight into the question field, give Quick Summon the alias `orsu` in Raycast Settings → Extensions.

## License

MIT

# Orca Summon

Summon [Claude Code](https://claude.com/claude-code) into any [Orca](https://onorca.dev) worktree from [Raycast](https://raycast.com), with your question already typed in.

## Commands

- **Summon Claude**: a form with a multi-line question, a worktree picker (every live Orca worktree, grouped by repo) and a permission mode picker. It remembers your last worktree and mode.
- **Linear issue (optional, both commands)**: give an issue id and Claude goes where the issue lives. A live agent in its worktree gets the question and the focus; a worktree with no agent gets a new one; no worktree, and Claude starts it in the fallback worktree you set in the preferences, with the start prompt (default `Start working on {issue}.`; a `/start-task {issue}` slash command works too). Deep link: `raycast://extensions/alejandro_ruiz_temina/orca-summon/quick-summon?arguments={"issue":"ES-12279"}`.
- **Quick Summon**: type `qsu`, TAB, then the question, then Enter. It reuses the worktree and mode you last picked in Summon Claude.

Both open Claude Code in a new Orca tab of that worktree, focus it, and reset Raycast to the root search.

## Preferences

- **Fallback worktree**: absolute path of the Orca worktree where an issue with no worktree gets started.
- **Start prompt** and **Resume prompt**: what Claude receives when you give only an issue. `{issue}` is replaced by its id.

## Permission modes

`--permission-mode` of Claude Code: Auto (default), Bypass (yolo), Accept edits, Plan and Manual.

## Requirements

- macOS with Orca installed in `/Applications`.
- Claude Code (`claude`) on your login shell `PATH`.

## Install

```sh
git clone https://github.com/AlexTemina/orca-summon.git
cd orca-summon
npm install
```

Then in Raycast run **Import Extension** and pick the `orca-summon` folder. Raycast builds it and keeps it installed.

To update: `git pull`, then **Import Extension** again on the same folder.

## Tip

For `orsu` + space to jump straight into the question field, give Quick Summon the alias `orsu` in Raycast Settings → Extensions.

## License

MIT

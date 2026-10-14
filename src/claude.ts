import { LocalStorage } from "@raycast/api";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const ORCA = "/Applications/Orca.app/Contents/Resources/bin/orca";
const exec = promisify(execFile);
const run = (file: string, args: string[]) => exec(file, args, { cwd: homedir() });

export const MODES = [
  { value: "auto", title: "Auto" },
  { value: "bypassPermissions", title: "Bypass (yolo)" },
  { value: "acceptEdits", title: "Accept edits" },
  { value: "plan", title: "Plan" },
  { value: "manual", title: "Manual" },
];

export type Worktree = {
  id: string;
  repoId: string;
  path: string;
  displayName: string;
  isMainWorktree: boolean;
  isArchived: boolean;
};

export type Choice = { worktree: string; mode: string };

export async function listWorktrees(): Promise<Worktree[]> {
  const { stdout } = await run(ORCA, ["worktree", "list", "--json"]);
  const all: Worktree[] = JSON.parse(stdout).result.worktrees;
  return all.filter((w) => !w.isArchived && !w.path.startsWith("/private/tmp/"));
}

export async function lastChoice(worktrees: Worktree[]): Promise<Choice> {
  const saved = await LocalStorage.getItem<string>("worktree");
  const worktree =
    worktrees.find((w) => w.id === saved)?.id ?? worktrees.find((w) => w.isMainWorktree)?.id ?? worktrees[0]?.id;
  const mode = (await LocalStorage.getItem<string>("mode")) ?? MODES[0].value;
  return { worktree, mode };
}

export async function saveChoice({ worktree, mode }: Choice) {
  await LocalStorage.setItem("worktree", worktree);
  await LocalStorage.setItem("mode", mode);
}

export async function launch(prompt: string, { worktree, mode }: Choice) {
  const dir = mkdtempSync(join(tmpdir(), "orca-summon-"));
  const file = join(dir, "prompt.txt");
  writeFileSync(file, prompt);
  const command = `claude --permission-mode ${mode} "$(cat '${file}')"; rm -rf '${dir}'`;
  await run("open", ["-a", "Orca"]);
  await run(ORCA, ["terminal", "create", "--worktree", `id:${worktree}`, "--command", command, "--focus", "--json"]);
}

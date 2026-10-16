import { LocalStorage } from "@raycast/api";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const ORCA = "/Applications/Orca.app/Contents/Resources/bin/orca";
const run = promisify(execFile);

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
  linkedLinearIssue: string | null;
};

export type Terminal = { handle: string; worktreeId: string; connected: boolean; title: string };

export type Choice = { worktree: string; mode: string };

export async function listWorktrees(): Promise<Worktree[]> {
  const { stdout } = await run(ORCA, ["worktree", "list", "--json"]);
  const all: Worktree[] = JSON.parse(stdout).result.worktrees;
  return all.filter((w) => !w.isArchived && !w.path.startsWith("/private/tmp/"));
}

export async function listTerminals(): Promise<Terminal[]> {
  const { stdout } = await run(ORCA, ["terminal", "list", "--json"]);
  const parsed = JSON.parse(stdout).result;
  return (parsed.terminals ?? parsed) as Terminal[];
}

export async function switchTo(handle: string) {
  await run("open", ["-a", "Orca"]);
  await run(ORCA, ["terminal", "switch", "--terminal", handle, "--json"]);
}

export async function send(handle: string, text: string) {
  await run(ORCA, ["terminal", "send", "--terminal", handle, "--text", text, "--enter", "--json"]);
}

function findIssueWorktree(worktrees: Worktree[], issue: string) {
  const t = issue.trim().toLowerCase();
  return (
    worktrees.find((w) => w.linkedLinearIssue?.toLowerCase() === t) ??
    worktrees.find((w) => w.displayName.toLowerCase().includes(t))
  );
}

/**
 * Summon Claude. With a Linear issue, it goes where that issue lives:
 * a live agent in the issue's worktree gets the prompt and the focus; a worktree with no agent
 * gets a new one; no worktree at all, and Claude starts the task from the vault with /start-task.
 * Without an issue, a new agent in the chosen worktree, as always.
 */
export async function summon(
  { prompt, issue }: { prompt: string; issue?: string },
  choice: Choice,
  worktrees: Worktree[],
): Promise<string> {
  const id = issue?.trim();
  if (!id) {
    await launch(prompt, choice);
    return "Claude summoned";
  }
  const worktree = findIssueWorktree(worktrees, id);
  if (worktree) {
    const terminals = (await listTerminals()).filter((t) => t.worktreeId === worktree.id && t.connected);
    const agent = terminals.find((t) => t.title.startsWith("✳")) ?? terminals[0];
    if (agent) {
      await switchTo(agent.handle);
      if (prompt.trim()) await send(agent.handle, prompt);
      return `${id}: back to its agent`;
    }
    await launch(prompt.trim() || `Sigue con ${id}. Lee el tablero de Orca y Linear antes de tocar nada.`, {
      worktree: worktree.id,
      mode: choice.mode,
    });
    return `${id}: new agent in ${worktree.displayName}`;
  }
  const vault = worktrees.find((w) => w.isMainWorktree && w.path.endsWith("/vault"));
  if (!vault) throw new Error(`No worktree for ${id}, and the vault main checkout is not in Orca`);
  await launch(`/start-task ${id}${prompt.trim() ? `\n\n${prompt}` : ""}`, { worktree: vault.id, mode: choice.mode });
  return `${id}: starting it from the vault`;
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

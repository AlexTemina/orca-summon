import { LaunchProps, PopToRootType, showHUD, showToast, Toast } from "@raycast/api";
import { lastChoice, launch, listTerminals, listWorktrees, switchTo, Worktree } from "./claude";

function findWorktree(worktrees: Worktree[], target: string) {
  const t = target.trim().toLowerCase();
  return (
    worktrees.find((w) => w.linkedLinearIssue?.toLowerCase() === t) ??
    worktrees.find((w) => w.displayName.toLowerCase().includes(t)) ??
    worktrees.find((w) => w.path.toLowerCase().includes(t))
  );
}

export default async function Command(props: LaunchProps<{ arguments: Arguments.Jump }>) {
  const { target, prompt } = props.arguments;
  try {
    const worktrees = await listWorktrees();
    const { mode } = await lastChoice(worktrees);
    const worktree = findWorktree(worktrees, target);

    if (worktree) {
      const live = (await listTerminals()).find((t) => t.worktreeId === worktree.id && t.connected);
      if (live) {
        await switchTo(live.handle);
        await showHUD(`Orca: ${worktree.displayName}`, {
          clearRootSearch: true,
          popToRootType: PopToRootType.Immediate,
        });
        return;
      }
      await launch(prompt?.trim() || `Sigue con ${target}. Lee el tablero de Orca y Linear antes de tocar nada.`, {
        worktree: worktree.id,
        mode,
      });
      await showHUD(`Claude summoned in ${worktree.displayName}`, {
        clearRootSearch: true,
        popToRootType: PopToRootType.Immediate,
      });
      return;
    }

    const vault = worktrees.find((w) => w.isMainWorktree && w.path.endsWith("/vault"));
    if (!vault) throw new Error("No worktree matches and the vault main checkout is not in Orca");
    await launch(prompt?.trim() || `/start-task ${target}`, { worktree: vault.id, mode });
    await showHUD(`No worktree for ${target}: starting it from the vault`, {
      clearRootSearch: true,
      popToRootType: PopToRootType.Immediate,
    });
  } catch (error) {
    await showToast({ style: Toast.Style.Failure, title: "Could not jump in Orca", message: String(error) });
  }
}

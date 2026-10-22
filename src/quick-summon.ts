import { LaunchProps, PopToRootType, showHUD, showToast, Toast } from "@raycast/api";
import { lastChoice, listWorktrees, summon } from "./claude";

export default async function Command(props: LaunchProps<{ arguments: Arguments.QuickSummon }>) {
  const { prompt = "", issue = "" } = props.arguments;
  if (!prompt.trim() && !issue.trim()) {
    await showToast({ style: Toast.Style.Failure, title: "Write a question or a Linear issue" });
    return;
  }
  try {
    const worktrees = await listWorktrees();
    const message = await summon({ prompt, issue }, await lastChoice(worktrees), worktrees);
    await showHUD(message, { clearRootSearch: true, popToRootType: PopToRootType.Immediate });
  } catch (error) {
    await showToast({ style: Toast.Style.Failure, title: "Could not open Claude in Orca", message: String(error) });
  }
}

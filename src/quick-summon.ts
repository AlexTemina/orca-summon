import { LaunchProps, PopToRootType, showHUD, showToast, Toast } from "@raycast/api";
import { lastChoice, launch, listWorktrees } from "./claude";

export default async function Command(props: LaunchProps<{ arguments: Arguments.QuickSummon }>) {
  try {
    await launch(props.arguments.prompt, await lastChoice(await listWorktrees()));
    await showHUD("Claude summoned", { clearRootSearch: true, popToRootType: PopToRootType.Immediate });
  } catch (error) {
    await showToast({ style: Toast.Style.Failure, title: "Could not open Claude in Orca", message: String(error) });
  }
}

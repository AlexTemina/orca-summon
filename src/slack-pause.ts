import { LaunchProps, showHUD } from "@raycast/api";
import { getAccessToken, withAccessToken } from "@raycast/utils";
import { dnd, slack } from "./slack";

async function pause(props: LaunchProps<{ arguments: Arguments.SlackPause }>) {
  const minutes = Math.max(1, parseInt(props.arguments.minutes || "60", 10) || 60);
  await dnd(getAccessToken().token, "dnd.setSnooze", { num_minutes: String(minutes) });
  await showHUD(`Slack paused for ${minutes} min`);
}

export default withAccessToken(slack)(pause);

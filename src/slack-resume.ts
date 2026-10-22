import { showHUD } from "@raycast/api";
import { getAccessToken, withAccessToken } from "@raycast/utils";
import { dnd, slack } from "./slack";

async function resume() {
  await dnd(getAccessToken().token, "dnd.endSnooze");
  await showHUD("Slack notifications back on");
}

export default withAccessToken(slack)(resume);

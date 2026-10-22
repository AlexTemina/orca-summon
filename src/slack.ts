import { OAuthService } from "@raycast/utils";

/** Raycast's own Slack app, the one the Slack extension already uses: no Slack app of ours to get approved. */
export const slack = OAuthService.slack({ scope: "dnd:write" });

export async function dnd(token: string, method: "dnd.setSnooze" | "dnd.endSnooze", params: Record<string, string> = {}) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const reply = (await response.json()) as { ok: boolean; error?: string };
  if (!reply.ok && reply.error !== "snooze_not_active") throw new Error(`Slack ${method}: ${reply.error}`);
}

import { Action, ActionPanel, closeMainWindow, Form, PopToRootType, showToast, Toast } from "@raycast/api";
import { basename } from "node:path";
import { useEffect, useState } from "react";
import { Choice, lastChoice, launch, listWorktrees, MODES, saveChoice, Worktree } from "./claude";

type Values = Choice & { prompt: string };

function groupByRepo(worktrees: Worktree[]) {
  const groups = new Map<string, Worktree[]>();
  for (const w of worktrees) groups.set(w.repoId, [...(groups.get(w.repoId) ?? []), w]);
  return [...groups.values()].map((ws) => {
    const main = ws.find((w) => w.isMainWorktree) ?? ws[0];
    return { title: basename(main.path), worktrees: [main, ...ws.filter((w) => w !== main)] };
  });
}

export default function Command() {
  const [worktrees, setWorktrees] = useState<Worktree[]>();
  const [choice, setChoice] = useState<Choice>();

  useEffect(() => {
    listWorktrees()
      .then(async (ws) => {
        setChoice(await lastChoice(ws));
        setWorktrees(ws);
      })
      .catch((error) => {
        setWorktrees([]);
        showToast({ style: Toast.Style.Failure, title: "Could not list Orca worktrees", message: String(error) });
      });
  }, []);

  async function handleSubmit({ prompt, worktree, mode }: Values) {
    if (!prompt.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Write a question first" });
      return;
    }
    try {
      await saveChoice({ worktree, mode });
      await launch(prompt, { worktree, mode });
      await closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
    } catch (error) {
      await showToast({ style: Toast.Style.Failure, title: "Could not open Claude in Orca", message: String(error) });
    }
  }

  return (
    <Form
      isLoading={!worktrees}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Summon Claude" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="prompt" title="Question" placeholder="What do you want to ask?" autoFocus />
      {worktrees && choice && (
        <>
          <Form.Dropdown id="worktree" title="Worktree" defaultValue={choice.worktree}>
            {groupByRepo(worktrees).map((group) => (
              <Form.Dropdown.Section key={group.title} title={group.title}>
                {group.worktrees.map((w) => (
                  <Form.Dropdown.Item key={w.id} value={w.id} title={w.displayName} />
                ))}
              </Form.Dropdown.Section>
            ))}
          </Form.Dropdown>
          <Form.Dropdown id="mode" title="Mode" defaultValue={choice.mode}>
            {MODES.map((m) => (
              <Form.Dropdown.Item key={m.value} value={m.value} title={m.title} />
            ))}
          </Form.Dropdown>
        </>
      )}
    </Form>
  );
}

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type TaskDraft = {
  title: string;
  description: string;
  tag: string;
  time: string;
};

const TAGS = ["General", "Work", "Health", "Home"] as const;

/** Categories that are scheduled and therefore ask for a time. */
export const TIMED_TAGS: string[] = ["Work", "Health"];

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TaskDraft;
  dayName: string;
  onSubmit: (draft: TaskDraft) => void;
};

const empty: TaskDraft = { title: "", description: "", tag: "General", time: "" };

export function TaskDialog({
  open,
  onOpenChange,
  initial,
  dayName,
  onSubmit,
}: TaskDialogProps) {
  const [draft, setDraft] = useState<TaskDraft>(initial ?? empty);

  useEffect(() => {
    if (open) setDraft(initial ?? empty);
  }, [open, initial]);

  const timed = TIMED_TAGS.includes(draft.tag);

  const submit = () => {
    const title = draft.title.trim().slice(0, 120);
    if (!title) return;
    onSubmit({
      title,
      description: draft.description.trim().slice(0, 500),
      tag: draft.tag,
      time: timed ? draft.time : "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2.5rem)] max-w-md rounded-3xl border-border bg-surface p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-extrabold">
            {initial ? "Edit task" : `Add to ${dayName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Title
            </label>
            <input
              autoFocus
              value={draft.title}
              maxLength={120}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="What needs doing?"
              className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-hidden placeholder:text-muted-foreground focus:border-mint"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Description — optional
            </label>
            <textarea
              value={draft.description}
              maxLength={500}
              rows={3}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Add a few details…"
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-hidden placeholder:text-muted-foreground focus:border-mint"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, tag: t }))}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                    draft.tag === t
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {timed ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Time
              </label>
              <input
                type="time"
                value={draft.time}
                onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-hidden focus:border-mint"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="mt-2 flex-row gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-primary-foreground glow-mint"
          >
            {initial ? "Save" : "Add task"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

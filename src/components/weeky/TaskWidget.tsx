import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

type WidgetTask = { id: string; title: string; done: boolean };

type TaskWidgetProps = {
  /** Tasks in order, as they appear in the day list. */
  tasks: WidgetTask[];
  dayName: string;
  onToggle: (id: string) => void;
};

/**
 * iOS-style home screen widget preview: one task at a time,
 * arrows to step through, a single tick to complete it.
 */
export function TaskWidget({ tasks, dayName, onToggle }: TaskWidgetProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index > tasks.length - 1) setIndex(Math.max(0, tasks.length - 1));
  }, [tasks.length, index]);

  const task = tasks[index];
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-5 card-elev">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-mint/10 blur-2xl"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-mint text-[11px] font-extrabold text-primary-foreground">
            W
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Weeky · {dayName}
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-widest text-mint">
          {doneCount}/{total}
        </span>
      </div>

      <div className="mt-4 min-h-[4.5rem]">
        {task ? (
          <p
            className={`font-display text-xl font-extrabold leading-snug line-clamp-3 ${
              task.done ? "text-muted-foreground line-through" : ""
            }`}
          >
            {task.title}
          </p>
        ) : (
          <p className="font-display text-xl font-extrabold leading-snug text-muted-foreground">
            All clear for {dayName}.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          aria-label="Previous task"
          disabled={!task || index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface-2 text-muted-foreground disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next task"
          disabled={!task || index >= total - 1}
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface-2 text-muted-foreground disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="mx-1 flex min-w-0 flex-1 items-center justify-center gap-1.5">
          {tasks.slice(0, 8).map((t, i) => (
            <span
              key={t.id}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-mint" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <button
          aria-label={task?.done ? "Mark incomplete" : "Mark complete"}
          disabled={!task}
          onClick={() => task && onToggle(task.id)}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition-colors disabled:opacity-40 ${
            task?.done ? "border-mint bg-mint glow-mint" : "border-border bg-surface-2"
          }`}
        >
          <Check
            className={`h-4 w-4 ${
              task?.done ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

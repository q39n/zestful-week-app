import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { ProgressRing } from "@/components/weeky/ProgressRing";
import { TaskDialog, type TaskDraft } from "@/components/weeky/TaskDialog";

type Task = {
  id: string;
  title: string;
  tag: string;
  done: boolean;
  description?: string;
  time?: string;
};
type DayPlan = { key: string; name: string; date: string; hijri: string; tasks: Task[] };

const initialWeek: DayPlan[] = [
  {
    key: "sun",
    name: "Sunday",
    date: "August 9",
    hijri: "Safar 19",
    tasks: [
      { id: "1", title: "Plan the week ahead", tag: "General", done: true },
      { id: "2", title: "Morning run — 5km", tag: "Health", done: true },
      { id: "3", title: "Draft Q3 roadmap", tag: "Work", done: false },
    ],
  },
  {
    key: "mon",
    name: "Monday",
    date: "August 10",
    hijri: "Safar 20",
    tasks: [
      { id: "4", title: "Team standup", tag: "Work", done: false },
      { id: "5", title: "Grocery run", tag: "Home", done: false },
    ],
  },
  {
    key: "tue",
    name: "Tuesday",
    date: "August 11",
    hijri: "Safar 21",
    tasks: [{ id: "6", title: "Deep work block", tag: "Work", done: false }],
  },
  {
    key: "wed",
    name: "Wednesday",
    date: "August 12",
    hijri: "Safar 22",
    tasks: [{ id: "7", title: "Call mum", tag: "General", done: false }],
  },
  {
    key: "thu",
    name: "Thursday",
    date: "August 13",
    hijri: "Safar 23",
    tasks: [{ id: "8", title: "Gym — upper body", tag: "Health", done: false }],
  },
  {
    key: "fri",
    name: "Friday",
    date: "August 14",
    hijri: "Safar 24",
    tasks: [{ id: "9", title: "Weekly review", tag: "General", done: false }],
  },
  {
    key: "sat",
    name: "Saturday",
    date: "August 15",
    hijri: "Safar 25",
    tasks: [{ id: "10", title: "Clean the flat", tag: "Home", done: false }],
  },
];

export const Route = createFileRoute("/")({
  component: Weeky,
});

function Weeky() {
  const [week, setWeek] = useState<DayPlan[]>(initialWeek);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const day = week[activeIndex] ?? week[0]!;

  const weekStats = useMemo(() => {
    const all = week.flatMap((d) => d.tasks);
    const done = all.filter((t) => t.done).length;
    const daysDone = week.filter((d) => d.tasks.length > 0 && d.tasks.every((t) => t.done)).length;
    return {
      pct: all.length ? (done / all.length) * 100 : 0,
      done,
      total: all.length,
      daysDone,
    };
  }, [week]);

  const dayPct = day.tasks.length
    ? (day.tasks.filter((t) => t.done).length / day.tasks.length) * 100
    : 0;

  const toggle = (id: string) =>
    setWeek((w) =>
      w.map((d, i) =>
        i === activeIndex
          ? { ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }
          : d,
      ),
    );

  const remove = (id: string) =>
    setWeek((w) =>
      w.map((d, i) => (i === activeIndex ? { ...d, tasks: d.tasks.filter((t) => t.id !== id) } : d)),
    );

  const move = (id: string, dir: -1 | 1) => {
    const target = (activeIndex + dir + week.length) % week.length;
    setWeek((w) => {
      const task = w[activeIndex]?.tasks.find((t) => t.id === id);
      if (!task) return w;
      return w.map((d, i) => {
        if (i === activeIndex) return { ...d, tasks: d.tasks.filter((t) => t.id !== id) };
        if (i === target) return { ...d, tasks: [...d.tasks, task] };
        return d;
      });
    });
  };

  const editing = editingId ? day.tasks.find((t) => t.id === editingId) : undefined;

  const submitTask = (draft: TaskDraft) => {
    setWeek((w) =>
      w.map((d, i) => {
        if (i !== activeIndex) return d;
        if (editingId) {
          return {
            ...d,
            tasks: d.tasks.map((t) => (t.id === editingId ? { ...t, ...draft } : t)),
          };
        }
        return {
          ...d,
          tasks: [...d.tasks, { id: crypto.randomUUID(), done: false, ...draft }],
        };
      }),
    );
    setEditingId(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-32 pt-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-mint">
            Week 32 · 2026
          </p>
          <h1 className="truncate font-display text-3xl font-extrabold">Weeky</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
          <Flame className="h-4 w-4 text-mint" />
          <span className="text-sm font-semibold">{weekStats.daysDone}</span>
        </div>
      </header>

      <section className="mt-6 rounded-3xl border border-border bg-surface p-5 card-elev">
        <div className="flex items-center gap-5">
          <ProgressRing value={weekStats.pct} label="week" />
          <div className="min-w-0">
            <p className="font-display text-3xl font-extrabold leading-none">
              {weekStats.done}
              <span className="text-muted-foreground">/{weekStats.total}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">tasks done this week</p>
            <p className="mt-1 text-xs text-mint-soft">
              {weekStats.daysDone} full days completed
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {week.map((d, i) => {
            const pct = d.tasks.length
              ? d.tasks.filter((t) => t.done).length / d.tasks.length
              : 0;
            const active = i === activeIndex;
            return (
              <button
                key={d.key}
                onClick={() => setActiveIndex(i)}
                className={`flex flex-col items-center gap-2 rounded-2xl px-1 py-2.5 transition-colors ${
                  active ? "bg-mint text-primary-foreground" : "bg-surface-2 text-muted-foreground"
                }`}
              >
                <span className="text-[11px] font-bold uppercase">{d.name.slice(0, 2)}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    pct === 1 && d.tasks.length
                      ? active
                        ? "bg-primary-foreground"
                        : "bg-mint"
                      : active
                        ? "bg-primary-foreground/40"
                        : "bg-border"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <button
            aria-label="Previous day"
            onClick={() => setActiveIndex((i) => (i === 0 ? week.length - 1 : i - 1))}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 text-center">
            <h2 className="truncate font-display text-2xl font-bold">{day.name}</h2>
            <p className="truncate text-xs text-muted-foreground">
              {day.date}, 2026 · {day.hijri} 1448
            </p>
          </div>
          <button
            aria-label="Next day"
            onClick={() => setActiveIndex((i) => (i + 1) % week.length)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-mint transition-[width] duration-500"
              style={{ width: `${dayPct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-mint">{Math.round(dayPct)}%</span>
        </div>

        <ul className="mt-4 space-y-2.5">
          {day.tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-2xl border border-border bg-surface px-4 py-3.5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-semibold ${
                      task.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {task.tag}
                    </span>
                    {task.time ? (
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-mint">
                        {task.time}
                      </span>
                    ) : null}
                  </div>
                  {task.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                <button
                  aria-label="Delete task"
                  onClick={() => remove(task.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                <button
                  aria-label="Move to previous day"
                  onClick={() => move(task.id, -1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  aria-label="Move to next day"
                  onClick={() => move(task.id, 1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted-foreground"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  aria-label="Edit task"
                  onClick={() => {
                    setEditingId(task.id);
                    setDialogOpen(true);
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  onClick={() => toggle(task.id)}
                  className={`ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors ${
                    task.done ? "border-mint bg-mint" : "border-border bg-surface-2"
                  }`}
                >
                  <Check
                    className={`h-4 w-4 ${
                      task.done ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>
            </li>
          ))}
          {day.tasks.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing planned for {day.name}.
            </li>
          ) : null}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-border bg-background/85 px-5 pb-6 pt-3 backdrop-blur-xl">
        <button
          onClick={() => {
            setEditingId(null);
            setDialogOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-3.5 text-sm font-bold text-primary-foreground glow-mint"
        >
          <Plus className="h-5 w-5" />
          Add task
        </button>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditingId(null);
        }}
        dayName={day.name}
        initial={
          editing
            ? {
                title: editing.title,
                description: editing.description ?? "",
                tag: editing.tag,
                time: editing.time ?? "",
              }
            : undefined
        }
        onSubmit={submitTask}
      />

    </main>
  );
}

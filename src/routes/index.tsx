import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Trash2,
} from "lucide-react";
import { ProgressRing } from "@/components/weeky/ProgressRing";

type Task = { id: string; title: string; tag: string; done: boolean };
type DayPlan = { key: string; name: string; date: string; hijri: string; tasks: Task[] };

const TAGS = ["General", "Work", "Health", "Home"] as const;

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
  const [draft, setDraft] = useState("");
  const [draftTag, setDraftTag] = useState<string>("General");

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

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    setWeek((w) =>
      w.map((d, i) =>
        i === activeIndex
          ? {
              ...d,
              tasks: [
                ...d.tasks,
                { id: crypto.randomUUID(), title, tag: draftTag, done: false },
              ],
            }
          : d,
      ),
    );
    setDraft("");
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
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
            >
              <button
                aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                onClick={() => toggle(task.id)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-colors ${
                  task.done ? "border-mint bg-mint" : "border-border bg-surface-2"
                }`}
              >
                {task.done ? <Check className="h-3.5 w-3.5 text-primary-foreground" /> : null}
              </button>
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${
                    task.done ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {task.title}
                </p>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {task.tag}
                </span>
              </div>
              <button
                aria-label="Delete task"
                onClick={() => remove(task.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setDraftTag(t)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                draftTag === t ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={`Add to ${day.name}…`}
            className="min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-hidden placeholder:text-muted-foreground focus:border-mint"
          />
          <button
            aria-label="Add task"
            onClick={add}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-primary-foreground glow-mint"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { TaskWidget } from "@/components/weeky/TaskWidget";
import { WeekPicker } from "@/components/weeky/WeekPicker";
import {
  addDays,
  dayNames,
  formatDay,
  formatHijri,
  formatRange,
  startOfWeek,
  toISO,
  weekInfo,
  weekStartFromYearWeek,
  weeksInYear,
} from "@/lib/week";

type Task = {
  id: string;
  title: string;
  tag: string;
  done: boolean;
  description?: string;
  time?: string;
};

const today = new Date();
const thisWeekStart = startOfWeek(today);

const seed = (): Record<string, Task[]> => {
  const d = (n: number) => toISO(addDays(thisWeekStart, n));
  return {
    [d(0)]: [
      { id: "1", title: "Plan the week ahead", tag: "General", done: true },
      { id: "2", title: "Morning run — 5km", tag: "Health", done: true },
      { id: "3", title: "Draft Q3 roadmap", tag: "Work", done: false },
    ],
    [d(1)]: [
      { id: "4", title: "Team standup", tag: "Work", done: false },
      { id: "5", title: "Grocery run", tag: "Home", done: false },
    ],
    [d(2)]: [{ id: "6", title: "Deep work block", tag: "Work", done: false }],
    [d(3)]: [{ id: "7", title: "Call mum", tag: "General", done: false }],
    [d(4)]: [{ id: "8", title: "Gym — upper body", tag: "Health", done: false }],
    [d(5)]: [{ id: "9", title: "Weekly review", tag: "General", done: false }],
    [d(6)]: [{ id: "10", title: "Clean the flat", tag: "Home", done: false }],
  };
};

export const Route = createFileRoute("/")({
  component: Weeky,
  head: () => ({
    meta: [
      { title: "Weeky — Plan Your Week, One Day at a Time" },
      {
        name: "description",
        content:
          "Weeky is a focused weekly planner: pick any week, add tasks with categories and times, and track your daily and weekly progress.",
      },
      { property: "og:title", content: "Weeky — Plan Your Week, One Day at a Time" },
      {
        property: "og:description",
        content:
          "A minimal mobile weekly planner with per-day progress, categories and quick task editing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Weeky() {
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>(seed);
  const [weekStart, setWeekStart] = useState<Date>(thisWeekStart);
  const [activeIndex, setActiveIndex] = useState(today.getDay());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const { year, week } = weekInfo(weekStart);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const iso = toISO(date);
        return {
          iso,
          date,
          name: dayNames[i]!,
          tasks: tasksByDate[iso] ?? [],
          isToday: iso === toISO(today),
        };
      }),
    [weekStart, tasksByDate],
  );

  const day = days[activeIndex] ?? days[0]!;

  const weekStats = useMemo(() => {
    const all = days.flatMap((d) => d.tasks);
    const done = all.filter((t) => t.done).length;
    const daysDone = days.filter((d) => d.tasks.length > 0 && d.tasks.every((t) => t.done)).length;
    return { pct: all.length ? (done / all.length) * 100 : 0, done, total: all.length, daysDone };
  }, [days]);

  const dayPct = day.tasks.length
    ? (day.tasks.filter((t) => t.done).length / day.tasks.length) * 100
    : 0;

  const setDayTasks = (iso: string, fn: (tasks: Task[]) => Task[]) =>
    setTasksByDate((prev) => ({ ...prev, [iso]: fn(prev[iso] ?? []) }));

  const toggle = (id: string) =>
    setDayTasks(day.iso, (ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setDayTasks(day.iso, (ts) => ts.filter((t) => t.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    const targetIso = toISO(addDays(day.date, dir));
    setTasksByDate((prev) => {
      const from = prev[day.iso] ?? [];
      const task = from.find((t) => t.id === id);
      if (!task) return prev;
      return {
        ...prev,
        [day.iso]: from.filter((t) => t.id !== id),
        [targetIso]: [...(prev[targetIso] ?? []), task],
      };
    });
    const next = activeIndex + dir;
    if (next >= 0 && next <= 6) return;
    setWeekStart((w) => addDays(w, dir * 7));
    setActiveIndex(dir === 1 ? 0 : 6);
  };

  const editing = editingId ? day.tasks.find((t) => t.id === editingId) : undefined;

  const submitTask = (draft: TaskDraft) => {
    setDayTasks(day.iso, (ts) =>
      editingId
        ? ts.map((t) => (t.id === editingId ? { ...t, ...draft } : t))
        : [...ts, { id: crypto.randomUUID(), done: false, ...draft }],
    );
    setEditingId(null);
  };

  const goToWeek = (start: Date, index?: number) => {
    setWeekStart(start);
    setActiveIndex(index ?? 0);
  };

  if (!hydrated) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-32 pt-8">
        <h1 className="truncate font-display text-3xl font-extrabold">Weeky</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-32 pt-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <WeekPicker
            year={year}
            week={week}
            weeksInYear={weeksInYear(year)}
            rangeLabel={formatRange(weekStart)}
            onPrev={() => goToWeek(addDays(weekStart, -7), activeIndex)}
            onNext={() => goToWeek(addDays(weekStart, 7), activeIndex)}
            onSelect={(y, w) => goToWeek(weekStartFromYearWeek(y, w))}
            onToday={() => goToWeek(thisWeekStart, today.getDay())}
          />
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
            <p className="mt-1 truncate text-xs text-mint-soft">{formatRange(weekStart)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            const pct = d.tasks.length ? d.tasks.filter((t) => t.done).length / d.tasks.length : 0;
            const active = i === activeIndex;
            return (
              <button
                key={d.iso}
                onClick={() => setActiveIndex(i)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 transition-colors ${
                  active ? "bg-mint text-primary-foreground" : "bg-surface-2 text-muted-foreground"
                }`}
              >
                <span className="text-[11px] font-bold uppercase">{d.name.slice(0, 2)}</span>
                <span
                  className={`text-[10px] font-semibold ${
                    d.isToday && !active ? "text-mint" : "opacity-70"
                  }`}
                >
                  {d.date.getDate()}
                </span>
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

      <section className="mt-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Widget preview
        </p>
        <TaskWidget tasks={day.tasks} dayName={day.name} onToggle={toggle} />
      </section>

      <section className="mt-7">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <button
            aria-label="Previous day"
            onClick={() =>
              activeIndex === 0 ? goToWeek(addDays(weekStart, -7), 6) : setActiveIndex((i) => i - 1)
            }
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 text-center">
            <h2 className="truncate font-display text-2xl font-bold">{day.name}</h2>
            <p className="truncate text-xs text-muted-foreground">
              {formatDay(day.date)}, {day.date.getFullYear()} · {formatHijri(day.date)}
            </p>
          </div>
          <button
            aria-label="Next day"
            onClick={() =>
              activeIndex === 6 ? goToWeek(addDays(weekStart, 7), 0) : setActiveIndex((i) => i + 1)
            }
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
            <li key={task.id} className="rounded-2xl border border-border bg-surface px-4 py-3.5">
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

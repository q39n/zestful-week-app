import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  year: number;
  week: number;
  weeksInYear: number;
  rangeLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (year: number, week: number) => void;
  onToday: () => void;
};

export function WeekPicker({
  year,
  week,
  weeksInYear,
  rangeLabel,
  onPrev,
  onNext,
  onSelect,
  onToday,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(year);
  const years = Array.from({ length: 7 }, (_, i) => year - 3 + i);
  const weeks = Array.from({ length: weeksInYear }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Previous week"
        onClick={onPrev}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setDraftYear(year);
        }}
      >
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-mint">
            <CalendarDays className="h-3.5 w-3.5" />
            Week {week} · {year}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="pointer-events-auto w-[17rem] rounded-2xl border-border bg-surface p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">{rangeLabel}</p>
            <button
              onClick={() => {
                onToday();
                setOpen(false);
              }}
              className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-mint"
            >
              Today
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              aria-label="Previous year"
              onClick={() => setDraftYear((y) => y - 1)}
              className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-muted-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-display text-lg font-bold">{draftYear}</span>
            <button
              aria-label="Next year"
              onClick={() => setDraftYear((y) => y + 1)}
              className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-muted-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {years.slice(0, 0)}
            {weeks.map((w) => {
              const active = w === week && draftYear === year;
              return (
                <button
                  key={w}
                  onClick={() => {
                    onSelect(draftYear, w);
                    setOpen(false);
                  }}
                  className={`h-8 w-8 rounded-lg text-[11px] font-semibold transition-colors ${
                    active
                      ? "bg-mint text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <button
        aria-label="Next week"
        onClick={onNext}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted-foreground"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

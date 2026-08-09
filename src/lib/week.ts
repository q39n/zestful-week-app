export const DAY_MS = 86400000;

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const startOfWeek = (d: Date) => addDays(d, -d.getDay());

const firstSunday = (year: number) => startOfWeek(new Date(year, 0, 1));

/** Week label year is taken from the Wednesday of the week. */
export const weekInfo = (weekStart: Date) => {
  const mid = addDays(weekStart, 3);
  const year = mid.getFullYear();
  const week = Math.round((weekStart.getTime() - firstSunday(year).getTime()) / (7 * DAY_MS)) + 1;
  return { year, week };
};

export const weeksInYear = (year: number) => weekInfo(startOfWeek(new Date(year, 11, 31))).week;

export const weekStartFromYearWeek = (year: number, week: number) =>
  addDays(firstSunday(year), (week - 1) * 7);

const gregorian = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });
const gregorianShort = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

let hijriFmt: Intl.DateTimeFormat | null = null;
const hijri = (d: Date) => {
  try {
    hijriFmt ??= new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return hijriFmt.format(d);
  } catch {
    return "";
  }
};

export const formatDay = (d: Date) => gregorian.format(d);
export const formatHijri = (d: Date) => hijri(d);
export const formatRange = (start: Date) =>
  `${gregorianShort.format(start)} – ${gregorianShort.format(addDays(start, 6))}`;

export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

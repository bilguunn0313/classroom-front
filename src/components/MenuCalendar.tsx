"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

interface MenuCalendarProps {
  year: number;
  month: number; // 1-12
  menuDates: Set<string>; // Set of "YYYY-MM-DD"
  selectedDate: string | null; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

const DAY_LABELS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

const MONTH_NAMES = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

export function MenuCalendar({
  year,
  month,
  menuDates,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: MenuCalendarProps) {
  const currentMonth = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {year} оны {MONTH_NAMES[month - 1]}
        </h2>
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1.5">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider py-1.5"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const todayFlag = isToday(day);
          const selected = selectedDate
            ? isSameDay(day, new Date(selectedDate + "T00:00:00"))
            : false;
          const hasMenu = menuDates.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              disabled={!inMonth}
              className={`
                relative flex flex-col items-center justify-center
                h-10 sm:h-11 rounded-lg text-sm font-medium transition-all duration-150
                ${!inMonth ? "text-muted-foreground/20 cursor-default" : "cursor-pointer"}
                ${selected ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : ""}
                ${!selected && inMonth ? "hover:bg-muted" : ""}
                ${todayFlag && !selected ? "text-brand-600 font-semibold" : ""}
                ${inMonth && !selected && !todayFlag ? "text-foreground" : ""}
              `}
            >
              {todayFlag && !selected && (
                <span className="absolute inset-1 rounded-md border-2 border-brand-400/50" />
              )}
              <span className="relative">{format(day, "d")}</span>
              {hasMenu && inMonth && (
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    selected ? "bg-white/80" : "bg-brand-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

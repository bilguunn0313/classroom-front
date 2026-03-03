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
  "1-р сар", "2-р сар", "3-р сар", "4-р сар",
  "5-р сар", "6-р сар", "7-р сар", "8-р сар",
  "9-р сар", "10-р сар", "11-р сар", "12-р сар",
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
  // Monday-first week
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {year} оны {MONTH_NAMES[month - 1]}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-gray-400 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate ? isSameDay(day, new Date(selectedDate + "T00:00:00")) : false;
          const hasMenu = menuDates.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              disabled={!inMonth}
              className={`
                relative flex flex-col items-center justify-center
                h-10 sm:h-11 rounded-lg text-sm transition-all
                ${!inMonth ? "text-gray-200 cursor-default" : "cursor-pointer hover:bg-blue-50"}
                ${selected ? "bg-blue-500 text-white hover:bg-blue-600 font-semibold" : ""}
                ${today && !selected ? "ring-2 ring-blue-400 font-semibold text-blue-600" : ""}
                ${inMonth && !selected && !today ? "text-gray-700" : ""}
              `}
            >
              <span>{format(day, "d")}</span>
              {hasMenu && inMonth && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    selected ? "bg-white" : "bg-blue-400"
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

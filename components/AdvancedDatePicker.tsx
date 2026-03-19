"use client";

import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import {
  addMonths,
  setMonth as dfSetMonth,
  setYear as dfSetYear,
  eachDayOfInterval,
  endOfMonth,
  format,
  getMonth,
  getYear,
  startOfMonth,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface AdvancedDatePickerProps {
  value?: string | null;
  onChange?: (date: string | null) => void;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  placeholder?: string;
}

type ViewMode = "date" | "month" | "year";

export default function AdvancedDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  label = "Select Date",
  placeholder = "Pick a date",
}: AdvancedDatePickerProps) {
  const [open, setOpen] = useState(false);

  // baseMonth stores the focused month/year for the picker UI (startOfMonth)
  const [baseMonth, setBaseMonth] = useState<Date>(
    startOfMonth(value || new Date())
  );
  const [view, setView] = useState<ViewMode>("date");

  // For year-grid paging (show e.g. 12 years at a time)
  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const y = getYear(baseMonth);
    return y - 6; // show y-6 ... y+5 (12 years)
  });

  useEffect(() => {
    if (value) setBaseMonth(startOfMonth(value));
  }, [value]);

  // sync yearPageStart when baseMonth year changes
  useEffect(() => {
    const y = getYear(baseMonth);
    if (y < yearPageStart || y >= yearPageStart + 12) {
      setYearPageStart(y - 6);
    }
  }, [baseMonth, yearPageStart]);

  // days to render when in date view
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(baseMonth),
        end: endOfMonth(baseMonth),
      }),
    [baseMonth]
  );

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // if a subview is open, close it first
        if (view !== "date") setView("date");
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [view]);

  const handleSelectDay = (d: Date) => {
    if (isDisabled(d)) return;
    onChange?.(`${d}`);
    setOpen(false);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const updated = dfSetMonth(baseMonth, monthIndex); // changes month, keeps year
    setBaseMonth(startOfMonth(updated));
    setView("date");
  };

  const handleSelectYear = (year: number) => {
    const updated = dfSetYear(baseMonth, year);
    setBaseMonth(startOfMonth(updated));
    setView("month"); // optional: after picking year, go to month picker so user can pick month quickly
  };

  const monthLabel = format(baseMonth, "MMMM");
  const yearLabel = String(getYear(baseMonth));

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium mb-1 block text-gray-700">
          {label}
        </label>
      )}

      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setView("date");
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            className={clsx(
              "flex items-center justify-between bg-white w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900",
              "focus:outline-none focus:ring-0 focus:ring-blue-500 transition-all duration-150"
            )}
          >
            <span className={clsx(value ? "text-gray-900" : "text-gray-400")}>
              {value ? format(value, "PPP") : placeholder}
            </span>
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content sideOffset={8} align="center" className="z-50">
            <AnimatePresence>
              {open && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.96, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="w-100 bg-white rounded-2xl shadow-xl border border-gray-200 p-4"
                >
                  {/* Header with clickable month & year */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // prev depends on current view: date -> month prev (go to previous month)
                          if (view === "date")
                            setBaseMonth((b) => addMonths(b, -1));
                          else if (view === "month")
                            setBaseMonth((b) => addMonths(b, -12));
                          // page back a year block
                          else setYearPageStart((s) => s - 12);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-baseline gap-2 select-none">
                        <button
                          type="button"
                          onClick={() => setView("month")}
                          className="text-sm font-semibold text-gray-800 hover:underline focus:outline-none"
                          aria-haspopup="listbox"
                          aria-expanded={view === "month"}
                        >
                          {monthLabel}
                        </button>

                        <button
                          type="button"
                          onClick={() => setView("year")}
                          className="text-sm text-gray-500 hover:underline focus:outline-none"
                          aria-haspopup="listbox"
                          aria-expanded={view === "year"}
                        >
                          {yearLabel}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          // next depends on current view
                          if (view === "date")
                            setBaseMonth((b) => addMonths(b, 1));
                          else if (view === "month")
                            setBaseMonth((b) => addMonths(b, 12));
                          else setYearPageStart((s) => s + 12);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onChange?.(`${new Date()}`);
                          setOpen(false);
                        }}
                        className="text-sm px-3 py-1 rounded bg-gray-50 hover:bg-gray-100"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                        }}
                        className="text-sm px-3 py-1 rounded bg-gray-50 hover:bg-gray-100"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Views container */}
                  <div>
                    <AnimatePresence mode="wait">
                      {view === "date" && (
                        <motion.div
                          key="view-date"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.14 }}
                        >
                          <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                              (d) => (
                                <div key={d}>{d}</div>
                              )
                            )}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              // We want to render leading blanks so the first day falls under correct weekday.
                              const firstWeekday =
                                startOfMonth(baseMonth).getDay();
                              const blanks = Array.from(
                                { length: firstWeekday },
                                (_, i) => (
                                  <div key={`b-${i}`} className="h-10" />
                                )
                              );
                              return (
                                <>
                                  {blanks}
                                  {days.map((day) => {
                                    const selected =
                                      !!value &&
                                      format(day, "yyyy-MM-dd") ===
                                        format(value, "yyyy-MM-dd");
                                    const disabled = isDisabled(day);
                                    const isToday =
                                      format(day, "yyyy-MM-dd") ===
                                      format(new Date(), "yyyy-MM-dd");
                                    return (
                                      <button
                                        key={day.toISOString()}
                                        type="button"
                                        onClick={() => handleSelectDay(day)}
                                        disabled={disabled}
                                        className={clsx(
                                          "w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-150",
                                          disabled &&
                                            "text-gray-300 cursor-not-allowed",
                                          selected &&
                                            "bg-blue-600 text-white shadow",
                                          !selected &&
                                            !disabled &&
                                            (isToday
                                              ? "ring-1 ring-blue-200 text-blue-700"
                                              : "hover:bg-blue-50 text-gray-700")
                                        )}
                                        aria-pressed={selected}
                                      >
                                        {day.getDate()}
                                      </button>
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </div>
                        </motion.div>
                      )}

                      {view === "month" && (
                        <motion.div
                          key="view-month"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.14 }}
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 12 }).map((_, m) => {
                              const monthName = format(
                                dfSetMonth(baseMonth, m),
                                "MMM"
                              );
                              const disabledSample = isDisabled(
                                startOfMonth(dfSetMonth(baseMonth, m))
                              ); // if whole month disabled based on min/max
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => handleSelectMonth(m)}
                                  className={clsx(
                                    "py-2 rounded-md text-sm transition",
                                    disabledSample &&
                                      "text-gray-300 cursor-not-allowed",
                                    getMonth(baseMonth) === m &&
                                      "bg-blue-600 text-white shadow",
                                    getMonth(baseMonth) !== m &&
                                      !disabledSample &&
                                      "hover:bg-blue-50"
                                  )}
                                  disabled={disabledSample}
                                >
                                  {monthName}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {view === "year" && (
                        <motion.div
                          key="view-year"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.14 }}
                        >
                          <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => {
                              const y = yearPageStart + i;
                              const disabledSample =
                                (minDate && y < getYear(minDate)) ||
                                (maxDate && y > getYear(maxDate));
                              return (
                                <button
                                  key={y}
                                  type="button"
                                  onClick={() => handleSelectYear(y)}
                                  className={clsx(
                                    "py-2 rounded-md text-sm transition",
                                    disabledSample &&
                                      "text-gray-300 cursor-not-allowed",
                                    getYear(baseMonth) === y &&
                                      "bg-blue-600 text-white shadow",
                                    getYear(baseMonth) !== y &&
                                      !disabledSample &&
                                      "hover:bg-blue-50"
                                  )}
                                  disabled={disabledSample}
                                >
                                  {y}
                                </button>
                              );
                            })}
                          </div>

                          {/* year pager controls */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Showing {yearPageStart} — {yearPageStart + 11}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setYearPageStart((s) => s - 12)}
                                className="px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 text-sm"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                onClick={() => setYearPageStart((s) => s + 12)}
                                className="px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 text-sm"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

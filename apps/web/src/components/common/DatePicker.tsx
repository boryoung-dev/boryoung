"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" 형식
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function DatePicker({ value, onChange, placeholder = "날짜 선택", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // 값이 있으면 해당 월로 이동
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const handleSelect = (day: number) => {
    onChange(formatDate(viewYear, viewMonth, day));
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
  };

  const isSelected = (day: number) => {
    return value === formatDate(viewYear, viewMonth, day);
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  // 달력 그리드 생성
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[color:var(--surface)] rounded-lg text-sm transition-all duration-200 hover:bg-[color:var(--border)]/30 focus:ring-2 focus:ring-[color:var(--fg)]/10 outline-none"
      >
        <span className={value ? "text-[color:var(--fg)]" : "text-[color:var(--muted)]"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-[color:var(--muted)]" />
      </button>

      {/* 달력 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[color:var(--border)] z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 헤더: 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[color:var(--surface)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[color:var(--muted)]" />
            </button>
            <span className="text-sm font-semibold text-[color:var(--fg)]">
              {viewYear}년 {MONTHS[viewMonth]}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[color:var(--surface)] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[color:var(--muted)]" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-[11px] font-medium py-1.5 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[color:var(--muted)]"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => (
              <div key={idx} className="flex items-center justify-center p-0.5">
                {day ? (
                  <button
                    type="button"
                    onClick={() => !isPast(day) && handleSelect(day)}
                    disabled={isPast(day)}
                    className={`w-9 h-9 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isSelected(day)
                        ? "bg-[color:var(--fg)] text-white"
                        : isToday(day)
                        ? "bg-[color:var(--surface)] text-[color:var(--fg)] font-semibold"
                        : isPast(day)
                        ? "text-[color:var(--border)] cursor-not-allowed"
                        : idx % 7 === 0
                        ? "text-red-400 hover:bg-red-50"
                        : idx % 7 === 6
                        ? "text-blue-400 hover:bg-blue-50"
                        : "text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
                    }`}
                  >
                    {day}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* 하단: 오늘 버튼 + 초기화 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[color:var(--border)]">
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="text-[12px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                onChange(formatDate(t.getFullYear(), t.getMonth(), t.getDate()));
                setIsOpen(false);
              }}
              className="text-[12px] font-medium text-[color:var(--fg)] hover:opacity-70 transition-opacity"
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

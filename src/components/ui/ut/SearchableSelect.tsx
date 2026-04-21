import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type OptionItem = {
  customer_code: string; // unique id/value
  customer_name: string; // label
  [k: string]: any;
};

type Props = {
  options: OptionItem[];
  value: string; // selected customer_code
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  labelRenderer?: (opt: OptionItem) => React.ReactNode; // optional custom label
  id?: string;
};

type MenuRect = { top: number; left: number; width: number; openUp: boolean };

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  labelRenderer,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // memoize filtered options for performance
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options;
    return options.filter((opt) =>
      `${opt.customer_code} ${opt.customer_name}`.toLowerCase().includes(term),
    );
  }, [options, searchTerm]);

  // reset highlight when filtered changes
  useEffect(() => setHighlightIndex(0), [filtered]);

  // compute & track menu position while open — using fixed + portal so the
  // dropdown is never clipped by ancestors like `overflow-x-auto` wrappers.
  useEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const menuHeight = 320; // rough estimate (search + max list)
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < menuHeight && r.top > menuHeight;
      setMenuRect({
        top: openUp ? r.top - 4 : r.bottom + 4,
        left: r.left,
        width: r.width,
        openUp,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // close on outside click (check both wrapper and portaled menu)
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlightIndex];
      if (opt) {
        onSelect(opt.customer_code);
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
  };

  const onSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearchTerm("");
  };

  const selectedLabel = useMemo(() => {
    return options.find((o) => o.customer_code === value);
  }, [options, value]);

  return (
    <div ref={wrapperRef} className="relative w-full" id={id}>
      {/* button / control */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((s) => !s);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        onKeyDown={onKeyDown}
        className={`w-full px-4 py-3 text-left rounded-lg border ${
          disabled
            ? "border-gray-200 dark:border-gray-700"
            : "border-gray-300 dark:border-gray-600 shadow-sm"
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] disabled:opacity-60 disabled:cursor-not-allowed hover:border-[#13725A] transition-all`}
      >
        <div className="flex items-center justify-between">
          <div className="truncate text-sm">
            {selectedLabel ? (
              <span className="inline-block">
                {labelRenderer
                  ? labelRenderer(selectedLabel)
                  : `${selectedLabel.customer_code} — ${selectedLabel.customer_name}`}
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 ml-3 transform transition-transform ${
              open ? "rotate-180" : ""
            } text-gray-500`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12.5 3.5 6h13L10 12.5z" />
          </svg>
        </div>
      </button>

      {/* dropdown (portaled so parent `overflow-*` can't clip it) */}
      {open &&
        menuRect &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuRect.openUp ? undefined : menuRect.top,
              bottom: menuRect.openUp
                ? window.innerHeight - menuRect.top
                : undefined,
              left: menuRect.left,
              width: menuRect.width,
            }}
            className="z-[1000] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
            role="listbox"
            aria-expanded={open}
          >
            <div className="px-3 py-2">
              <input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
                placeholder="Search by ID or Name..."
                className="w-full bg-transparent text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none px-2 py-2"
              />
            </div>

            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No results
                </div>
              ) : (
                filtered.map((opt, idx) => {
                  const isHighlighted = idx === highlightIndex;
                  return (
                    <div
                      key={opt.customer_code}
                      role="option"
                      aria-selected={value === opt.customer_code}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      onClick={() => onSelect(opt.customer_code)}
                      className={`px-4 py-3 cursor-pointer text-sm truncate ${
                        isHighlighted
                          ? "bg-gray-100 dark:bg-gray-700 text-[#13725A] font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {labelRenderer
                        ? labelRenderer(opt)
                        : `${opt.customer_code} — ${opt.customer_name}`}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

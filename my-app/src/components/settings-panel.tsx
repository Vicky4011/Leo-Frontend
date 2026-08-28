"use client";

import { useEffect, useRef, useState } from "react";

const PRESET_COLORS = [
  "#4EA7FF",
  "#9B4DFF",
  "#00C8B7",
  "#FF6818",
  "#D943D9",
  "#4DB8FF",
  "#C5D0DF",
];

export const SIZE_PRESETS = {
  SM: 260,
  MD: 420,
  LG: 560,
} as const;

export type SizeKey = keyof typeof SIZE_PRESETS;

interface SettingsPanelProps {
  colorFrom: string;
  colorTo: string;
  onColorFromChange: (color: string) => void;
  onColorToChange: (color: string) => void;
  sizeKey: SizeKey;
  onSizeChange: (size: SizeKey) => void;
}

export const SettingsPanel = ({
  colorFrom,
  colorTo,
  onColorFromChange,
  onColorToChange,
  sizeKey,
  onSizeChange,
}: SettingsPanelProps) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside the panel/button
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Orb settings"
        aria-expanded={open}
        title="Settings"
        className="settings-toggle"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M19.4 13a7.97 7.97 0 0 0 0-2l2.02-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.38.96a7.98 7.98 0 0 0-1.73-1l-.36-2.53a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.53a7.98 7.98 0 0 0-1.73 1l-2.38-.96a.5.5 0 0 0-.6.22L2.66 8.78a.5.5 0 0 0 .12.64L4.8 11a7.97 7.97 0 0 0 0 2l-2.02 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.38-.96a7.98 7.98 0 0 0 1.73 1l.36 2.53a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.53a7.98 7.98 0 0 0 1.73-1l2.38.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div ref={panelRef} className="settings-panel">
          {/* =========================
              COLOR PICKER
          ========================== */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                color: "var(--foreground)",
                lineHeight: 1,
                fontWeight: 400,
              }}
            >
              Color
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              {PRESET_COLORS.map((color) => {
                const isSelected = colorFrom.toLowerCase() === color.toLowerCase();

                return (
                  <button
                    key={color}
                    type="button"
                    title={`Use ${color}`}
                    onClick={() => onColorFromChange(color)}
                    style={{
                      width: 22,
                      height: 22,
                      minWidth: 22,
                      padding: 0,
                      border: "none",
                      borderRadius: "50%",
                      backgroundColor: color,
                      cursor: "pointer",
                      boxShadow: isSelected
                        ? "0 0 0 2px var(--foreground)"
                        : "none",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "scale(1.15)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="color"
                  value={colorFrom}
                  onChange={(event) => onColorFromChange(event.target.value)}
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
                <span
                  title="Choose From color"
                  style={{
                    width: 30,
                    height: 22,
                    borderRadius: 2,
                    backgroundColor: colorFrom,
                    display: "block",
                    cursor: "pointer",
                    border: "1px solid rgba(127, 127, 127, 0.25)",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                  From
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="color"
                  value={colorTo}
                  onChange={(event) => onColorToChange(event.target.value)}
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
                <span
                  title="Choose To color"
                  style={{
                    width: 30,
                    height: 22,
                    borderRadius: 2,
                    backgroundColor: colorTo,
                    display: "block",
                    cursor: "pointer",
                    border: "1px solid rgba(127, 127, 127, 0.25)",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                  To
                </span>
              </label>
            </div>
          </div>

          {/* =========================
              SIZE PICKER
          ========================== */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                color: "var(--foreground)",
                lineHeight: 1,
                fontWeight: 400,
              }}
            >
              Size
            </span>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                padding: 3,
                borderRadius: 10,
                border: "1px solid var(--toggle-border)",
                backgroundColor: "var(--background)",
                width: "fit-content",
              }}
            >
              {(Object.keys(SIZE_PRESETS) as SizeKey[]).map((key) => {
                const isSelected = sizeKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    title={`${key} (${SIZE_PRESETS[key]}px)`}
                    onClick={() => onSizeChange(key)}
                    style={{
                      padding: "6px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      border: "none",
                      borderRadius: 7,
                      cursor: "pointer",
                      color: isSelected ? "#ffffff" : "var(--foreground)",
                      backgroundColor: isSelected ? "#3f5efb" : "transparent",
                      transition: "background-color 0.15s ease, color 0.15s ease",
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
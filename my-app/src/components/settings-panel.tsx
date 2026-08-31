"use client";

import { useEffect, useRef } from "react";

const PRESET_COLORS = [
  "#4EA7FF",
  "#9B4DFF",
  "#00C8B7",
  "#FF6818",
  "#D943D9",
  "#4DB8FF",
  "#C5D0DF",
];
const ORB_PRESET_COLORS = [
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
  open: boolean;
  onClose: () => void;
  colorFrom: string;
  colorTo: string;
  onColorFromChange: (color: string) => void;
  onColorToChange: (color: string) => void;
  sizeKey: SizeKey;
  onSizeChange: (size: SizeKey) => void;
}

export const SettingsPanel = ({
  open,
  onClose,
  colorFrom,
  colorTo,
  onColorFromChange,
  onColorToChange,
  sizeKey,
  onSizeChange,
}: SettingsPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
          zIndex: 70,
        }}
      />

      {/* Sliding drawer, docked LEFT */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Settings"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: 280,
          background: "var(--toggle-bg)",
          borderRight: "1px solid var(--toggle-border)",
          boxShadow: "8px 0 32px rgba(0, 0, 0, 0.35)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "48px 20px 20px 12px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to sidebar"
            style={{
              display: "grid",
              placeItems: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "var(--input-icon)",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--toggle-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Settings
          </span>
        </div>

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
                    boxShadow: isSelected ? "0 0 0 2px var(--foreground)" : "none",
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
    </>
  );
};
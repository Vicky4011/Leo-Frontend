"use client";

import { useState } from "react";
import { ThemeToggle } from "../src/components/theme-toggle";
import { ParticlesOrb } from "../src/registry/orbe/particles-orb/particles-orb";

const SIZE_PRESETS = {
  SM: 260,
  MD: 420,
  LG: 560,
} as const;

type SizeKey = keyof typeof SIZE_PRESETS;

const PRESET_COLORS = [
  "#4EA7FF",
  "#9B4DFF",
  "#00C8B7",
  "#FF6818",
  "#D943D9",
  "#4DB8FF",
  "#C5D0DF",
];

export default function Home() {
  const [state, setState] = useState<
    | "idle"
    | "connecting"
    | "listening"
    | "thinking"
    | "speaking"
    | "error"
    | "disabled"
  >("idle");

  const [colorFrom, setColorFrom] = useState("#f0abfc");
  const [colorTo, setColorTo] = useState("#818cf8");
  const [sizeKey, setSizeKey] = useState<SizeKey>("MD");

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        color: "var(--foreground)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Theme Toggle */}
      <ThemeToggle />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* =========================
            PARTICLES ORB
        ========================== */}
        <ParticlesOrb
          state={state}
          size={SIZE_PRESETS[sizeKey]}
          speed={1}
          colorFrom={colorFrom}
          colorTo={colorTo}
          label="Particles Orb"
        />

        {/* =========================
            COLOR PICKER
        ========================== */}
        <div
          style={{
            width: "100%",
            maxWidth: 650,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Color title */}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            {/* =========================
                PRESET COLORS
            ========================== */}
            {PRESET_COLORS.map((color) => {
              const isSelected =
                colorFrom.toLowerCase() === color.toLowerCase();

              return (
                <button
                  key={color}
                  type="button"
                  title={`Use ${color}`}
                  onClick={() => {
                    setColorFrom(color);
                  }}
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
                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease",
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

            {/* =========================
                FROM COLOR
            ========================== */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginLeft: 4,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="color"
                value={colorFrom}
                onChange={(event) => {
                  setColorFrom(event.target.value);
                }}
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

              <span
                style={{
                  fontSize: 12,
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
              >
                From
              </span>
            </label>

            {/* =========================
                TO COLOR
            ========================== */}
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
                onChange={(event) => {
                  setColorTo(event.target.value);
                }}
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

              <span
                style={{
                  fontSize: 12,
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
              >
                To
              </span>
            </label>
          </div>
        </div>


        {/* =========================
               SIZE PICKER
        ========================== */}
        <div
          style={{
            width: "100%",
            maxWidth: 650,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
        {/* Size title */}
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

        {/* Segmented control */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            padding: 3,
            borderRadius: 10,
            border: "1px solid var(--toggle-border)",
            backgroundColor: "var(--toggle-bg)",
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
                onClick={() => setSizeKey(key)}
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

        {/* =========================
            ORB STATE BUTTONS
        ========================== */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button onClick={() => setState("idle")}>Idle</button>

          <button onClick={() => setState("connecting")}>
            Connecting
          </button>

          <button onClick={() => setState("listening")}>
            Listening
          </button>

          <button onClick={() => setState("thinking")}>
            Thinking
          </button>

          <button onClick={() => setState("speaking")}>
            Speaking
          </button>

          <button onClick={() => setState("error")}>
            Error
          </button>

          <button onClick={() => setState("disabled")}>
            Disabled
          </button>
        </div>
      </div>
    </main>
  );
}
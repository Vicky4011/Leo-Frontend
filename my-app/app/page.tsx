"use client";

import { useState } from "react";
import { ThemeToggle } from "../src/components/theme-toggle";
import { SettingsPanel, SIZE_PRESETS, type SizeKey } from "../src/components/settings-panel";
import { ParticlesOrb } from "../src/registry/orbe/particles-orb/particles-orb";

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
      <ThemeToggle />

      <SettingsPanel
        colorFrom={colorFrom}
        colorTo={colorTo}
        onColorFromChange={setColorFrom}
        onColorToChange={setColorTo}
        sizeKey={sizeKey}
        onSizeChange={setSizeKey}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <ParticlesOrb
          state={state}
          size={SIZE_PRESETS[sizeKey]}
          speed={1}
          colorFrom={colorFrom}
          colorTo={colorTo}
          label="Particles Orb"
        />

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
          <button onClick={() => setState("connecting")}>Connecting</button>
          <button onClick={() => setState("listening")}>Listening</button>
          <button onClick={() => setState("thinking")}>Thinking</button>
          <button onClick={() => setState("speaking")}>Speaking</button>
          <button onClick={() => setState("error")}>Error</button>
          <button onClick={() => setState("disabled")}>Disabled</button>
        </div>
      </div>
    </main>
  );
}
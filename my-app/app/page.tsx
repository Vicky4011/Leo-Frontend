"use client";

import { useState } from "react";
import { ThemeToggle } from "../src/components/theme-toggle";
import { SettingsPanel, SIZE_PRESETS, type SizeKey } from "../src/components/settings-panel";
import { ParticlesOrb } from "../src/registry/orbe/particles-orb/particles-orb";
import { LeoInputBar } from "../src/components/leo-input-bar";

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

      {/* Orb + state buttons — size changes here no longer affect the input bar below */}
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => setState("idle")}>Idle</button>
          <button onClick={() => setState("connecting")}>Connecting</button>
          <button onClick={() => setState("listening")}>Listening</button>
          <button onClick={() => setState("thinking")}>Thinking</button>
          <button onClick={() => setState("speaking")}>Speaking</button>
          <button onClick={() => setState("error")}>Error</button>
          <button onClick={() => setState("disabled")}>Disabled</button>
        </div>
      </div>

      {/* Input bar — fixed to the bottom of the viewport, independent of orb size */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "0 16px",
          zIndex: 40,
        }}
      >
        <LeoInputBar
          onSend={async (message, files) => {
            console.log("message:", message, "files:", files);
          }}
          onAttach={(files) => console.log("attached:", files)}
          onMicClick={(listening) => console.log("mic listening:", listening)}
        />
      </div>
    </main>
  );

}
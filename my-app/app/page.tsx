"use client";

import { useRef, useState } from "react";
import { ThemeToggle } from "../src/components/theme-toggle";
import { SettingsPanel, SIZE_PRESETS, type SizeKey } from "../src/components/settings-panel";
import { LeoInputBar, type LeoInputBarHandle } from "../src/components/leo-input-bar";
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

  const orbSize = SIZE_PRESETS[sizeKey];
  const orbClickDiameter = Math.round(orbSize * 0.68);

  const leoInputRef = useRef<LeoInputBarHandle>(null);

  const handleOrbClick = () => {
    if (state === "listening") return;
    setState("listening");
    leoInputRef.current?.startListening();
  };

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
        <div
          style={{
            position: "relative",
            width: orbSize,
            height: orbSize,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ pointerEvents: "none" }}>
            <ParticlesOrb
              state={state}
              size={orbSize}
              speed={1}
              colorFrom={colorFrom}
              colorTo={colorTo}
              label="Particles Orb"
            />
          </div>

          <div
            onClick={handleOrbClick}
            role="button"
            tabIndex={0}
            aria-label="Start listening"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOrbClick();
              }
            }}
            style={{
              position: "absolute",
              width: orbClickDiameter,
              height: orbClickDiameter,
              borderRadius: "50%",
              cursor: "pointer",
              border: "1px dashed red",
            }}
          />
        </div>

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
          ref={leoInputRef}
          onSend={async (message, files) => {
            console.log("message:", message, "files:", files);
          }}
          onAttach={(files) => console.log("attached:", files)}
          onMicClick={(listening) => {
            setState(listening ? "listening" : "idle");
          }}
        />
      </div>
    </main>
  );
}
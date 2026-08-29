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
  const [isInputHidden, setIsInputHidden] = useState(false);

  const orbSize = SIZE_PRESETS[sizeKey];
  const orbClickDiameter = Math.round(orbSize * 0.68);

  const leoInputRef = useRef<LeoInputBarHandle>(null);

  const handleOrbClick = () => {
    if (state === "listening") {
      leoInputRef.current?.stopListening();
    } else {
      setState("listening");
      setIsInputHidden(true);
      leoInputRef.current?.startListening();
    }
  };

  const exitLiveMode = () => {
    leoInputRef.current?.stopListening();
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
            aria-label={state === "listening" ? "Stop listening" : "Start listening"}
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

      {/* Bottom slot: crossfades between LeoInputBar and the exit-live-mode X button */}
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
        <div style={{ position: "relative", width: "100%", maxWidth: 620, height: 76 }}>
          {/* Input bar */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              opacity: isInputHidden ? 0 : 1,
              transform: isInputHidden
                ? "translateY(24px) scale(0.96)"
                : "translateY(0) scale(1)",
              pointerEvents: isInputHidden ? "none" : "auto",
              transition: "opacity 0.35s ease, transform 0.35s ease",
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
                if (!listening) {
                  setIsInputHidden(false);
                }
              }}
            />
          </div>

          {/* Exit live-mode button */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: isInputHidden ? 1 : 0,
              transform: isInputHidden
                ? "translateY(0) scale(1)"
                : "translateY(24px) scale(0.9)",
              pointerEvents: isInputHidden ? "auto" : "none",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <button
              type="button"
              onClick={exitLiveMode}
              aria-label="Exit live mode"
              title="Exit live mode"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "1px solid var(--toggle-border)",
                background: "var(--toggle-bg)",
                color: "var(--foreground)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "var(--toggle-hover)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "var(--toggle-bg)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
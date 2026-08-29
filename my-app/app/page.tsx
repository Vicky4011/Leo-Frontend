"use client";

import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "../src/components/theme-toggle";

import {
  SettingsPanel,
  SIZE_PRESETS,
  type SizeKey,
} from "../src/components/settings-panel";

import {
  LeoInputBar,
  type LeoInputBarHandle,
} from "../src/components/leo-input-bar";

import { ParticlesOrb } from "../src/registry/orbe/particles-orb/particles-orb";

type OrbState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "disabled";

// Just below the 42px ThemeToggle (top:16px, right:16px) + a little breathing room
const MINI_ORB_TOP = 72;
const MINI_ORB_RIGHT_MARGIN = 16;
const MINI_ORB_SCALE = 0.55;

export default function Home() {
  const [state, setState] = useState<OrbState>("idle");
  const [colorFrom, setColorFrom] = useState("#f0abfc");
  const [colorTo, setColorTo] = useState("#818cf8");
  const [sizeKey, setSizeKey] = useState<SizeKey>("MD");

  /*
   * ============================================================
   * LIVE MODE
   * ============================================================
   */

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showLiveModeMessage, setShowLiveModeMessage] = useState(false);
  const liveModeMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orbSize = SIZE_PRESETS[sizeKey];
  const orbClickDiameter = Math.round(orbSize * 0.68);

  const leoInputRef = useRef<LeoInputBarHandle | null>(null);

  /*
   * ============================================================
   * ORB "ANIMATE TO CORNER" TOGGLE
   * ============================================================
   */

  const [isOrbAnimated, setIsOrbAnimated] = useState(false);
  const orbPlaceholderRef = useRef<HTMLDivElement>(null);
  const [orbBasePos, setOrbBasePos] = useState({ top: 0, left: 0 });
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = orbPlaceholderRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setOrbBasePos({ top: rect.top, left: rect.left });
      }
      setViewportWidth(window.innerWidth);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [orbSize]);

  const miniLeft = viewportWidth - orbSize - MINI_ORB_RIGHT_MARGIN;

  const toggleOrbAnimation = () => {
    setIsOrbAnimated((prev) => !prev);
  };

  /*
   * ============================================================
   * START LIVE MODE
   * ============================================================
   */

  const startLiveMode = () => {
    if (isLiveMode) {
      return;
    }

    setIsLiveMode(true);
    setState("listening");

    if (liveModeMessageTimerRef.current !== null) {
      clearTimeout(liveModeMessageTimerRef.current);
    }

    setShowLiveModeMessage(true);

    liveModeMessageTimerRef.current = setTimeout(() => {
      setShowLiveModeMessage(false);
      liveModeMessageTimerRef.current = null;
    }, 3000);

    leoInputRef.current?.startLiveMode();
  };

  /*
   * ============================================================
   * ORB CLICK
   * ============================================================
   */

  const handleOrbClick = () => {
    if (isLiveMode) {
      return;
    }

    startLiveMode();
  };

  /*
   * ============================================================
   * EXIT LIVE MODE
   * ============================================================
   */

  const exitLiveMode = () => {
    leoInputRef.current?.stopListening();
    setIsLiveMode(false);
    setShowLiveModeMessage(false);

    if (liveModeMessageTimerRef.current !== null) {
      clearTimeout(liveModeMessageTimerRef.current);
      liveModeMessageTimerRef.current = null;
    }

    setState("idle");
  };

  /*
   * ============================================================
   * MICROPHONE CALLBACK
   * ============================================================
   */

  const handleMicClick = (listening: boolean) => {
    if (listening) {
      setState("listening");
      return;
    }

    setState("idle");

    if (isLiveMode) {
      setIsLiveMode(false);
      setShowLiveModeMessage(false);

      if (liveModeMessageTimerRef.current !== null) {
        clearTimeout(liveModeMessageTimerRef.current);
        liveModeMessageTimerRef.current = null;
      }
    }
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

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
      {/* ======================================================
          THEME TOGGLE
          ====================================================== */}

      <ThemeToggle />

      {/* ======================================================
          SETTINGS
          ====================================================== */}

      <SettingsPanel
        colorFrom={colorFrom}
        colorTo={colorTo}
        onColorFromChange={setColorFrom}
        onColorToChange={setColorTo}
        sizeKey={sizeKey}
        onSizeChange={setSizeKey}
      />

      {/* ======================================================
          FLOATING / ANIMATABLE ORB
          (position: fixed so it can smoothly travel to the
          corner near ThemeToggle and shrink)
          ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: isOrbAnimated ? MINI_ORB_TOP : orbBasePos.top,
          left: isOrbAnimated ? miniLeft : orbBasePos.left,
          width: orbSize,
          height: orbSize,
          display: "grid",
          placeItems: "center",
          transformOrigin: "top right",
          transform: isOrbAnimated ? `scale(${MINI_ORB_SCALE})` : "scale(1)",
          transition:
            "top 1.6s cubic-bezier(0.22, 1, 0.36, 1), left 1.6s cubic-bezier(0.22, 1, 0.36, 1), transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 45,
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
          aria-label={isLiveMode ? "Live mode active" : "Start live mode"}
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
            cursor: isLiveMode ? "default" : "pointer",
            zIndex: 10,
          }}
        />
      </div>

      {/* ======================================================
          MAIN COLUMN
          (holds an invisible placeholder the same size as the
          orb, so the state-buttons row below doesn't jump when
          the real orb detaches into position: fixed above)
          ====================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div ref={orbPlaceholderRef} style={{ width: orbSize, height: orbSize }} />

        {/* ====================================================
            STATE CONTROLS
            ==================================================== */}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button type="button" onClick={() => setState("idle")}>
            Idle
          </button>

          <button type="button" onClick={() => setState("connecting")}>
            Connecting
          </button>

          <button type="button" onClick={() => setState("listening")}>
            Listening
          </button>

          <button type="button" onClick={() => setState("thinking")}>
            Thinking
          </button>

          <button type="button" onClick={() => setState("speaking")}>
            Speaking
          </button>

          <button type="button" onClick={() => setState("error")}>
            Error
          </button>

          <button type="button" onClick={() => setState("disabled")}>
            Disabled
          </button>

          <button type="button" onClick={toggleOrbAnimation}>
            {isOrbAnimated ? "Restore Orb" : "Animate"}
          </button>
        </div>
      </div>

      {/* ========================================================
          STATIC "LIVE MODE START" MESSAGE
          ======================================================== */}

      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top: "calc(50% - 280px)",
          left: "50%",
          transform: showLiveModeMessage
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(-8px)",
          padding: "8px 16px",
          borderRadius: 18,
          background: "var(--toggle-bg)",
          border: "1px solid var(--toggle-border)",
          color: "var(--foreground)",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.2px",
          whiteSpace: "nowrap",
          opacity: showLiveModeMessage ? 1 : 0,
          pointerEvents: "none",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          zIndex: 1000,
        }}
      >
        Live Mode Start
      </div>

      {/* ========================================================
          BOTTOM INPUT AREA
          ======================================================== */}

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
          boxSizing: "border-box",
          zIndex: 40,
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: 620, height: 76 }}>
          {/* ==================================================
              NORMAL TEXT FIELD
              ================================================== */}

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: isLiveMode ? 0 : 1,
              transform: isLiveMode ? "translateY(24px) scale(0.96)" : "translateY(0) scale(1)",
              pointerEvents: isLiveMode ? "none" : "auto",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <LeoInputBar
              ref={leoInputRef}
              onSend={async (message, attachedFiles) => {
                console.log("message:", message);
                console.log("files:", attachedFiles);
              }}
              onAttach={(attachedFiles) => {
                console.log("attached:", attachedFiles);
              }}
              onMicClick={handleMicClick}
            />
          </div>

          {/* ==================================================
              LIVE MODE X BUTTON
              ================================================== */}

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: isLiveMode ? 1 : 0,
              transform: isLiveMode ? "translateY(0) scale(1)" : "translateY(24px) scale(0.9)",
              pointerEvents: isLiveMode ? "auto" : "none",
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
                padding: 0,
                transition: "background 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "var(--toggle-hover)";
                event.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "var(--toggle-bg)";
                event.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
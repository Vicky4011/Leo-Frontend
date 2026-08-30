"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { ThemeToggle } from "../src/components/theme-toggle";
import { Sidebar } from "../src/components/sidebar";

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

// ------------------------------------------------------------
// ORB STATE
// ------------------------------------------------------------

type OrbState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "disabled";

// ------------------------------------------------------------
// MINI ORB SETTINGS
// ------------------------------------------------------------

const MINI_ORB_TOP = 72;
const MINI_ORB_RIGHT_MARGIN = 16;
const MINI_ORB_SCALE = 0.55;

// ------------------------------------------------------------
// SIDEBAR PAGES
// ------------------------------------------------------------

type ActivePage = "email" | "calendar" | "reminder" | null;

const PAGE_TITLES: Record<Exclude<ActivePage, null>, string> = {
  email: "E-Mail",
  calendar: "Calendar",
  reminder: "Reminder",
};

const SIDEBAR_WIDTH = 240;

// ------------------------------------------------------------
// HOME
// ------------------------------------------------------------

export default function Home() {
  // ----------------------------------------------------------
  // SIDEBAR
  // ----------------------------------------------------------

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ----------------------------------------------------------
  // ACTIVE SIDEBAR PAGE (E-Mail / Calendar / Reminder)
  // ----------------------------------------------------------

  const [activePage, setActivePage] = useState<ActivePage>(null);

  // ----------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ----------------------------------------------------------
  // ORB STATE
  // ----------------------------------------------------------

  const [state, setState] = useState<OrbState>("idle");

  // ----------------------------------------------------------
  // ORB COLORS
  // ----------------------------------------------------------

  const [colorFrom, setColorFrom] = useState("#f0abfc");
  const [colorTo, setColorTo] = useState("#818cf8");

  // ----------------------------------------------------------
  // ORB SIZE
  // ----------------------------------------------------------

  const [sizeKey, setSizeKey] = useState<SizeKey>("MD");

  const orbSize = SIZE_PRESETS[sizeKey];

  const orbClickDiameter = Math.round(orbSize * 0.68);

  // ----------------------------------------------------------
  // LEO INPUT BAR
  // ----------------------------------------------------------

  const leoInputRef = useRef<LeoInputBarHandle | null>(null);

  // ----------------------------------------------------------
  // LIVE MODE
  // ----------------------------------------------------------

  const [isLiveMode, setIsLiveMode] = useState(false);

  const [showLiveModeMessage, setShowLiveModeMessage] =
    useState(false);

  const liveModeMessageTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----------------------------------------------------------
  // ORB ANIMATION
  // ----------------------------------------------------------

  const [isOrbAnimated, setIsOrbAnimated] = useState(false);

  const orbPlaceholderRef =
    useRef<HTMLDivElement | null>(null);

  const [orbBasePos, setOrbBasePos] = useState({
    top: 0,
    left: 0,
  });

  const [viewportWidth, setViewportWidth] = useState(0);

  // ----------------------------------------------------------
  // MEASURE ORB POSITION
  // ----------------------------------------------------------

  useEffect(() => {
    const measure = () => {
      const element = orbPlaceholderRef.current;

      if (element) {
        const rect = element.getBoundingClientRect();

        setOrbBasePos({
          top: rect.top,
          left: rect.left,
        });
      }

      setViewportWidth(window.innerWidth);
    };

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [orbSize]);

  // ----------------------------------------------------------
  // MINI ORB POSITION
  // ----------------------------------------------------------

  const miniLeft =
    viewportWidth - orbSize - MINI_ORB_RIGHT_MARGIN;

  // ----------------------------------------------------------
  // TOGGLE ORB ANIMATION
  // ----------------------------------------------------------

  const toggleOrbAnimation = () => {
    setIsOrbAnimated((previous) => !previous);
  };

  // ----------------------------------------------------------
  // START LIVE MODE
  // ----------------------------------------------------------

  const startLiveMode = () => {
    if (isLiveMode) {
      return;
    }

    // Enable Live Mode
    setIsLiveMode(true);

    // Orb enters listening state
    setState("listening");

    // Clear previous message timer
    if (liveModeMessageTimerRef.current !== null) {
      clearTimeout(liveModeMessageTimerRef.current);
    }

    // Show "Live Mode Starts"
    setShowLiveModeMessage(true);

    // Hide message after 3 seconds
    liveModeMessageTimerRef.current = setTimeout(() => {
      setShowLiveModeMessage(false);
      liveModeMessageTimerRef.current = null;
    }, 3000);

    // Start microphone/live mode
    leoInputRef.current?.startLiveMode();
  };

  // ----------------------------------------------------------
  // ORB CLICK
  // ----------------------------------------------------------

  const handleOrbClick = () => {
    // Do nothing if already in Live Mode
    if (isLiveMode) {
      return;
    }

    startLiveMode();
  };

  // ----------------------------------------------------------
  // EXIT LIVE MODE
  // ----------------------------------------------------------

  const exitLiveMode = () => {
    // Stop microphone/listening
    leoInputRef.current?.stopListening();

    // Disable Live Mode
    setIsLiveMode(false);

    // Hide message
    setShowLiveModeMessage(false);

    // Clear timer
    if (liveModeMessageTimerRef.current !== null) {
      clearTimeout(liveModeMessageTimerRef.current);
      liveModeMessageTimerRef.current = null;
    }

    // Return orb to idle
    setState("idle");
  };

  // ----------------------------------------------------------
  // MICROPHONE CALLBACK
  // ----------------------------------------------------------

  const handleMicClick = (listening: boolean) => {
    if (listening) {
      setState("listening");
      return;
    }

    // Mic stopped
    setState("idle");

    // If microphone stopped while in Live Mode,
    // exit Live Mode as well.
    if (isLiveMode) {
      setIsLiveMode(false);
      setShowLiveModeMessage(false);

      if (liveModeMessageTimerRef.current !== null) {
        clearTimeout(liveModeMessageTimerRef.current);
        liveModeMessageTimerRef.current = null;
      }
    }
  };

  // ----------------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------------

  useEffect(() => {
    return () => {
      if (liveModeMessageTimerRef.current !== null) {
        clearTimeout(liveModeMessageTimerRef.current);
      }
    };
  }, []);

  // ----------------------------------------------------------
  // PAGE
  // ----------------------------------------------------------

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
          TOP BAR
          ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 32,
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          gap: 10,
          zIndex: 60,
          WebkitAppRegion: "drag",
        } as CSSProperties}
      >
        {/* ==================================================
            SIDEBAR
            ================================================== */}

        <Sidebar
          open={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            setActivePage(null);
          }}
          hideBackdrop={activePage !== null}
          onNavigate={(key) => {
            if (key === "settings") {
              setIsSidebarOpen(false);
              setActivePage(null);
              setIsSettingsOpen(true);
            } else if (key === "chat") {
              setActivePage(null);
              setIsSidebarOpen(false);
            } else {
              setActivePage(key as ActivePage);
              // Sidebar stays open/pinned so the page shows beside it
            }
          }}
        />

        {/* ==================================================
            SIDEBAR BUTTON
            ================================================== */}

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{
            display: "grid",
            placeItems: "center",
            width: 22,
            height: 22,
            border: "none",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
            padding: 0,
            WebkitAppRegion: "no-drag",
          } as CSSProperties}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* ==================================================
            LEO TITLE
            ================================================== */}

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--foreground)",
            letterSpacing: "0.3px",
            userSelect: "none",
          }}
        >
          Leo
        </span>
      </div>

      {/* ======================================================
          THEME TOGGLE
          ====================================================== */}

      <ThemeToggle />

      {/* ======================================================
          SETTINGS
          ====================================================== */}

      <SettingsPanel
        open={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setIsSidebarOpen(true);
        }}
        colorFrom={colorFrom}
        colorTo={colorTo}
        onColorFromChange={setColorFrom}
        onColorToChange={setColorTo}
        sizeKey={sizeKey}
        onSizeChange={setSizeKey}
      />

      {/* ======================================================
          SIDEBAR PAGE (E-Mail / Calendar / Reminder)
          Fills everything to the right of the pinned sidebar.
          ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: SIDEBAR_WIDTH,
          right: 0,
          height: "100%",
          background: "var(--background)",
          zIndex: 75,
          display: "flex",
          flexDirection: "column",
          padding: "48px 28px 28px",
          boxSizing: "border-box",
          overflowY: "auto",
          transform: activePage ? "translateX(0)" : "translateX(24px)",
          opacity: activePage ? 1 : 0,
          pointerEvents: activePage ? "auto" : "none",
          transition:
            "opacity 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => setActivePage(null)}
            aria-label="Close page"
            style={{
              display: "grid",
              placeItems: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--toggle-border)",
              background: "var(--toggle-bg)",
              color: "var(--foreground)",
              cursor: "pointer",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--toggle-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--toggle-bg)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {activePage ? PAGE_TITLES[activePage] : ""}
          </h2>
        </div>

        <p style={{ color: "var(--input-placeholder)", fontSize: 14, margin: 0 }}>
          This is the {activePage ? PAGE_TITLES[activePage] : ""} page — content coming soon.
        </p>
      </div>

      {/* ======================================================
          FLOATING / ANIMATABLE ORB
          ====================================================== */}

      <div
        style={{
          position: "fixed",

          top: isOrbAnimated
            ? MINI_ORB_TOP
            : orbBasePos.top,

          left: isOrbAnimated
            ? miniLeft
            : orbBasePos.left,

          width: orbSize,
          height: orbSize,

          display: "grid",
          placeItems: "center",

          transformOrigin: "top right",

          transform: isOrbAnimated
            ? `scale(${MINI_ORB_SCALE})`
            : "scale(1)",

          transition:
            "top 2.6s cubic-bezier(0.22, 1, 0.36, 1), " +
            "left 2.6s cubic-bezier(0.22, 1, 0.36, 1), " +
            "transform 2.6s cubic-bezier(0.22, 1, 0.36, 1)",

          zIndex: 45,
        }}
      >
        {/* ==================================================
            PARTICLES ORB
            ================================================== */}

        <div
          style={{
            pointerEvents: "none",
          }}
        >
          <ParticlesOrb
            state={state}
            size={orbSize}
            speed={1}
            colorFrom={colorFrom}
            colorTo={colorTo}
            label="Particles Orb"
          />
        </div>

        {/* ==================================================
            ORB CLICK AREA
            ================================================== */}

        <div
          onClick={handleOrbClick}
          role="button"
          tabIndex={0}
          aria-label={
            isLiveMode
              ? "Live mode active"
              : "Start live mode"
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              handleOrbClick();
            }
          }}
          style={{
            position: "absolute",
            width: orbClickDiameter,
            height: orbClickDiameter,
            borderRadius: "50%",
            cursor: isLiveMode
              ? "default"
              : "pointer",
            zIndex: 10,
          }}
        />
      </div>

      {/* ======================================================
          MAIN COLUMN
          ====================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* ==================================================
            INVISIBLE ORB PLACEHOLDER
            ================================================== */}

        <div
          ref={orbPlaceholderRef}
          style={{
            width: orbSize,
            height: orbSize,
          }}
        />

        {/* ==================================================
            STATE CONTROLS
            ================================================== */}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setState("idle")}
          >
            Idle
          </button>

          <button
            type="button"
            onClick={() => setState("connecting")}
          >
            Connecting
          </button>

          <button
            type="button"
            onClick={() => setState("listening")}
          >
            Listening
          </button>

          <button
            type="button"
            onClick={() => setState("thinking")}
          >
            Thinking
          </button>

          <button
            type="button"
            onClick={() => setState("speaking")}
          >
            Speaking
          </button>

          <button
            type="button"
            onClick={() => setState("error")}
          >
            Error
          </button>

          <button
            type="button"
            onClick={() => setState("disabled")}
          >
            Disabled
          </button>

          <button
            type="button"
            onClick={toggleOrbAnimation}
          >
            {isOrbAnimated
              ? "Restore Orb"
              : "Animate"}
          </button>
        </div>
      </div>

      {/* ======================================================
          STATIC LIVE MODE MESSAGE
          ====================================================== */}

      <div
        aria-live="polite"
        style={{
          position: "fixed",

          /*
           * STATIC POSITION.
           * This does not move with the orb.
           */
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

          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.18)",

          transition:
            "opacity 0.35s ease, " +
            "transform 0.35s ease",

          zIndex: 1000,
        }}
      >
        Live Mode Starts
      </div>

      {/* ======================================================
          BOTTOM INPUT AREA
          ====================================================== */}

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
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 620,
            height: 76,
          }}
        >
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

              transform: isLiveMode
                ? "translateY(24px) scale(0.96)"
                : "translateY(0) scale(1)",

              pointerEvents: isLiveMode
                ? "none"
                : "auto",

              transition:
                "opacity 0.35s ease, " +
                "transform 0.35s ease",
            }}
          >
            <LeoInputBar
              ref={leoInputRef}
              onSend={async (
                message,
                attachedFiles
              ) => {
                console.log(
                  "message:",
                  message
                );

                console.log(
                  "files:",
                  attachedFiles
                );
              }}
              onAttach={(attachedFiles) => {
                console.log(
                  "attached:",
                  attachedFiles
                );
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

              transform: isLiveMode
                ? "translateY(0) scale(1)"
                : "translateY(24px) scale(0.9)",

              pointerEvents: isLiveMode
                ? "auto"
                : "none",

              transition:
                "opacity 0.35s ease, " +
                "transform 0.35s ease",
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

                border:
                  "1px solid var(--toggle-border)",

                background:
                  "var(--toggle-bg)",

                color: "var(--foreground)",

                display: "grid",
                placeItems: "center",

                cursor: "pointer",

                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.25)",

                padding: 0,

                transition:
                  "background 0.2s ease, " +
                  "transform 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  "var(--toggle-hover)";

                event.currentTarget.style.transform =
                  "scale(1.08)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  "var(--toggle-bg)";

                event.currentTarget.style.transform =
                  "scale(1)";
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M18 6L6 18"
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
"use client";

import { useRef, useState } from "react";

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

export default function Home() {
  const [state, setState] =
    useState<OrbState>("idle");

  const [colorFrom, setColorFrom] =
    useState("#f0abfc");

  const [colorTo, setColorTo] =
    useState("#818cf8");

  const [sizeKey, setSizeKey] =
    useState<SizeKey>("MD");

  /*
   * ============================================================
   * LIVE MODE
   * ============================================================
   */

  const [isLiveMode, setIsLiveMode] =
    useState(false);

  /*
   * Temporary "Live Mode Start"
   * notification.
   *
   * This is completely separate from
   * isLiveMode.
   */
  const [
    showLiveModeMessage,
    setShowLiveModeMessage,
  ] = useState(false);

  /*
   * Timer used to hide the
   * "Live Mode Start" message.
   */
  const liveModeMessageTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const orbSize =
    SIZE_PRESETS[sizeKey];

  const orbClickDiameter =
    Math.round(
      orbSize * 0.68
    );

  const leoInputRef =
    useRef<LeoInputBarHandle | null>(
      null
    );

  /*
   * ============================================================
   * START LIVE MODE
   * ============================================================
   */

  const startLiveMode = () => {
    if (isLiveMode) {
      return;
    }

    /*
     * Enable actual Live Mode.
     */
    setIsLiveMode(true);

    /*
     * Orb becomes listening.
     */
    setState("listening");

    /*
     * Clear an older notification
     * timer if one exists.
     */
    if (
      liveModeMessageTimerRef.current !==
      null
    ) {
      clearTimeout(
        liveModeMessageTimerRef.current
      );
    }

    /*
     * Show temporary notification.
     */
    setShowLiveModeMessage(true);

    /*
     * Hide notification after
     * exactly 3 seconds.
     *
     * Live Mode itself continues.
     */
    liveModeMessageTimerRef.current =
      setTimeout(() => {
        setShowLiveModeMessage(
          false
        );

        liveModeMessageTimerRef.current =
          null;
      }, 3000);

    /*
     * Start the Live Mode microphone.
     */
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
   *
   * Used when X is clicked.
   */

  const exitLiveMode = () => {
    /*
     * Stop microphone immediately.
     */
    leoInputRef.current?.stopListening();

    /*
     * Turn Live Mode OFF.
     */
    setIsLiveMode(false);

    /*
     * Hide temporary notification.
     */
    setShowLiveModeMessage(false);

    /*
     * Clear notification timer.
     */
    if (
      liveModeMessageTimerRef.current !==
      null
    ) {
      clearTimeout(
        liveModeMessageTimerRef.current
      );

      liveModeMessageTimerRef.current =
        null;
    }

    /*
     * Orb becomes idle.
     */
    setState("idle");
  };

  /*
   * ============================================================
   * MICROPHONE CALLBACK
   * ============================================================
   */

  const handleMicClick = (
    listening: boolean
  ) => {
    if (listening) {
      setState("listening");
      return;
    }

    /*
     * Microphone has stopped.
     */
    setState("idle");

    /*
     * If this was Live Mode,
     * return to normal UI.
     *
     * This happens when Live Mode
     * automatically stops after silence.
     */
    if (isLiveMode) {
      setIsLiveMode(false);

      setShowLiveModeMessage(false);

      if (
        liveModeMessageTimerRef.current !==
        null
      ) {
        clearTimeout(
          liveModeMessageTimerRef.current
        );

        liveModeMessageTimerRef.current =
          null;
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
        background:
          "var(--background)",
        color:
          "var(--foreground)",
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
        onColorFromChange={
          setColorFrom
        }
        onColorToChange={
          setColorTo
        }
        sizeKey={sizeKey}
        onSizeChange={
          setSizeKey
        }
      />

      {/* ======================================================
          MAIN ORB AREA
          ====================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* ====================================================
            ORB CONTAINER
            ==================================================== */}

        <div
          style={{
            position: "relative",
            width: orbSize,
            height: orbSize,
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* ==================================================
              ORB
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
              colorFrom={
                colorFrom
              }
              colorTo={
                colorTo
              }
              label="Particles Orb"
            />
          </div>

          {/* ==================================================
              ORB CLICK AREA
              ================================================== */}

          <div
            onClick={
              handleOrbClick
            }
            role="button"
            tabIndex={0}
            aria-label={
              isLiveMode
                ? "Live mode active"
                : "Start live mode"
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                  "Enter" ||
                event.key ===
                  " "
              ) {
                event.preventDefault();

                handleOrbClick();
              }
            }}
            style={{
              position:
                "absolute",

              width:
                orbClickDiameter,

              height:
                orbClickDiameter,

              borderRadius:
                "50%",

              cursor:
                isLiveMode
                  ? "default"
                  : "pointer",

              zIndex: 10,
            }}
          />
        </div>

        {/* ====================================================
            STATE CONTROLS
            ==================================================== */}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent:
              "center",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setState("idle")
            }
          >
            Idle
          </button>

          <button
            type="button"
            onClick={() =>
              setState(
                "connecting"
              )
            }
          >
            Connecting
          </button>

          <button
            type="button"
            onClick={() =>
              setState(
                "listening"
              )
            }
          >
            Listening
          </button>

          <button
            type="button"
            onClick={() =>
              setState(
                "thinking"
              )
            }
          >
            Thinking
          </button>

          <button
            type="button"
            onClick={() =>
              setState(
                "speaking"
              )
            }
          >
            Speaking
          </button>

          <button
            type="button"
            onClick={() =>
              setState("error")
            }
          >
            Error
          </button>

          <button
            type="button"
            onClick={() =>
              setState(
                "disabled"
              )
            }
          >
            Disabled
          </button>
        </div>
      </div>

      {/* ========================================================
          STATIC "LIVE MODE START" MESSAGE
          ========================================================

          IMPORTANT:

          This is OUTSIDE the Orb container.

          It uses position: fixed.

          Therefore its position does NOT depend on:
          - orbSize
          - sizeKey
          - Orb animation
          - Orb container height
          - Orb container width

          Changing SM / MD / LG / XL will NOT move it.
          ======================================================== */}

      <div
        aria-live="polite"
        style={{
          position: "fixed",

          /*
           * ====================================================
           * STATIC POSITION
           * ====================================================
           *
           * The message is always positioned relative
           * to the viewport.
           *
           * It is NOT positioned relative to the Orb.
           */
          top: "calc(50% - 280px)",

          left: "50%",

          /*
           * Center the message horizontally.
           */
          transform:
            showLiveModeMessage
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(-8px)",

          /*
           * Message appearance.
           */
          padding:
            "8px 16px",

          borderRadius: 18,

          background:
            "var(--toggle-bg)",

          border:
            "1px solid var(--toggle-border)",

          color:
            "var(--foreground)",

          fontSize: 14,

          fontWeight: 500,

          letterSpacing:
            "0.2px",

          whiteSpace:
            "nowrap",

          /*
           * Visible for 3 seconds.
           */
          opacity:
            showLiveModeMessage
              ? 1
              : 0,

          /*
           * It cannot be clicked.
           */
          pointerEvents:
            "none",

          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.18)",

          /*
           * Only opacity and the small
           * fade movement are animated.
           */
          transition:
            "opacity 0.35s ease, transform 0.35s ease",

          /*
           * Always above the Orb.
           */
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

          transform:
            "translateX(-50%)",

          width: "100%",

          display: "flex",

          justifyContent:
            "center",

          padding: "0 16px",

          boxSizing:
            "border-box",

          zIndex: 40,
        }}
      >
        <div
          style={{
            position:
              "relative",

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
              position:
                "absolute",

              inset: 0,

              display: "flex",

              justifyContent:
                "center",

              alignItems:
                "center",

              /*
               * Hidden while Live Mode
               * is actually active.
               */
              opacity:
                isLiveMode
                  ? 0
                  : 1,

              transform:
                isLiveMode
                  ? "translateY(24px) scale(0.96)"
                  : "translateY(0) scale(1)",

              pointerEvents:
                isLiveMode
                  ? "none"
                  : "auto",

              transition:
                "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <LeoInputBar
              ref={
                leoInputRef
              }

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

              onAttach={(
                attachedFiles
              ) => {
                console.log(
                  "attached:",
                  attachedFiles
                );
              }}

              onMicClick={
                handleMicClick
              }
            />
          </div>

          {/* ==================================================
              LIVE MODE X BUTTON
              ================================================== */}

          <div
            style={{
              position:
                "absolute",

              inset: 0,

              display: "flex",

              justifyContent:
                "center",

              alignItems:
                "center",

              opacity:
                isLiveMode
                  ? 1
                  : 0,

              transform:
                isLiveMode
                  ? "translateY(0) scale(1)"
                  : "translateY(24px) scale(0.9)",

              pointerEvents:
                isLiveMode
                  ? "auto"
                  : "none",

              transition:
                "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <button
              type="button"
              onClick={
                exitLiveMode
              }
              aria-label="Exit live mode"
              title="Exit live mode"
              style={{
                width: 48,

                height: 48,

                borderRadius:
                  "50%",

                border:
                  "1px solid var(--toggle-border)",

                background:
                  "var(--toggle-bg)",

                color:
                  "var(--foreground)",

                display: "grid",

                placeItems:
                  "center",

                cursor:
                  "pointer",

                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.25)",

                padding: 0,

                transition:
                  "background 0.2s ease, transform 0.2s ease",
              }}

              onMouseEnter={(
                event
              ) => {
                event.currentTarget.style.background =
                  "var(--toggle-hover)";

                event.currentTarget.style.transform =
                  "scale(1.08)";
              }}

              onMouseLeave={(
                event
              ) => {
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
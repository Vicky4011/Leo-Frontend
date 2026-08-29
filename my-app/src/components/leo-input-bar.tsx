"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface LeoInputBarHandle {
  startListening: () => void;
  startLiveMode: () => void;
  stopListening: () => void;
}

interface LeoInputBarProps {
  onSend?: (
    message: string,
    files: File[]
  ) => void | Promise<void>;

  onAttach?: (files: File[]) => void;

  onMicClick?: (
    listening: boolean
  ) => void;

  ref?: React.Ref<LeoInputBarHandle>;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 20;

/*
 * Live Mode automatically stops after
 * 4 seconds of silence.
 *
 * IMPORTANT:
 * Text-field microphone does NOT use this timer.
 */
const LIVE_MODE_SILENCE_MS = 4000;

const MIN_TEXTAREA_HEIGHT = 24;
const MAX_TEXTAREA_HEIGHT = 120;

export const LeoInputBar = ({
  onSend,
  onAttach,
  onMicClick,
  ref,
}: LeoInputBarProps) => {
  const [value, setValue] = useState("");

  const [files, setFiles] = useState<File[]>(
    []
  );

  const [focused, setFocused] =
    useState(false);

  const [isSending, setIsSending] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [micSupported, setMicSupported] =
    useState(true);

  const [fileError, setFileError] =
    useState<string | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const recognitionRef =
    useRef<SpeechRecognition | null>(null);

  /*
   * Whether the user wants recognition
   * to continue running.
   */
  const shouldKeepListeningRef =
    useRef(false);

  /*
   * Prevent duplicate recognition.start()
   */
  const recognitionRunningRef =
    useRef(false);

  /*
   * TRUE only when the Orb started
   * Live Mode.
   *
   * FALSE for the normal text-field mic.
   */
  const liveModeRef =
    useRef(false);

  /*
   * Live Mode silence timer.
   */
  const silenceTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /*
   * ============================================================
   * CLEAR LIVE MODE TIMER
   * ============================================================
   */

  const clearSilenceTimer = () => {
    if (
      silenceTimerRef.current !== null
    ) {
      clearTimeout(
        silenceTimerRef.current
      );

      silenceTimerRef.current = null;
    }
  };

  /*
   * ============================================================
   * RESET LIVE MODE SILENCE TIMER
   * ============================================================
   */

  const resetLiveModeSilenceTimer = () => {
    /*
     * Text-field microphone does not
     * automatically stop.
     */
    if (!liveModeRef.current) {
      return;
    }

    clearSilenceTimer();

    silenceTimerRef.current =
      setTimeout(() => {
        /*
         * Live Mode may have already
         * been manually stopped.
         */
        if (!liveModeRef.current) {
          return;
        }

        /*
         * Turn Live Mode OFF.
         */
        liveModeRef.current = false;

        /*
         * Prevent recognition.onend
         * from restarting it.
         */
        shouldKeepListeningRef.current =
          false;

        recognitionRunningRef.current =
          false;

        clearSilenceTimer();

        setIsListening(false);

        /*
         * Tell page.tsx that microphone
         * has stopped.
         */
        onMicClick?.(false);

        try {
          recognitionRef.current?.stop();
        } catch {
          // Ignore browser stop errors.
        }
      }, LIVE_MODE_SILENCE_MS);
  };

  /*
   * ============================================================
   * SPEECH RECOGNITION SETUP
   * ============================================================
   */

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition ||
          window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      setMicSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognitionCtor();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    /*
     * ==========================================================
     * RESULT
     * ==========================================================
     */

    recognition.onresult = (
      event: SpeechRecognitionEvent
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        transcript +=
          event.results[i][0]
            .transcript;
      }

      if (!transcript) {
        return;
      }

      /*
       * ONLY Live Mode resets the
       * silence countdown.
       */
      if (liveModeRef.current) {
        resetLiveModeSilenceTimer();
      }

      setValue((previous) => {
        const base =
          previous.replace(
            /\s+$/,
            ""
          );

        return base
          ? `${base} ${transcript}`
          : transcript;
      });
    };

    /*
     * ==========================================================
     * ERROR
     * ==========================================================
     *
     * IMPORTANT:
     * Do not explicitly type event as
     * SpeechRecognitionErrorEvent here.
     *
     * Some TypeScript DOM definitions
     * define onerror as Event.
     */

    recognition.onerror = (event) => {
      const errorEvent =
        event as SpeechRecognitionErrorEvent;

      console.log(
        "Speech recognition error:",
        errorEvent.error
      );

      if (
        errorEvent.error ===
          "not-allowed" ||
        errorEvent.error ===
          "service-not-allowed"
      ) {
        shouldKeepListeningRef.current =
          false;

        recognitionRunningRef.current =
          false;

        liveModeRef.current = false;

        clearSilenceTimer();

        setIsListening(false);

        onMicClick?.(false);
      }
    };

    /*
     * ==========================================================
     * RECOGNITION END
     * ==========================================================
     */

    recognition.onend = () => {
      recognitionRunningRef.current =
        false;

      /*
       * User explicitly stopped.
       * Do not restart.
       */
      if (
        !shouldKeepListeningRef.current
      ) {
        return;
      }

      /*
       * Browser stopped recognition
       * unexpectedly.
       *
       * Restart while the user still
       * wants the mic ON.
       */
      window.setTimeout(() => {
        if (
          !shouldKeepListeningRef.current
        ) {
          return;
        }

        if (
          recognitionRunningRef.current
        ) {
          return;
        }

        try {
          recognition.start();

          recognitionRunningRef.current =
            true;

          setIsListening(true);

          onMicClick?.(true);
        } catch {
          /*
           * Browser may still be
           * transitioning.
           */
          window.setTimeout(() => {
            if (
              !shouldKeepListeningRef.current
            ) {
              return;
            }

            if (
              recognitionRunningRef.current
            ) {
              return;
            }

            try {
              recognition.start();

              recognitionRunningRef.current =
                true;

              setIsListening(true);

              onMicClick?.(true);
            } catch {
              // Ignore repeated browser errors.
            }
          }, 300);
        }
      }, 100);
    };

    recognitionRef.current =
      recognition;

    /*
     * ==========================================================
     * CLEANUP
     * ==========================================================
     */

    return () => {
      shouldKeepListeningRef.current =
        false;

      recognitionRunningRef.current =
        false;

      liveModeRef.current = false;

      clearSilenceTimer();

      try {
        recognition.stop();
      } catch {
        // Ignore cleanup errors.
      }

      recognitionRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ============================================================
   * NORMAL TEXT-FIELD MICROPHONE
   * ============================================================
   *
   * This microphone NEVER auto-stops.
   */

  const startListening = () => {
    const recognition =
      recognitionRef.current;

    if (
      !micSupported ||
      !recognition
    ) {
      return;
    }

    /*
     * This is NOT Live Mode.
     */
    liveModeRef.current = false;

    /*
     * Remove any Live Mode timer.
     */
    clearSilenceTimer();

    /*
     * User wants microphone ON.
     */
    shouldKeepListeningRef.current =
      true;

    setIsListening(true);

    onMicClick?.(true);

    /*
     * Already running.
     */
    if (
      recognitionRunningRef.current
    ) {
      return;
    }

    try {
      recognition.start();

      recognitionRunningRef.current =
        true;
    } catch {
      /*
       * Recognition may already be
       * starting.
       */
      setIsListening(true);

      onMicClick?.(true);
    }
  };

  /*
   * ============================================================
   * ORB LIVE MODE
   * ============================================================
   *
   * Live Mode DOES auto-stop after
   * 4 seconds of silence.
   */

  const startLiveMode = () => {
    const recognition =
      recognitionRef.current;

    if (
      !micSupported ||
      !recognition
    ) {
      return;
    }

    /*
     * This microphone session IS
     * Live Mode.
     */
    liveModeRef.current = true;

    shouldKeepListeningRef.current =
      true;

    setIsListening(true);

    onMicClick?.(true);

    /*
     * Start the initial 4-second
     * silence countdown.
     */
    resetLiveModeSilenceTimer();

    if (
      recognitionRunningRef.current
    ) {
      return;
    }

    try {
      recognition.start();

      recognitionRunningRef.current =
        true;
    } catch {
      setIsListening(true);

      onMicClick?.(true);
    }
  };

  /*
   * ============================================================
   * STOP MICROPHONE
   * ============================================================
   */

  const stopListening = () => {
    const recognition =
      recognitionRef.current;

    /*
     * Disable Live Mode.
     */
    liveModeRef.current = false;

    /*
     * Cancel auto-stop timer.
     */
    clearSilenceTimer();

    /*
     * Do not restart recognition.
     */
    shouldKeepListeningRef.current =
      false;

    recognitionRunningRef.current =
      false;

    setIsListening(false);

    onMicClick?.(false);

    if (!recognition) {
      return;
    }

    try {
      recognition.stop();
    } catch {
      // Ignore browser stop errors.
    }
  };

  /*
   * ============================================================
   * EXPOSE METHODS TO PAGE.TSX
   * ============================================================
   */

  useImperativeHandle(
    ref,
    () => ({
      startListening,
      startLiveMode,
      stopListening,
    }),
    [micSupported]
  );

  /*
   * ============================================================
   * TEXT-FIELD MIC TOGGLE
   * ============================================================
   */

  const toggleMic = () => {
    if (isListening) {
      /*
       * Second click = OFF.
       */
      stopListening();
    } else {
      /*
       * First click = ON.
       *
       * This is normal microphone mode,
       * NOT Live Mode.
       */
      startListening();
    }
  };

  /*
   * ============================================================
   * TEXTAREA RESIZE
   * ============================================================
   */

  const resizeTextarea = () => {
    const element =
      textareaRef.current;

    if (!element) {
      return;
    }

    element.style.height = "0px";

    const height = Math.min(
      Math.max(
        element.scrollHeight,
        MIN_TEXTAREA_HEIGHT
      ),
      MAX_TEXTAREA_HEIGHT
    );

    element.style.height =
      `${height}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  const handleSend = async () => {
    const message =
      value.trim();

    if (
      !message ||
      isSending
    ) {
      return;
    }

    setIsSending(true);

    try {
      await onSend?.(
        message,
        files
      );

      setValue("");

      setFiles([]);

      setFileError(null);
    } finally {
      setIsSending(false);
    }
  };

  /*
   * ============================================================
   * KEYBOARD
   * ============================================================
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };

  /*
   * ============================================================
   * FILE ATTACHMENT
   * ============================================================
   */

  const handleAttachClick = () => {
    setFileError(null);

    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected =
      Array.from(
        event.target.files ?? []
      );

    event.target.value = "";

    if (
      selected.length === 0
    ) {
      return;
    }

    const tooLarge =
      selected.filter(
        (file) =>
          file.size >
          MAX_FILE_SIZE_MB *
            1024 *
            1024
      );

    if (
      tooLarge.length > 0
    ) {
      setFileError(
        `Files must be under ${MAX_FILE_SIZE_MB}MB`
      );

      return;
    }

    setFiles((previous) => {
      const merged = [
        ...previous,
      ];

      for (
        const file of selected
      ) {
        const exists =
          merged.some(
            (existing) =>
              existing.name ===
                file.name &&
              existing.size ===
                file.size
          );

        if (!exists) {
          merged.push(file);
        }
      }

      const next =
        merged.slice(
          0,
          MAX_FILES
        );

      onAttach?.(next);

      return next;
    });

    if (
      selected.length +
        files.length >
      MAX_FILES
    ) {
      setFileError(
        `You can attach up to ${MAX_FILES} files`
      );
    } else {
      setFileError(null);
    }
  };

  /*
   * ============================================================
   * REMOVE FILE
   * ============================================================
   */

  const removeFile = (
    name: string,
    size: number
  ) => {
    setFiles((previous) => {
      const next =
        previous.filter(
          (file) =>
            !(
              file.name === name &&
              file.size === size
            )
        );

      onAttach?.(next);

      return next;
    });
  };

  /*
   * ============================================================
   * FILE SIZE
   * ============================================================
   */

  const formatSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes}B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${Math.round(
        bytes / 1024
      )}KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)}MB`;
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 620,
        position: "relative",
        height: 76,
        boxSizing: "border-box",
        borderRadius: 20,
        border: `1px solid ${
          focused
            ? "var(--input-focus-border)"
            : "var(--toggle-border)"
        }`,
        background:
          "var(--toggle-bg)",
        boxShadow:
          focused
            ? "var(--input-focus-shadow)"
            : "none",
        transition:
          "border-color 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={
          handleFileChange
        }
        style={{
          display: "none",
        }}
      />

      {files.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 7,
            left: 14,
            right: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            zIndex: 10,
          }}
        >
          {files.map(
            (file) => (
              <span
                key={`${file.name}-${file.size}`}
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 5,
                  maxWidth: 220,
                  padding:
                    "3px 7px",
                  borderRadius: 7,
                  border:
                    "1px solid var(--toggle-border)",
                  background:
                    "var(--toggle-hover)",
                  fontSize: 11,
                  color:
                    "var(--foreground)",
                }}
              >
                <span
                  style={{
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                  title={
                    file.name
                  }
                >
                  {file.name}
                </span>

                <span
                  style={{
                    color:
                      "var(--input-placeholder)",
                    flexShrink: 0,
                  }}
                >
                  {formatSize(
                    file.size
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeFile(
                      file.name,
                      file.size
                    )
                  }
                  aria-label={`Remove ${file.name}`}
                  style={{
                    border:
                      "none",
                    background:
                      "transparent",
                    color:
                      "var(--input-icon)",
                    cursor:
                      "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            )
          )}
        </div>
      )}

      {fileError && (
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 16,
            fontSize: 11,
            color: "#e5484d",
            zIndex: 10,
          }}
        >
          {fileError}
        </span>
      )}

      <textarea
        ref={textareaRef}
        className="leo-input-textarea"
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value
          )
        }
        onKeyDown={
          handleKeyDown
        }
        onFocus={() =>
          setFocused(true)
        }
        onBlur={() =>
          setFocused(false)
        }
        rows={1}
        placeholder={
          isListening
            ? "Listening..."
            : "Ask Leo anything..."
        }
        aria-label="Ask Leo anything"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        style={{
          position: "absolute",
          top: 12,
          left: 16,
          right: 16,
          width:
            "calc(100% - 32px)",
          minHeight:
            MIN_TEXTAREA_HEIGHT,
          maxHeight:
            MAX_TEXTAREA_HEIGHT,
          resize: "none",
          border: "none",
          outline: "none",
          background:
            "transparent",
          color:
            "var(--foreground)",
          fontSize: 15,
          lineHeight: "22px",
          fontFamily: "inherit",
          padding: 0,
          margin: 0,
          boxSizing:
            "border-box",
          display: "block",
          overflowY: "auto",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 8,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          onClick={
            handleAttachClick
          }
          aria-label="Attach a file"
          title="Attach a file"
          style={{
            width: 30,
            height: 30,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            border: "none",
            background:
              "transparent",
            color:
              "var(--input-icon)",
            cursor: "pointer",
            borderRadius: 8,
            pointerEvents:
              "auto",
            flexShrink: 0,
            boxSizing:
              "border-box",
          }}
        >
          <PaperclipIcon />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            gap: 8,
            height: 34,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={
              toggleMic
            }
            disabled={
              !micSupported
            }
            aria-label={
              isListening
                ? "Stop voice input"
                : "Start voice input"
            }
            aria-pressed={
              isListening
            }
            title={
              isListening
                ? "Stop listening"
                : "Start listening"
            }
            style={{
              width: 34,
              height: 34,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              borderRadius:
                "50%",
              border: `1px solid ${
                isListening
                  ? "var(--input-accent)"
                  : "var(--toggle-border)"
              }`,
              background:
                isListening
                  ? "var(--input-accent-soft)"
                  : "var(--toggle-bg)",
              color:
                isListening
                  ? "var(--input-accent)"
                  : "var(--input-icon)",
              cursor:
                micSupported
                  ? "pointer"
                  : "not-allowed",
              opacity:
                micSupported
                  ? 1
                  : 0.5,
              pointerEvents:
                "auto",
              flexShrink: 0,
              boxSizing:
                "border-box",
            }}
          >
            <MicIcon
              pulse={
                isListening
              }
            />
          </button>

          <button
            type="button"
            onClick={
              handleSend
            }
            disabled={
              !value.trim() ||
              isSending
            }
            aria-label="Send message"
            title="Send"
            style={{
              width: 34,
              height: 34,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              borderRadius:
                "50%",
              border: "none",
              background:
                value.trim() &&
                !isSending
                  ? "var(--input-accent)"
                  : "var(--input-accent-soft)",
              color:
                value.trim() &&
                !isSending
                  ? "#ffffff"
                  : "var(--input-accent)",
              cursor:
                value.trim() &&
                !isSending
                  ? "pointer"
                  : "default",
              pointerEvents:
                "auto",
              flexShrink: 0,
              boxSizing:
                "border-box",
            }}
          >
            {isSending ? (
              <SpinnerIcon />
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/*
 * ============================================================
 * ICONS
 * ============================================================
 */

const PaperclipIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 12.5 15.5 5a3.54 3.54 0 0 1 5 5L11.5 19a5.7 5.7 0 0 1-8-8L12 2.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicIcon = ({
  pulse,
}: {
  pulse?: boolean;
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={
      pulse
        ? {
            animation:
              "leo-mic-pulse 1.1s ease-in-out infinite",
          }
        : undefined
    }
  >
    <rect
      x="9"
      y="2.5"
      width="6"
      height="12"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />

    <path
      d="M5.5 11.5A6.5 6.5 0 0 0 12 18a6.5 6.5 0 0 0 6.5-6.5M12 18v3.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 12 20 4l-6.5 16-3-6.5L4 12Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{
      animation:
        "leo-spin 0.7s linear infinite",
    }}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="42 100"
    />
  </svg>
);
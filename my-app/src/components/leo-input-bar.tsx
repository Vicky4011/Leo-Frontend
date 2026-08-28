"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";

export interface LeoInputBarHandle {
  startListening: () => void;
  stopListening: () => void;
}

interface LeoInputBarProps {
  onSend?: (message: string, files: File[]) => void | Promise<void>;
  onAttach?: (files: File[]) => void;
  onMicClick?: (listening: boolean) => void;
  ref?: React.Ref<LeoInputBarHandle>;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 20;

export const LeoInputBar = ({ onSend, onAttach, onMicClick, ref }: LeoInputBarProps) => {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [focused, setFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setValue((prev) => {
        const base = prev.replace(/\s+$/, "");
        return base ? `${base} ${transcript}` : transcript;
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
      onMicClick?.(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onMicClick?.(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (!micSupported || !recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      onMicClick?.(true);
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
    onMicClick?.(false);
  };

  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
  }));

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend?.(trimmed, files);
      setValue("");
      setFiles([]);
      requestAnimationFrame(resizeTextarea);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    setFileError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    const tooBig = picked.filter((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooBig.length > 0) {
      setFileError(`Files must be under ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setFiles((prev) => {
      const merged = [...prev];
      for (const file of picked) {
        const exists = merged.some((f) => f.name === file.name && f.size === file.size);
        if (!exists) merged.push(file);
      }
      const next = merged.slice(0, MAX_FILES);
      onAttach?.(next);
      return next;
    });

    if (picked.length + files.length > MAX_FILES) {
      setFileError(`You can attach up to ${MAX_FILES} files`);
    } else {
      setFileError(null);
    }
  };

  const removeFile = (name: string, size: number) => {
    setFiles((prev) => {
      const next = prev.filter((f) => !(f.name === name && f.size === size));
      onAttach?.(next);
      return next;
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 620,
        borderRadius: 20,
        border: `1px solid ${focused ? "var(--input-focus-border)" : "var(--toggle-border)"}`,
        background: "var(--toggle-bg)",
        boxShadow: focused ? "var(--input-focus-shadow)" : "none",
        padding: "14px 16px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                maxWidth: 220,
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid var(--toggle-border)",
                background: "var(--toggle-hover)",
                fontSize: 12,
                color: "var(--foreground)",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={file.name}
              >
                {file.name}
              </span>
              <span style={{ color: "var(--input-placeholder)", flexShrink: 0 }}>
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(file.name, file.size)}
                aria-label={`Remove ${file.name}`}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--input-icon)",
                  cursor: "pointer",
                  fontSize: 13,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {fileError && <span style={{ fontSize: 12, color: "#e5484d" }}>{fileError}</span>}

      <textarea
        ref={textareaRef}
        className="leo-input-textarea"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          resizeTextarea();
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={1}
        placeholder={isListening ? "Listening..." : "Ask Leo anything..."}
        aria-label="Ask Leo anything"
        style={{
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "var(--foreground)",
          fontSize: 15,
          lineHeight: 1.5,
          fontFamily: "inherit",
          maxHeight: 120,
          overflowY: "auto",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconButton label="Attach a file" onClick={handleAttachClick}>
            <PaperclipIcon />
          </IconButton>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={toggleMic}
            disabled={!micSupported}
            aria-label={isListening ? "Stop voice input" : "Voice input"}
            aria-pressed={isListening}
            title={micSupported ? "Voice input" : "Voice input not supported in this browser"}
            style={{
              width: 34,
              height: 34,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              border: `1px solid ${isListening ? "var(--input-accent)" : "var(--toggle-border)"}`,
              background: isListening ? "var(--input-accent-soft)" : "var(--toggle-bg)",
              color: isListening ? "var(--input-accent)" : "var(--input-icon)",
              cursor: micSupported ? "pointer" : "not-allowed",
              opacity: micSupported ? 1 : 0.5,
              transition: "background 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(event) => {
              if (micSupported && !isListening) {
                event.currentTarget.style.background = "var(--toggle-hover)";
              }
            }}
            onMouseLeave={(event) => {
              if (micSupported && !isListening) {
                event.currentTarget.style.background = "var(--toggle-bg)";
              }
            }}
          >
            <MicIcon pulse={isListening} />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || isSending}
            aria-label="Send message"
            title="Send"
            style={{
              width: 34,
              height: 34,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              border: "none",
              background:
                value.trim() && !isSending ? "var(--input-accent)" : "var(--input-accent-soft)",
              color: value.trim() && !isSending ? "#ffffff" : "var(--input-accent)",
              cursor: value.trim() && !isSending ? "pointer" : "default",
              transition: "transform 0.15s ease, background 0.2s ease",
            }}
            onMouseEnter={(event) => {
              if (value.trim() && !isSending) {
                event.currentTarget.style.transform = "scale(1.06)";
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isSending ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

const IconButton = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    style={{
      width: 30,
      height: 30,
      display: "grid",
      placeItems: "center",
      borderRadius: 8,
      border: "none",
      background: "transparent",
      color: "var(--input-icon)",
      cursor: "pointer",
      transition: "background 0.15s ease, color 0.15s ease",
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.background = "var(--toggle-hover)";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.background = "transparent";
    }}
  >
    {children}
  </button>
);

const PaperclipIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M8 12.5 15.5 5a3.54 3.54 0 0 1 5 5L11.5 19a5.7 5.7 0 0 1-8-8L12 2.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicIcon = ({ pulse }: { pulse?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={pulse ? { animation: "leo-mic-pulse 1.1s ease-in-out infinite" } : undefined}
  >
    <rect x="9" y="2.5" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5.5 11.5A6.5 6.5 0 0 0 12 18a6.5 6.5 0 0 0 6.5-6.5M12 18v3.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    style={{ animation: "leo-spin 0.7s linear infinite" }}
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
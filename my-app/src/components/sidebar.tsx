"use client";

import { useEffect } from "react";

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (key: string) => void;
  hideBackdrop?: boolean;
}

const TOP_ITEMS: SidebarItem[] = [
  { key: "chat", label: "Chat", icon: <ChatIcon /> },
  { key: "email", label: "E-Mail", icon: <EmailIcon /> },
  { key: "calendar", label: "Calendar", icon: <CalendarIcon /> },
  { key: "reminder", label: "Reminder", icon: <ReminderIcon /> },
];

export const Sidebar = ({ open, onClose, onNavigate, hideBackdrop = false }: SidebarProps) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {!hideBackdrop && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.3s ease",
            zIndex: 70,
          }}
        />
      )}

      {/* Sliding panel */}
      <div
        role="dialog"
        aria-label="Navigation sidebar"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: 240,
          background: "var(--toggle-bg)",
          borderRight: "1px solid var(--toggle-border)",
          boxShadow: "8px 0 32px rgba(0, 0, 0, 0.35)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
          paddingTop: 48,
          boxSizing: "border-box",
        }}
      >
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "0px 0px",
            flex: 1,
          }}
        >
          {TOP_ITEMS.map((item) => (
            <SidebarButton
              key={item.key}
              label={item.label}
              icon={item.icon}
              onClick={() => onNavigate?.(item.key)}
            />
          ))}
        </nav>

        <div
          style={{
            padding: "8px 10px 16px",
            borderTop: "1px solid var(--toggle-border)",
          }}
        >
          <SidebarButton
            label="Settings"
            icon={<SettingsIcon />}
            onClick={() => onNavigate?.("settings")}
          />
        </div>
      </div>
    </>
  );
};

const SidebarButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "none",
      background: "transparent",
      color: "var(--foreground)",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      textAlign: "left",
      transition: "background 0.15s ease",
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.background = "var(--toggle-hover)";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.background = "transparent";
    }}
  >
    <span
      style={{
        display: "grid",
        placeItems: "center",
        width: 20,
        height: 20,
        color: "var(--input-icon)",
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
    {label}
  </button>
);

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 6.5 12 13l8.5-6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ReminderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M19.4 13a7.97 7.97 0 0 0 0-2l2.02-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.38.96a7.98 7.98 0 0 0-1.73-1l-.36-2.53a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.53a7.98 7.98 0 0 0-1.73 1l-2.38-.96a.5.5 0 0 0-.6.22L2.66 8.78a.5.5 0 0 0 .12.64L4.8 11a7.97 7.97 0 0 0 0 2l-2.02 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.38-.96a7.98 7.98 0 0 0 1.73 1l.36 2.53a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.53a7.98 7.98 0 0 0 1.73-1l2.38.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
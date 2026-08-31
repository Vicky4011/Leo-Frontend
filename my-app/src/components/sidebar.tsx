"use client";

import { useEffect } from "react";

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate?: (key: string) => void;
  hideBackdrop?: boolean;
}

const TOP_ITEMS: SidebarItem[] = [
  {
    key: "chat",
    label: "Chat",
    icon: <ChatIcon />,
  },
  {
    key: "task",
    label: "Task",
    icon: <TaskIcon />,
  },
  {
    key: "email",
    label: "E-Mail",
    icon: <EmailIcon />,
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: <CalendarIcon />,
  },
  {
    key: "file",
    label: "File",
    icon: <FileIcon />,
  },
];

const TOP_BAR_HEIGHT = 32;

export const SIDEBAR_COLLAPSED_WIDTH = 40;
export const SIDEBAR_EXPANDED_WIDTH = 240;

export const Sidebar = ({
  open,
  onOpen,
  onClose,
  onNavigate,
  hideBackdrop = false,
}: SidebarProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <>
      {/* =========================================================
          BACKDROP
          ========================================================= */}
      {open && !hideBackdrop && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: TOP_BAR_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            transition: "opacity 0.3s ease",
            zIndex: 70,
          }}
        />
      )}

      {/* =========================================================
          SIDEBAR
          ========================================================= */}
      <div
        role="navigation"
        aria-label="Sidebar"
        style={{
          position: "fixed",
          top: TOP_BAR_HEIGHT,
          left: 0,
          height: `calc(100% - ${TOP_BAR_HEIGHT}px)`,
          width: open
            ? SIDEBAR_EXPANDED_WIDTH
            : SIDEBAR_COLLAPSED_WIDTH,

          background: "var(--toggle-bg)",

          borderRight:
            "1px solid var(--toggle-border)",

          boxShadow:
            "8px 0 32px rgba(0, 0, 0, 0.35)",

          transition:
            "width 0.28s cubic-bezier(0.22, 1, 0.36, 1)",

          zIndex: 80,

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",

          boxSizing: "border-box",
        }}
      >
        {/* =======================================================
            TOP SIDEBAR BUTTON

            Expanded:
            Minimize icon on RIGHT

            Collapsed:
            Expand/hamburger icon CENTER
            ======================================================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",

            justifyContent: open
              ? "flex-end"
              : "center",

            padding: open
              ? "10px 10px 4px"
              : "10px 8px 4px",
          }}
        >
          <button
            type="button"
            onClick={open ? onClose : onOpen}
            aria-label={
              open
                ? "Minimize sidebar"
                : "Expand sidebar"
            }
            title={
              open
                ? "Minimize sidebar"
                : "Expand sidebar"
            }
            style={{
              display: "grid",
              placeItems: "center",

              width: 28,
              height: 28,

              borderRadius: 8,

              border: "none",

              background: "transparent",

              color: "var(--foreground)",

              cursor: "pointer",

              flexShrink: 0,

              padding: 0,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                "var(--toggle-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "transparent";
            }}
          >
            {open ? (
              /* =================================================
                 MINIMIZE ICON

                 Rounded rectangle + vertical divider
                 ================================================= */
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />

                <path
                  d="M9 5v14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              /* =================================================
                 EXPAND ICON
                 ================================================= */
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
            )}
          </button>
        </div>

        {/* =======================================================
            MAIN NAVIGATION
            ======================================================= */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",

            gap: 4,

            padding: open
              ? "4px 10px"
              : "8px",

            flex: 1,
          }}
        >
          {TOP_ITEMS.map((item) => (
            <SidebarButton
              key={item.key}
              label={item.label}
              icon={item.icon}
              collapsed={!open}
              onClick={() =>
                onNavigate?.(item.key)
              }
            />
          ))}
        </nav>

        {/* =======================================================
            SETTINGS
            ======================================================= */}
        <div
          style={{
            padding: open
              ? "8px 10px 16px"
              : "8px 8px 12px",

            borderTop:
              "1px solid var(--toggle-border)",
          }}
        >
          <SidebarButton
            label="Settings"
            icon={<SettingsIcon />}
            collapsed={!open}
            onClick={() =>
              onNavigate?.("settings")
            }
          />
        </div>
      </div>
    </>
  );
};

/* ===============================================================
   SIDEBAR BUTTON
   =============================================================== */

const SidebarButton = ({
  label,
  icon,
  onClick,
  collapsed,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  collapsed?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={collapsed ? label : undefined}
    style={{
      display: "flex",
      alignItems: "center",

      justifyContent: collapsed
        ? "center"
        : "flex-start",

      gap: 12,

      width: "100%",

      padding: collapsed
        ? "10px"
        : "10px 12px",

      borderRadius: 10,

      border: "none",

      background: "transparent",

      color: "var(--foreground)",

      fontSize: 14,

      fontWeight: 500,

      cursor: "pointer",

      textAlign: "left",

      transition:
        "background 0.15s ease",

      whiteSpace: "nowrap",

      overflow: "hidden",
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.background =
        "var(--toggle-hover)";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.background =
        "transparent";
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

    {!collapsed && label}
  </button>
);

/* ===============================================================
   CHAT ICON
   =============================================================== */

function ChatIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ===============================================================
   TASK ICON
   =============================================================== */

function TaskIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3.5"
        width="16"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 8h1.5M11.5 8H16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M8 12h1.5M11.5 12H16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M8 16h1.5M11.5 16H16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ===============================================================
   EMAIL ICON
   =============================================================== */

function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

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

/* ===============================================================
   CALENDAR ICON
   =============================================================== */

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 9.5h17M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ===============================================================
   FILE ICON
   =============================================================== */

function FileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M14 3.5V8h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M8.5 12h7M8.5 15.5h7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ===============================================================
   SETTINGS ICON
   =============================================================== */

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M19.4 13a7.97 7.97 0 0 0 0-2l2.02-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.38.96a7.98 7.98 0 0 0-1.73-1l-.36-2.53a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.53a7.98 7.98 0 0 0-1.73 1l-2.38-.96a.5.5 0 0 0-.6.22L2.66 8.78a.5.5 0 0 0 .12.64L4.8 11a7.97 7.97 0 0 0 0 2l-2.02 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.38-.96a7.98 7.98 0 0 0 1.73 1l.36 2.53a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.53a7.98 7.98 0 0 0 1.73-1l2.38.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
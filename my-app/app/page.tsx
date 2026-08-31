"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";

import { ThemeToggle } from "../src/components/theme-toggle";

import {
  Sidebar,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "../src/components/sidebar";

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

// ============================================================
// TYPES
// ============================================================

type OrbState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "disabled";

type ActivePage =
  | "task"
  | "email"
  | "calendar"
  | "file"
  | "settings"
  | "orbCustomization"
  | null;

// ============================================================
// PAGE TITLES
// ============================================================

const PAGE_TITLES: Record<Exclude<ActivePage, null>, string> = {
  task: "Task",
  email: "E-Mail",
  calendar: "Calendar",
  file: "File",
  settings: "Settings",
  orbCustomization: "Orb Customization",
};

const ORB_PRESET_COLORS = [
  "#4EA7FF",
  "#9B4DFF",
  "#00C8B7",
  "#FF6818",
  "#D943D9",
  "#4DB8FF",
  "#C5D0DF",
];

// ============================================================
// TASK DATA
// ============================================================

const SAMPLE_TASKS = [
  {
    title: "Leo Phase 3.5 Pipeline Test",
    description:
      "Created through Leo ChatService, ApprovalManager, ToolPipeline, and GoogleTasksTool.",
  },
  {
    title: "Leo Phase 3.5 Tasks Test",
    description:
      "Test task created by Leo's GoogleTasksTool.",
  },
  {
    title: "Leo Phase 3.5 Pipeline Test",
    description:
      "Created through Leo ChatService, ApprovalManager, ToolPipeline, and GoogleTasksTool.",
  },
  {
    title: "Leo Phase 3.5 Tasks Test",
    description:
      "Test task created by Leo's GoogleTasksTool.",
  },
  {
    title: "Leo Phase 3.5 Pipeline Test",
    description:
      "Created through Leo ChatService, ApprovalManager, ToolPipeline, and GoogleTasksTool.",
  },
  {
    title: "Leo Phase 3.5 Tasks Test",
    description:
      "Test task created by Leo's GoogleTasksTool.",
  },
];

// ============================================================
// EMAIL DATA
// ============================================================

const SAMPLE_EMAILS = [
  {
    id: 1,
    source: "Glassdoor Jobs",
    sender: "Glassdoor Jobs",
    subject:
      "AI Engineer at tayana academy and 10 more jobs in Remote, India for you. Apply Now.",
    preview:
      "Displaysamp; Beyond is hiring. Explore exciting opportunities and apply for jobs matching your profile.",
    time: "18:08",
    unread: true,
    important: true,
  },
  {
    id: 2,
    source: '"FlyRank Team" via FlyRank...',
    sender: "LinkedIn & CV Audit",
    subject:
      "Internship | CV Audit | Cooldown Period Restarted",
    preview:
      "Hello everyone, the cooldown period for the LinkedIn and CV Audit has now been restarted.",
    time: "16:36",
    unread: true,
    important: true,
  },
  {
    id: 3,
    source: "LinkedIn",
    sender: "LinkedIn",
    subject:
      "You have new opportunities waiting for you",
    preview:
      "Explore new jobs, connections and updates based on your recent activity.",
    time: "14:22",
    unread: true,
    important: false,
  },
  {
    id: 4,
    source: "Google",
    sender: "Google",
    subject: "Security alert",
    preview:
      "Review recent security activity and make sure your Google account is protected.",
    time: "12:45",
    unread: false,
    important: true,
  },
  {
    id: 5,
    source: "Glassdoor Jobs",
    sender: "Glassdoor Jobs",
    subject:
      "New jobs matching your preferences",
    preview:
      "We found new opportunities that match your job search preferences.",
    time: "11:18",
    unread: false,
    important: false,
  },
  {
    id: 6,
    source: "LinkedIn",
    sender: "LinkedIn",
    subject:
      "Your weekly job recommendations",
    preview:
      "Here are some new positions that may be a good fit for your profile.",
    time: "09:42",
    unread: false,
    important: false,
  },
];

// ============================================================
// CALENDAR DATA
// ============================================================

interface CalendarEventItem {
  title: string;
  time?: string;
}

// Sample events keyed by "YYYY-MM-DD" — replace with real Google Calendar data later
const SAMPLE_CALENDAR_EVENTS: Record<string, CalendarEventItem[]> = {
  "2026-08-06": [{ title: "Design review", time: "3:00 PM" }],
  "2026-08-14": [{ title: "Leo Phase 3.5 demo", time: "11:00 AM" }],
  "2026-08-21": [
    { title: "Sprint planning", time: "10:00 AM" },
    { title: "1:1 with mentor", time: "4:30 PM" },
  ],
  "2026-10-04": [{ title: "My Birthday" }],
};

const CALENDAR_WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ============================================================
// MAIN
// ============================================================

export default function Home() {
  // ==========================================================
  // ORB
  // ==========================================================

  const [state, setState] =
    useState<OrbState>("idle");

  const [colorFrom, setColorFrom] =
    useState("#f0abfc");

  const [colorTo, setColorTo] =
    useState("#818cf8");

  const [sizeKey, setSizeKey] =
    useState<SizeKey>("MD");

  const orbSize =
    SIZE_PRESETS[sizeKey];

  const orbClickDiameter =
    Math.round(orbSize * 0.68);

  // ==========================================================
  // SIDEBAR
  // ==========================================================

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [activePage, setActivePage] =
    useState<ActivePage>(null);

  const sidebarWidth =
    isSidebarOpen
      ? SIDEBAR_EXPANDED_WIDTH
      : SIDEBAR_COLLAPSED_WIDTH;

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);


  // ==========================================================
// CALENDAR
// ==========================================================

const today = useMemo(() => new Date(), []);

const [calendarVisibleMonth, setCalendarVisibleMonth] = useState(
  () => new Date(today.getFullYear(), today.getMonth(), 1)
);

const [calendarSelectedDate, setCalendarSelectedDate] = useState(today);

const calendarGoToday = () => {
  setCalendarVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  setCalendarSelectedDate(today);
};

const calendarGoPrevMonth = () => {
  setCalendarVisibleMonth(
    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
  );
};

const calendarGoNextMonth = () => {
  setCalendarVisibleMonth(
    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
  );
};

const calendarWeeks = useMemo(() => {
  const year = calendarVisibleMonth.getFullYear();
  const month = calendarVisibleMonth.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0

  const startDate = new Date(year, month, 1 - firstWeekday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
  }

  const result: Date[][] = [];
  for (let i = 0; i < 6; i += 1) {
    result.push(days.slice(i * 7, i * 7 + 7));
  }
  return result;
}, [calendarVisibleMonth]);

const calendarMonthLabel = calendarVisibleMonth.toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const calendarSelectedLabel = calendarSelectedDate.toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const calendarSelectedEvents =
  SAMPLE_CALENDAR_EVENTS[toDateKey(calendarSelectedDate)] ?? [];

  // ==========================================================
  // GOOGLE CONNECTION
  //
  // IMPORTANT:
  //
  // This is the state that should eventually be
  // connected to your Google OAuth/API status.
  //
  // true  = Google Connected
  // false = Google Not Connected
  // ==========================================================

  const [isGoogleConnected, setIsGoogleConnected] =
    useState(false);

  // ==========================================================
  // LIVE MODE
  // ==========================================================

  const [isLiveMode, setIsLiveMode] =
    useState(false);

  const [showLiveModeMessage, setShowLiveModeMessage] =
    useState(false);

  const liveModeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const leoInputRef =
    useRef<LeoInputBarHandle>(null);

  // ==========================================================
  // ORB POSITION
  // ==========================================================

  const orbPlaceholderRef =
    useRef<HTMLDivElement | null>(null);

  const [orbBasePos, setOrbBasePos] = useState({
    top: 0,
    left: 0,
  });

  const [viewportWidth, setViewportWidth] =
    useState(0);

  const [isOrbAnimated, setIsOrbAnimated] =
    useState(false);

  // ==========================================================
  // MEASURE ORB
  // ==========================================================

  useEffect(() => {
    const measure = () => {
      const element =
        orbPlaceholderRef.current;

      if (element) {
        const rect =
          element.getBoundingClientRect();

        setOrbBasePos({
          top: rect.top,
          left: rect.left,
        });
      }

      setViewportWidth(
        window.innerWidth
      );
    };

    measure();

    window.addEventListener(
      "resize",
      measure
    );

    return () => {
      window.removeEventListener(
        "resize",
        measure
      );
    };
  }, [orbSize]);

  // ==========================================================
  // MINI ORB
  // ==========================================================

  const miniOrbTop = 72;
  const miniOrbRight = 16;
  const miniOrbScale = 0.55;

  const miniOrbLeft =
    viewportWidth -
    orbSize -
    miniOrbRight;

  // ==========================================================
  // LIVE MODE
  // ==========================================================

  const startLiveMode = () => {
    if (isLiveMode) {
      return;
    }

    setIsLiveMode(true);

    setState("listening");

    setShowLiveModeMessage(true);

    if (liveModeTimer.current) {
      clearTimeout(
        liveModeTimer.current
      );
    }

    liveModeTimer.current =
      setTimeout(() => {
        setShowLiveModeMessage(false);
      }, 3000);

    leoInputRef.current?.startListening();
  };

  const handleOrbClick = () => {
    if (isLiveMode) {
      return;
    }

    startLiveMode();
  };

  const exitLiveMode = () => {
    leoInputRef.current?.stopListening();

    setIsLiveMode(false);

    setState("idle");

    setShowLiveModeMessage(false);

    if (liveModeTimer.current) {
      clearTimeout(
        liveModeTimer.current
      );

      liveModeTimer.current = null;
    }
  };

  const handleMicClick = (
    listening: boolean
  ) => {
    if (listening) {
      setState("listening");
    } else {
      setState("idle");
    }
  };

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      if (liveModeTimer.current) {
        clearTimeout(
          liveModeTimer.current
        );
      }
    };
  }, []);

  // ==========================================================
  // CARD HOVER
  //
  // SAME EFFECT FOR:
  // E-MAIL CARDS
  // TASK CARDS
  // ==========================================================

  const handleCardMouseEnter = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    event.currentTarget.style.background =
      "var(--toggle-hover)";

    event.currentTarget.style.transform =
      "translateY(-1px)";

    event.currentTarget.style.boxShadow =
      "0 5px 16px rgba(0, 0, 0, 0.08)";
  };

  const handleCardMouseLeave = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    event.currentTarget.style.background =
      "var(--toggle-bg)";

    event.currentTarget.style.transform =
      "translateY(0)";

    event.currentTarget.style.boxShadow =
      "none";
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigation = (
    key: string
  ) => {
    if (key === "settings") {
      setIsSettingsOpen(true);
      setIsSidebarOpen(false);
      setActivePage(null);
      return;
    }

    if (key === "chat") {
      setActivePage(null);
      setIsSidebarOpen(true);
      return;
    }

    if (
      key === "task" ||
      key === "email" ||
      key === "calendar" ||
      key === "file"
    ) {
      setActivePage(
        key as ActivePage
      );

      setIsSidebarOpen(true);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

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
          SIDEBAR
          ====================================================== */}

      <Sidebar
        open={isSidebarOpen}
        onOpen={() =>
          setIsSidebarOpen(true)
        }
        onClose={() => {
          setIsSidebarOpen(false);
          setActivePage(null);
        }}
        hideBackdrop={
          activePage !== null
        }
        onNavigate={
          handleNavigation
        }
      />

      {/* ======================================================
          TOP TITLE
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
          zIndex: 60,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color:
              "var(--foreground)",
            letterSpacing:
              "0.3px",
          }}
        >
          Leo
        </span>
      </div>

      {/* ======================================================
          THEME
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
          PAGE PANEL
          ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: 32,
          left: sidebarWidth,
          right: 0,
          bottom: 0,
          background:
            "var(--background)",
          zIndex: 75,
          display: "flex",
          flexDirection: "column",
          padding:
            "24px 28px 28px",
          boxSizing:
            "border-box",
          overflowY: "auto",
          opacity:
            activePage ? 1 : 0,
          transform:
            activePage
              ? "translateX(0)"
              : "translateX(24px)",
          pointerEvents:
            activePage
              ? "auto"
              : "none",
          transition:
            "opacity 0.28s ease, transform 0.28s ease, left 0.28s ease",
        }}
      >
        {/* ====================================================
            PAGE HEADER
            ==================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent:
              "space-between",
            marginBottom:
              activePage === "email"
                ? 18
                : 20,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize:
                  activePage === "email"
                    ? 18
                    : 20,
                fontWeight: 700,
                lineHeight: 1.2,
                color:
                  "var(--foreground)",
              }}
            >
              {activePage
                ? PAGE_TITLES[
                    activePage
                  ]
                : ""}
            </h2>

            {(activePage === "task" || activePage === "calendar") && (
              <p
                style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--input-placeholder)",
                }}
              >
              {activePage === "task" ? "Your Google Tasks" : "Your Google Calendar"}
              </p>
          )}
          </div>

          {/* ==================================================
              GOOGLE CONNECTION STATUS

              THIS IS NOW DYNAMIC
              ================================================== */}

          {activePage ===
            "email" && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems:
                  "center",
                gap: 6,
                marginTop: 4,
                marginRight: 8,
                fontSize: 10,
                color:
                  "var(--input-placeholder)",
                whiteSpace:
                  "nowrap",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius:
                    "50%",
                  display:
                    "inline-block",
                  flexShrink: 0,

                  /*
                   * GREEN when connected.
                   * RED when not connected.
                   */

                  background:
                    isGoogleConnected
                      ? "#34a853"
                      : "#ef4444",
                }}
              />

              <span>
                {isGoogleConnected
                  ? "Google Connected"
                  : "Google Not Connected"}
              </span>
            </div>
          )}

          {/* ==================================================
              CLOSE PAGE
              ================================================== */}

          <button
            type="button"
            onClick={() =>
              setActivePage(null)
            }
            aria-label="Close page"
            style={{
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              borderRadius: 8,
              border:
                "1px solid var(--toggle-border)",
              background:
                "var(--toggle-bg)",
              color:
                "var(--foreground)",
              cursor: "pointer",
              padding: 0,
            }}
            onMouseEnter={(
              event
            ) => {
              event.currentTarget.style.background =
                "var(--toggle-hover)";
            }}
            onMouseLeave={(
              event
            ) => {
              event.currentTarget.style.background =
                "var(--toggle-bg)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ====================================================
            TASK PAGE
            ==================================================== */}

        {activePage === "task" && (
          <div
            style={{
              width: "100%",
              maxWidth: 1000,
              display: "flex",
              flexDirection:
                "column",
              gap: 7,
            }}
          >
            {SAMPLE_TASKS.map(
              (task, index) => (
                <div
                  key={`${task.title}-${index}`}
                  role="button"
                  tabIndex={0}
                  style={{
                    width: "100%",
                    minHeight: 68,
                    padding:
                      "14px 16px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid var(--toggle-border)",
                    borderRadius: 8,
                    background:
                      "var(--toggle-bg)",
                    color:
                      "var(--foreground)",
                    cursor: "pointer",
                    outline: "none",

                    /*
                     * SAME HOVER TRANSITION
                     * AS EMAIL CARDS
                     */

                    transition:
                      "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={
                    handleCardMouseEnter
                  }
                  onMouseLeave={
                    handleCardMouseLeave
                  }
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color:
                        "var(--foreground)",
                    }}
                  >
                    {task.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color:
                        "var(--input-placeholder)",
                    }}
                  >
                    {task.description}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ====================================================
            EMAIL PAGE
            ==================================================== */}

        {activePage === "email" && (
          <div
            style={{
              width: "100%",
              maxWidth: 1000,
              display: "flex",
              flexDirection:
                "column",
              gap: 7,
            }}
          >
            {SAMPLE_EMAILS.map(
              (email) => (
                <div
                  key={email.id}
                  role="button"
                  tabIndex={0}
                  style={{
                    width: "100%",
                    minHeight: 68,

                    /*
                     * IMPORTANT:
                     *
                     * There is NO 8px unread-dot
                     * column here.
                     *
                     * The card begins directly
                     * with the sender.
                     */

                    display: "grid",
                    gridTemplateColumns:
                      "minmax(125px, 155px) minmax(0, 1fr)",

                    alignItems: "center",
                    gap: 10,
                    padding:
                      "10px 13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid var(--toggle-border)",
                    borderRadius: 8,
                    background:
                      "var(--toggle-bg)",
                    color:
                      "var(--foreground)",
                    cursor: "pointer",
                    outline: "none",

                    /*
                     * SAME HOVER EFFECT
                     * AS TASK CARDS
                     */

                    transition:
                      "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={
                    handleCardMouseEnter
                  }
                  onMouseLeave={
                    handleCardMouseLeave
                  }
                >
                  {/* ==========================================
                      SENDER
                      ========================================== */}

                  <div
                    style={{
                      minWidth: 0,
                      overflow:
                        "hidden",
                      whiteSpace:
                        "nowrap",
                      textOverflow:
                        "ellipsis",
                      fontSize: 11,
                      fontWeight:
                        email.unread
                          ? 600
                          : 500,
                      color:
                        "var(--foreground)",
                    }}
                    title={
                      email.source
                    }
                  >
                    {email.source}
                  </div>

                  {/* ==========================================
                      EMAIL CONTENT
                      ========================================== */}

                  <div
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 3,
                    }}
                  >
                    {/* ========================================
                        SUBJECT
                        ======================================== */}

                    <div
                      style={{
                        width:
                          "100%",
                        minWidth: 0,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          minWidth: 0,
                          flex: 1,
                          overflow:
                            "hidden",
                          whiteSpace:
                            "nowrap",
                          textOverflow:
                            "ellipsis",
                          fontSize: 11,
                          fontWeight:
                            email.unread
                              ? 600
                              : 500,
                          color:
                            "var(--foreground)",
                        }}
                        title={
                          email.subject
                        }
                      >
                        {email.subject}
                      </span>

                      {/* ======================================
                          IMPORTANT LABEL
                          ====================================== */}

                      {email.important && (
                        <span
                          style={{
                            flexShrink: 0,
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            padding:
                              "2px 7px",
                            borderRadius:
                              4,
                            border:
                              "1px solid rgba(34, 197, 94, 0.3)",
                            background:
                              "rgba(34, 197, 94, 0.12)",
                            color:
                              "#22c55e",
                            fontSize: 8,
                            fontWeight: 600,
                            lineHeight:
                              1.2,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          Important
                        </span>
                      )}

                      {/* ======================================
                          TIME
                          ====================================== */}

                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 9,
                          color:
                            "var(--input-placeholder)",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {email.time}
                      </span>
                    </div>

                    {/* ========================================
                        PREVIEW
                        ======================================== */}

                    <div
                      style={{
                        minWidth: 0,
                        overflow:
                          "hidden",
                        whiteSpace:
                          "nowrap",
                        textOverflow:
                          "ellipsis",
                        fontSize: 9,
                        lineHeight:
                          1.35,
                        color:
                          "var(--input-placeholder)",
                      }}
                      title={
                        email.preview
                      }
                    >
                      <span
                        style={{
                          color:
                            "var(--foreground)",
                          fontWeight: 500,
                        }}
                      >
                        {email.sender}
                      </span>

                      <span
                        style={{
                          margin:
                            "0 4px",
                        }}
                      >
                        —
                      </span>

                      <span>
                        {email.preview}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ====================================================
            CALENDAR
            ==================================================== */}

        {activePage === "calendar" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {/* Light calendar card */}
    <div
      style={{
        background: "var(--toggle-bg)",
        border: "1px solid var(--toggle-border)",
        borderRadius: 18,
        padding: "18px 20px 22px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          onClick={calendarGoPrevMonth}
          aria-label="Previous month"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
          }}
        >
          ‹
        </button>

        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", }}>
          {calendarMonthLabel}
        </span>

        <button
          type="button"
          onClick={calendarGoNextMonth}
          aria-label="Next month"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
          }}
        >
          ›
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {CALENDAR_WEEKDAYS.map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--input-placeholder)",
              letterSpacing: "0.4px",
              padding: "4px 0",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {calendarWeeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}
          >
            {week.map((day) => {
              const inCurrentMonth = day.getMonth() === calendarVisibleMonth.getMonth();
              const isSelected = isSameDay(day, calendarSelectedDate);
              const isToday = isSameDay(day, today);
              const hasEvents = (SAMPLE_CALENDAR_EVENTS[toDateKey(day)] ?? []).length > 0;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setCalendarSelectedDate(day)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: "5px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      fontSize: 13,
                      fontWeight: isSelected || isToday ? 700 : 500,
                      color: isSelected
                        ? "#ffffff"
                        : inCurrentMonth
                          ? "var(--foreground)"
                          : "var(--input-placeholder)",
                      background: isSelected
                        ? "linear-gradient(135deg, #7c6cff, #9b8cff)"
                        : isToday
                          ? "rgba(124,108,255,0.15)"
                          : "transparent",
                    }}
                  >
                    {day.getDate()}
                  </span>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: hasEvents
                        ? isSelected
                          ? "#ffffff"
                          : "#7c6cff"
                        : "transparent",
                    }}
                  />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>

    {/* Selected date detail */}
    <div
      style={{
        borderTop: "1px solid var(--toggle-border)",
        paddingTop: 14,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
        {calendarSelectedLabel}
      </div>

      {calendarSelectedEvents.length === 0 ? (
        <div
          style={{
            fontSize: 13,
            color: "var(--input-placeholder)",
            marginTop: 4,
          }}
        >
          No events
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {calendarSelectedEvents.map((event) => (
            <div
              key={event.title}
              style={{
                border: "1px solid var(--toggle-border)",
                borderRadius: 10,
                padding: "10px 12px",
                background: "var(--toggle-bg)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                {event.title}
              </div>
              {event.time && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--input-placeholder)",
                    marginTop: 2,
                  }}
                >
                  {event.time}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

        {/* ====================================================
            FILE
            ==================================================== */}

        {activePage === "file" && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color:
                "var(--input-placeholder)",
            }}
          >
            This is the File page —
            content coming soon.
          </p>
        )}
      </div>

      {/* ======================================================
          ORB
          ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: isOrbAnimated
            ? miniOrbTop
            : orbBasePos.top,
          left: isOrbAnimated
            ? miniOrbLeft
            : orbBasePos.left,
          width: orbSize,
          height: orbSize,
          display: "grid",
          placeItems: "center",
          transformOrigin:
            "top right",
          transform: isOrbAnimated
            ? `scale(${miniOrbScale})`
            : "scale(1)",
          transition:
            "top 2.6s cubic-bezier(0.22, 1, 0.36, 1), left 2.6s cubic-bezier(0.22, 1, 0.36, 1), transform 2.6s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 45,
        }}
      >
        <div
          style={{
            pointerEvents:
              "none",
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
              event.key === " "
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
          }}
        />
      </div>

      {/* ======================================================
          ORB PLACEHOLDER
          ====================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div
          ref={
            orbPlaceholderRef
          }
          style={{
            width: orbSize,
            height: orbSize,
          }}
        />

        {/* ====================================================
            STATE BUTTONS
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
            onClick={() =>
              setState("idle")
            }
          >
            Idle
          </button>

          <button
            onClick={() =>
              setState(
                "connecting"
              )
            }
          >
            Connecting
          </button>

          <button
            onClick={() =>
              setState(
                "listening"
              )
            }
          >
            Listening
          </button>

          <button
            onClick={() =>
              setState(
                "thinking"
              )
            }
          >
            Thinking
          </button>

          <button
            onClick={() =>
              setState(
                "speaking"
              )
            }
          >
            Speaking
          </button>

          <button
            onClick={() =>
              setState("error")
            }
          >
            Error
          </button>

          <button
            onClick={() =>
              setState(
                "disabled"
              )
            }
          >
            Disabled
          </button>

          <button
            onClick={() =>
              setIsOrbAnimated(
                (value) =>
                  !value
              )
            }
          >
            {isOrbAnimated
              ? "Restore Orb"
              : "Animate"}
          </button>
        </div>
      </div>

      {/* ======================================================
          LIVE MODE MESSAGE
          ====================================================== */}

      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top:
            "calc(50% - 280px)",
          left: "50%",
          transform:
            showLiveModeMessage
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(-8px)",
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
          opacity:
            showLiveModeMessage
              ? 1
              : 0,
          pointerEvents:
            "none",
          whiteSpace:
            "nowrap",
          zIndex: 1000,
          transition:
            "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        Live Mode Starts
      </div>

      {/* ======================================================
          BOTTOM INPUT
          ====================================================== */}

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
          padding:
            "0 16px",
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
              NORMAL INPUT
              ================================================== */}

          <div
            style={{
              position:
                "absolute",
              inset: 0,
              display:
                "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
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
                files
              ) => {
                console.log(
                  "message:",
                  message
                );

                console.log(
                  "files:",
                  files
                );
              }}
              onAttach={(
                files
              ) => {
                console.log(
                  "attached:",
                  files
                );
              }}
              onMicClick={
                handleMicClick
              }
            />
          </div>

          {/* ==================================================
              LIVE MODE EXIT
              ================================================== */}

          <div
            style={{
              position:
                "absolute",
              inset: 0,
              display:
                "flex",
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
                display:
                  "grid",
                placeItems:
                  "center",
                cursor:
                  "pointer",
                padding: 0,
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.25)",
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
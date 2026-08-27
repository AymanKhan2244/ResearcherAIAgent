"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

/* ----------------------------------------------------------------
   TYPES
   ---------------------------------------------------------------- */
type Message = {
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

/* ----------------------------------------------------------------
   SUGGESTION CAPSULES
   ---------------------------------------------------------------- */
const SUGGESTIONS = [
  "Latest AI breakthroughs 2026",
  "Climate research updates",
  "Quantum computing synthesis",
  "Neural interface metadata",
];

/* ----------------------------------------------------------------
   MAIN COMPONENT
   ---------------------------------------------------------------- */
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [guardrailMsg, setGuardrailMsg] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* --- Lifecycle --- */
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("researcher_ai_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChats(parsed);
        if (parsed.length > 0) setCurrentChatId(parsed[0].id);
        else createNewChat();
      } catch {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (isClient) localStorage.setItem("researcher_ai_chats", JSON.stringify(chats));
  }, [chats, isClient]);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chats, currentChatId, loading]);

  /* Auto-dismiss guardrail toast */
  useEffect(() => {
    if (guardrailMsg) {
      const t = setTimeout(() => setGuardrailMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [guardrailMsg]);

  /* --- Chat CRUD --- */
  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (currentChatId === id) {
        setCurrentChatId(updated.length > 0 ? updated[0].id : null);
        if (updated.length === 0) setTimeout(createNewChat, 0);
      }
      return updated;
    });
  };

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveTitle = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim()) {
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editingTitle.trim() } : c))
      );
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const currentChat = chats.find((c) => c.id === currentChatId);
  const hasMessages = currentChat && currentChat.messages.length > 0;

  /* --- Send message --- */
  const sendMessage = async (text?: string) => {
    const msgText = text || message;
    if (!msgText.trim() || !currentChatId || loading) return;

    const userMessage: Message = { role: "user", content: msgText };
    const currentMessage = msgText;
    setMessage("");
    setLoading(true);
    setGuardrailMsg(null);

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const isFirst = !chat.messages.some((m) => m.role === "user");
          return {
            ...chat,
            title: isFirst
              ? currentMessage.slice(0, 30) + (currentMessage.length > 30 ? "..." : "")
              : chat.title,
            messages: [...chat.messages, userMessage],
          };
        }
        return chat;
      })
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage }),
      });

      const data = await response.json();
      let botContent: string;

      if (!response.ok) {
        botContent =
          data.response || data.error || "Something went wrong. The server may be starting up — please try again.";
      } else {
        botContent = data.response || "Received an empty response from the server.";
      }

      /* Guardrail detection */
      const isGuardrail =
        botContent.includes("I'm a Research AI Agent") &&
        botContent.includes("only answer questions related to research");

      if (isGuardrail) {
        setGuardrailMsg(botContent);
        /* Remove the user message since it was blocked */
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: chat.messages.filter((m) => m !== userMessage) }
              : chat
          )
        );
      } else {
        const botMessage: Message = { role: "assistant", content: botContent };
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, botMessage] }
              : chat
          )
        );
      }
    } catch {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "assistant", content: "Error: Unable to connect to the backend server." },
                ],
              }
            : chat
        )
      );
    }

    setLoading(false);
  };

  if (!isClient) return null;

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="h-screen w-full flex overflow-hidden relative">
      {/* ── Ambient Gradient Orbs ── */}
      <div className="ambient-orb bg-primary-container w-[400px] h-[400px] top-[-100px] left-[-100px]" />
      <div className="ambient-orb bg-tertiary-container w-[500px] h-[500px] bottom-[10%] right-[-150px]" />

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================================
         SIDEBAR
         ================================================================ */}
      <nav
        className={`glass-sidebar font-body-md text-body-md fixed left-4 top-4 h-[calc(100vh-32px)] rounded-[32px] w-[280px] shadow-[10px_10px_30px_rgba(0,0,0,0.5)] flex flex-col p-md z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+16px)]"
        } md:translate-x-0 border border-outline-variant/20`}
      >
        {/* Header */}
        <div className="mb-xl flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center bg-surface-container-high border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-xl nav-icon icon-filled">
              science
            </span>
          </div>
          <div>
            <h1 className="font-display-xl text-display-xl font-bold text-surface-tint text-xl tracking-tight">
              Researcher AI
            </h1>
            <p className="text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider">
              Precision Intelligence
            </p>
          </div>
        </div>

        {/* New Research CTA */}
        <button
          onClick={createNewChat}
          className="w-full py-sm px-md rounded-lg mb-lg btn-glossy text-primary font-label-sm text-label-sm font-semibold hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] nav-icon">add</span>
          New Research
        </button>

        {/* Navigation */}
        <div className="flex flex-col gap-sm">
          <a
            href="#"
            className="flex items-center gap-sm py-sm px-sm rounded-lg text-primary font-bold border-r-2 border-primary bg-primary-container/10 hover:bg-primary-container/20 transition-all duration-300 active:scale-95"
          >
            <span className="material-symbols-outlined nav-icon icon-filled">history</span>
            History
          </a>

        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto mt-md space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setSidebarOpen(false);
              }}
              className={`group flex items-center justify-between px-sm py-sm rounded-lg cursor-pointer text-label-sm font-label-sm transition-all duration-200 ${
                currentChatId === chat.id
                  ? "bg-primary-container/10 text-primary border-r-2 border-primary"
                  : "text-on-surface-variant hover:bg-primary-container/10 hover:text-on-surface"
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex-1 pr-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle(chat.id, e);
                      if (e.key === "Escape") setEditingChatId(null);
                    }}
                    onBlur={() => saveTitle(chat.id)}
                    autoFocus
                    className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-primary/50 outline-none text-xs focus:ring-1 focus:ring-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <>
                  <span className="truncate flex-1">{chat.title}</span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 gap-1">
                    <button
                      onClick={(e) => startEditing(chat, e)}
                      className="text-outline hover:text-primary p-1 rounded hover:bg-primary-container/20 transition-colors"
                      aria-label="Rename chat"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="text-outline hover:text-error p-1 rounded hover:bg-error/10 transition-colors"
                      aria-label="Delete chat"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-outline-variant/30 pt-md flex flex-col gap-sm">
          <a
            href="#"
            className="flex items-center gap-sm py-sm px-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-primary-container/20 transition-all duration-300 active:scale-95"
          >
            <span className="material-symbols-outlined nav-icon">account_circle</span>
            Profile
          </a>
          <a
            href="#"
            className="flex items-center gap-sm py-sm px-sm rounded-lg text-error hover:text-error-container hover:bg-error/10 transition-all duration-300 active:scale-95"
          >
            <span className="material-symbols-outlined nav-icon">logout</span>
            Log out
          </a>
        </div>
      </nav>

      {/* ================================================================
         MAIN CONTENT
         ================================================================ */}
      <main className="flex-1 flex flex-col md:ml-[312px] relative h-screen pr-4">
        {/* ── Guardrail Toast ── */}
        {guardrailMsg && (
          <div className="fixed top-md left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl">
            <div className="glass-panel rounded-xl p-4 flex items-start gap-4 animate-[fadeUpAnim_0.3s_ease-out]">
              <div className="flex-shrink-0 pt-1">
                <span className="material-symbols-outlined text-tertiary-container icon-filled">
                  warning
                </span>
              </div>
              <div className="flex-1">
                <p className="font-label-sm text-on-surface-variant">
                  <span className="text-on-surface font-medium block mb-1">System Guardrail</span>
                  {guardrailMsg}
                </p>
              </div>
              <button
                onClick={() => setGuardrailMsg(null)}
                className="flex-shrink-0 w-8 h-8 rounded-full skeuomorphic-circle flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  close
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Mobile Header ── */}
        <header className="md:hidden sticky top-0 w-full z-50 glass-header flex justify-between items-center px-lg py-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <span className="material-symbols-outlined text-on-surface-variant">menu</span>
          </button>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary nav-icon">biotech</span>
            <span className="font-title-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary-container">
              Researcher AI
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
        </header>

        {/* ================================================================
           EMPTY STATE — No messages
           ================================================================ */}
        {!hasMessages && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-xl relative z-10">
            <div className="w-full max-w-3xl flex flex-col items-center gap-lg">
              {/* Hero Icon */}
              <div className="flex flex-col items-center gap-md text-center">
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  {/* Pulsing Halos */}
                  <div className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-slow shadow-[0_0_40px_rgba(192,193,255,0.3)]" />
                  <div className="absolute inset-4 rounded-full border border-tertiary-container/50 animate-[pulse_3s_ease-in-out_infinite]" />
                  {/* Glass Core */}
                  <div className="relative w-24 h-24 rounded-full glass-panel flex items-center justify-center neu-raised z-10">
                    <span
                      className="material-symbols-outlined text-primary text-5xl icon-filled"
                      style={{
                        textShadow: "0 0 15px rgba(192,193,255,0.6)",
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
                      }}
                    >
                      psychology
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary mb-xs">
                    What shall we discover today?
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant tracking-wide">
                    Your AI-Powered Research Assistant
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-2xl relative mt-md">
                <div className="w-full bg-[#0a0a14] rounded-full p-xs neu-inset flex items-center border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 rounded-full border border-primary/20 opacity-50 group-hover:opacity-100 group-hover:border-primary/50 transition-all duration-700 pointer-events-none" />
                  <span className="material-symbols-outlined text-outline ml-md mr-sm drop-shadow-md">
                    search
                  </span>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface font-label-sm text-label-sm placeholder:text-outline-variant/60 py-md px-xs outline-none"
                    placeholder="Enter a research topic, hypothesis, or data query..."
                    type="text"
                  />
                  {/* 3D Glossy Orb Button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !message.trim()}
                    className="w-12 h-12 mr-xs rounded-full bg-gradient-to-br from-primary-container to-on-primary-container flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_4px_12px_rgba(13,0,150,0.6)] hover:brightness-110 active:scale-95 transition-all relative overflow-hidden disabled:opacity-30"
                  >
                    <div className="absolute top-1 left-1/4 w-1/2 h-1/3 bg-white/30 rounded-full blur-[1px]" />
                    <span className="material-symbols-outlined text-white icon-filled relative z-10 filter drop-shadow-md">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>

              {/* Suggestion Capsules */}
              <div className="w-full max-w-3xl mt-xl">
                <p className="font-label-xs text-label-xs text-outline-variant uppercase tracking-[0.15em] mb-md text-center">
                  Suggested Starting Points
                </p>
                <div className="flex flex-wrap justify-center gap-md">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => {
                        setMessage(s);
                        sendMessage(s);
                      }}
                      className={`px-lg py-md rounded-full glass-panel neu-raised text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-all ${
                        i === 0
                          ? "animate-float"
                          : i === 1
                          ? "animate-float-delayed"
                          : i === 2
                          ? "animate-float-slow"
                          : "animate-float-slow-delayed"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
           LOADING STATE
           ================================================================ */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              {/* Loading Indicator */}
              <div className="mb-xl text-center flex flex-col items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
                    style={{ boxShadow: "0 0 15px rgba(192, 193, 255, 0.3)" }}
                  />
                  <div
                    className="absolute inset-2 rounded-full border-2 border-tertiary-container/20 border-b-tertiary-container animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                      boxShadow: "0 0 10px rgba(160, 120, 255, 0.3)",
                    }}
                  />
                  <span className="material-symbols-outlined text-primary text-3xl">search</span>
                </div>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-primary pulse-text tracking-wide">
                  Researching...
                </h2>
                <p className="font-body-md text-on-surface-variant max-w-md text-center">
                  Scanning databases, analyzing scientific publications, and synthesizing findings.
                </p>
              </div>

              {/* Skeleton Bento Grid */}
              <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">
                {/* Large Skeleton Card */}
                <div className="md:col-span-8 h-64 neumorphic-raised rounded-xl p-lg flex flex-col gap-4 shimmer-wrapper">
                  <div className="w-1/3 h-6 rounded-md neumorphic-inset" />
                  <div className="flex-1 rounded-lg neumorphic-inset mt-2" />
                  <div className="w-full flex gap-3 mt-auto">
                    <div className="w-20 h-8 rounded-full neumorphic-inset" />
                    <div className="w-24 h-8 rounded-full neumorphic-inset" />
                  </div>
                </div>
                {/* Tall Skeleton Card */}
                <div className="md:col-span-4 h-64 neumorphic-raised rounded-xl p-lg flex flex-col gap-4 shimmer-wrapper">
                  <div className="w-1/2 h-6 rounded-md neumorphic-inset mb-4" />
                  <div className="w-full h-3 rounded-sm neumorphic-inset" />
                  <div className="w-[90%] h-3 rounded-sm neumorphic-inset" />
                  <div className="w-full h-3 rounded-sm neumorphic-inset" />
                  <div className="w-[75%] h-3 rounded-sm neumorphic-inset" />
                  <div className="w-full h-3 rounded-sm neumorphic-inset" />
                  <div className="mt-auto w-10 h-10 rounded-full neumorphic-inset self-end" />
                </div>
                {/* 3 Small Skeleton Cards */}
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="md:col-span-4 h-48 neumorphic-raised rounded-xl p-lg flex flex-col gap-3 shimmer-wrapper"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full neumorphic-inset" />
                      <div className="w-24 h-4 rounded-sm neumorphic-inset" />
                    </div>
                    <div className="flex-1 w-full rounded-lg neumorphic-inset opacity-50" />
                  </div>
                ))}
              </div>
            </div>

            <div className="fixed bottom-4 left-4 md:left-[312px] right-4 p-margin-mobile md:p-margin-desktop bg-gradient-to-t from-background via-background/90 to-transparent z-30 pointer-events-none rounded-b-[32px]">
              <div className="max-w-3xl mx-auto w-full neumorphic-inset rounded-2xl p-2 flex items-center gap-2 border border-outline-variant/20 opacity-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-container/5 pulse-text" />
                <div className="w-12 h-12 rounded-xl skeuomorphic-circle flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">add</span>
                </div>
                <div className="flex-1 h-12 bg-transparent text-on-surface-variant font-body-md px-4 flex items-center">
                  Generating comprehensive report...
                </div>
                <div className="w-12 h-12 rounded-xl skeuomorphic-circle flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">stop_circle</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
           ACTIVE RESEARCH STATE — Has messages
           ================================================================ */}
        {hasMessages && !loading && (
          <>
            {/* Header */}
            <header className="glass-header sticky top-0 w-full z-50 hidden md:flex justify-between items-center px-lg py-sm">
              <div className="flex items-center gap-4">
                <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px] nav-icon">
                    manage_search
                  </span>
                  {currentChat?.title || "Research"}
                </h2>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(192,193,255,0.8)]" />
              </div>
              <div className="flex items-center gap-sm">
                <button className="p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high neu-action">
                  <span className="material-symbols-outlined nav-icon">notifications</span>
                </button>
                <button className="p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high neu-action">
                  <span className="material-symbols-outlined nav-icon">share</span>
                </button>
                <button className="p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high neu-action">
                  <span className="material-symbols-outlined nav-icon">more_vert</span>
                </button>
              </div>
            </header>

            {/* Scrollable Content */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-lg pb-[160px]">
              <div className="max-w-4xl mx-auto space-y-xl">
                {currentChat?.messages.map((msg, index) => {
                  if (msg.role === "user") {
                    return (
                      <div key={index} className="flex justify-end">
                        <div className="max-w-[80%] px-lg py-md rounded-2xl rounded-tr-sm bg-surface-container-high neu-pill text-on-surface font-body-md text-body-md">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  /* Assistant message — render as research cards */
                  return (
                    <div key={index} className="space-y-lg">
                      <AssistantResponse content={msg.content} index={index} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Input */}
            <div className="absolute bottom-0 left-0 w-full p-lg glass-input-area border-t border-outline-variant/10">
              <div className="input-fade-mask" />
              <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className="relative flex items-center">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse" />
                  <div className="neu-inset bg-[#0e0e1a] rounded-full w-full flex items-center p-2 border border-outline-variant/30 relative z-10 transition-shadow duration-300 focus-within:shadow-[0_0_15px_rgba(192,193,255,0.15),inset_4px_4px_8px_rgba(0,0,0,0.6)]">
                    <span className="material-symbols-outlined text-outline ml-4">auto_awesome</span>
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                      }}
                      className="w-full bg-transparent border-none text-on-surface placeholder:text-outline-variant font-label-sm focus:ring-0 px-4 py-3 outline-none"
                      placeholder="Ask follow-up, refine search, or synthesize findings..."
                      type="text"
                    />
                    {/* Orb Button */}
                    <button
                      onClick={() => sendMessage()}
                      disabled={loading || !message.trim()}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-on-tertiary-container neu-raised flex items-center justify-center group relative overflow-hidden flex-shrink-0 border-t border-white/20 disabled:opacity-30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
                      <span className="material-symbols-outlined text-white z-10 group-hover:scale-110 transition-transform nav-icon icon-filled">
                        send
                      </span>
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-label-xs text-outline-variant font-label-xs">
                    Press{" "}
                    <kbd className="px-1 py-0.5 rounded bg-surface-container-high border border-outline-variant/50 text-outline mx-1 neu-pill">
                      Enter
                    </kbd>{" "}
                    to query AI model
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ================================================================
   ASSISTANT RESPONSE — Renders markdown as research cards
   ================================================================ */
function AssistantResponse({ content, index }: { content: string; index: number }) {
  /* Split content by ### headings to create individual cards */
  const sections = content.split(/(?=###\s)/);

  /* If content doesn't have ### headings, render as a single card */
  if (sections.length <= 1 || !content.includes("###")) {
    return (
      <article className="neu-card bg-surface-container/60 backdrop-blur-md rounded-xl p-lg relative overflow-hidden group fade-up">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="prose-tactile">
          <ReactMarkdown
            components={{
              img: ({ src, alt }) => (
                <span className="block my-4">
                  <span className="block rounded-lg overflow-hidden img-frame relative group-hover:shadow-[inset_0_0_20px_rgba(192,193,255,0.1)] transition-shadow duration-500">
                    <img
                      src={src}
                      alt={alt || "Related image"}
                      loading="lazy"
                      className="w-full max-h-[200px] object-cover rounded group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-700"
                      onError={(e) => {
                        const wrapper = (e.currentTarget as HTMLElement).closest("span.block.my-4");
                        if (wrapper) (wrapper as HTMLElement).style.display = "none";
                      }}
                    />
                  </span>
                </span>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>
    );
  }

  /* Render each section as a separate card */
  const accentColors = [
    "from-primary to-transparent",
    "from-secondary to-transparent",
    "from-tertiary to-transparent",
    "from-primary-container to-transparent",
    "from-tertiary-container to-transparent",
  ];

  return (
    <>
      {sections.map((section, i) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        return (
          <article
            key={`${index}-${i}`}
            className={`neu-card bg-surface-container/60 backdrop-blur-md rounded-xl p-lg relative overflow-hidden group fade-up stagger-${Math.min(i + 1, 5)}`}
          >
            {/* Left accent bar */}
            <div
              className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accentColors[i % accentColors.length]} opacity-50 group-hover:opacity-100 transition-opacity`}
            />

            <div className="prose-tactile">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-sm mb-md">
                      {children}
                    </h3>
                  ),
                  img: ({ src, alt }) => (
                    <span className="block my-4">
                      <span className="w-full lg:w-1/3 inline-block rounded-lg overflow-hidden img-frame relative group-hover:shadow-[inset_0_0_20px_rgba(192,193,255,0.1)] transition-shadow duration-500">
                        <img
                          src={src}
                          alt={alt || "Related image"}
                          loading="lazy"
                          className="w-full max-h-[200px] object-cover rounded opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] group-hover:-translate-y-1 group-hover:drop-shadow-2xl transition-all duration-700"
                          onError={(e) => {
                            const wrapper = (e.currentTarget as HTMLElement).closest("span.block.my-4");
                            if (wrapper) (wrapper as HTMLElement).style.display = "none";
                          }}
                        />
                      </span>
                    </span>
                  ),
                  hr: () => null, /* We use card separation instead of <hr> */
                }}
              >
                {trimmed}
              </ReactMarkdown>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex gap-4">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm text-primary hover:text-primary-container transition-colors bg-surface-container-high neu-action">
                <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                Save Insight
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm text-outline hover:text-on-surface transition-colors bg-surface-container-high neu-action">
                <span className="material-symbols-outlined text-[16px]">format_quote</span>
                Cite
              </button>
            </div>
          </article>
        );
      })}
    </>
  );
}
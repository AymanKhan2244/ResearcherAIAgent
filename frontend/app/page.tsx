"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Message = {
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const API_BASE = "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/chat`;

const SUGGESTIONS = [
  { emoji: "✨", label: "Latest AI breakthroughs 2026", query: "Latest AI breakthroughs 2026" },
  { emoji: "🌱", label: "Climate carbon capture updates", query: "Climate carbon capture research updates" },
  { emoji: "🔬", label: "Quantum computing synthesis", query: "Quantum computing synthesis latest research" },
  { emoji: "🧠", label: "Neural interface metadata", query: "Neural interface brain computer interface research 2026" },
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function isGuardrailBlock(response: string): boolean {
  // Guardrail responses typically don't have the 5-point markdown structure
  return (
    !response.includes("###") &&
    (response.toLowerCase().includes("cannot") ||
      response.toLowerCase().includes("unable") ||
      response.toLowerCase().includes("not able") ||
      response.toLowerCase().includes("off-topic") ||
      response.toLowerCase().includes("inappropriate") ||
      response.toLowerCase().includes("policy") ||
      response.toLowerCase().includes("guardrail") ||
      response.toLowerCase().includes("restricted"))
  );
}

/* ─────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────── */
function ResearchingLoader() {
  return (
    <div className="glass-card rounded-2xl p-space-md shadow-xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-space-xs pb-space-sm mb-space-sm border-b border-white/5">
        <div className="flex items-center gap-space-xs">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">science</span>
          </div>
          <div>
            <span className="font-title-md text-title-md text-primary font-semibold block">Autonomous Synthesizer</span>
            <p className="text-[10px] text-on-surface-variant">Crawling web sources · Synthesizing data...</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-container/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot"></span>
        </div>
      </div>
      {/* Skeleton lines */}
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4 rounded-full"></div>
        <div className="skeleton h-3 w-full rounded-full" style={{ animationDelay: "0.15s" }}></div>
        <div className="skeleton h-3 w-5/6 rounded-full" style={{ animationDelay: "0.3s" }}></div>
        <div className="skeleton h-3 w-2/3 rounded-full mt-3" style={{ animationDelay: "0.45s" }}></div>
        <div className="skeleton h-3 w-full rounded-full" style={{ animationDelay: "0.6s" }}></div>
        <div className="skeleton h-3 w-4/5 rounded-full" style={{ animationDelay: "0.75s" }}></div>
      </div>
      <div className="mt-space-sm flex items-center justify-between text-[11px] text-on-surface-variant/60">
        <span>Researching live web &amp; synthesizing sources...</span>
        <span className="text-secondary-fixed-dim font-mono">Stage 3/4</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ASSISTANT MESSAGE CARD
───────────────────────────────────────── */
function AssistantCard({ content, onCopy }: { content: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <article className="glass-card-elevated rounded-2xl shadow-xl animate-slide-up overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-space-xs p-space-sm px-space-md bg-surface-container-high/60 border-b border-white/5">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 agent-glow">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">science</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md text-primary font-semibold truncate">Autonomous Synthesizer</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-bold tracking-wider uppercase">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant truncate">Web Synthesis · Verified</p>
          </div>
        </div>
        <button
          aria-label="Copy synthesis"
          onClick={handleCopy}
          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? "check" : "content_copy"}
          </span>
        </button>
      </div>

      {/* Markdown content */}
      <div className="p-space-md">
        <div className="prose-research">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom image rendering
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || "Research image"}
                  className="w-full max-h-56 object-cover rounded-xl border border-white/10 my-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ),
              // Custom h3 with left border accent
              h3: ({ children }) => (
                <h3 className="flex items-start gap-2 text-base font-semibold text-primary-fixed-dim mt-5 mb-2 p-2.5 pl-3 bg-primary/5 border-l-[3px] border-primary-container rounded-r-lg font-headline-sm">
                  <span>{children}</span>
                </h3>
              ),
              // Horizontal rule
              hr: () => (
                <hr className="border-none border-t border-white/8 my-4" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE HERO
───────────────────────────────────────── */
function EmptyHero({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-gutter-sm text-center">
      {/* Glow icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary-fixed-dim/20 blur-2xl scale-150 animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center shadow-xl agent-glow">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[40px]">travel_explore</span>
        </div>
      </div>
      <h1 className="font-display-md text-display-md text-on-surface font-semibold mb-3 tracking-tight">
        What do you want to research?
      </h1>
      <p className="text-on-surface-variant text-body-lg mb-8 max-w-sm">
        Powered by AI · Web Search · Real‑time Synthesis
      </p>
      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.query}
            onClick={() => onSuggestion(s.query)}
            className="px-space-md py-2 rounded-full bg-surface-container-high/80 border border-white/8 text-on-surface-variant hover:text-on-surface hover:bg-surface-bright hover:border-white/15 transition-all text-body-sm font-medium active:scale-95"
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guardrailMsg, setGuardrailMsg] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Hydration ── */
  useEffect(() => {
    setIsClient(true);
    fetch(`${API_BASE}/chats`)
      .then((res) => res.json())
      .then((data: Chat[]) => {
        setChats(data);
        if (data.length > 0) {
          setCurrentChatId(data[0].id);
        } else {
          fetch(`${API_BASE}/chats`, { method: "POST" })
            .then((res) => res.json())
            .then((nc: Chat) => {
              setChats([nc]);
              setCurrentChatId(nc.id);
            });
        }
      })
      .catch((err) => console.error("Failed to load chats", err));
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, currentChatId, loading]);

  /* ── Auto-dismiss guardrail toast ── */
  useEffect(() => {
    if (guardrailMsg) {
      const t = setTimeout(() => setGuardrailMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [guardrailMsg]);

  /* ── Derived: current chat ── */
  const currentChat = chats.find((c) => c.id === currentChatId) ?? null;

  /* ── Actions ── */
  const handleNewChat = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/chats`, { method: "POST" });
      const nc = await res.json();
      setChats((prev) => [nc, ...prev]);
      setCurrentChatId(nc.id);
      setDrawerOpen(false);
      setMessage("");
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setDrawerOpen(false);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingChatId === id) {
      // Confirmed delete
      try {
        await fetch(`${API_BASE}/chats/${id}`, { method: "DELETE" });
        setChats((prev) => {
          const updated = prev.filter((c) => c.id !== id);
          if (currentChatId === id) {
            if (updated.length > 0) setCurrentChatId(updated[0].id);
            else {
              // Fire and forget new chat creation
              fetch(`${API_BASE}/chats`, { method: "POST" })
                .then(r => r.json())
                .then(nc => {
                  setChats([nc]);
                  setCurrentChatId(nc.id);
                });
              return [];
            }
          }
          return updated;
        });
      } catch (e) {
        console.error(e);
      }
      setDeletingChatId(null);
    } else {
      setDeletingChatId(id);
      setTimeout(() => setDeletingChatId(null), 1500);
    }
  };

  const startRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditingTitle(title);
  };

  const commitRename = async () => {
    if (!editingChatId) return;
    const targetId = editingChatId;
    const newTitle = editingTitle.trim();
    
    setEditingChatId(null);
    if (!newTitle) return;

    try {
      await fetch(`${API_BASE}/chats/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      setChats((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, title: newTitle } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuggestion = (q: string) => {
    setMessage(q);
    textareaRef.current?.focus();
  };

  /* ── Textarea auto-resize ── */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── Send message ── */
  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    // Ensure we have a current chat
    let chatId = currentChatId;
    if (!chatId || !chats.find((c) => c.id === chatId)) {
      try {
        const res = await fetch(`${API_BASE}/chats`, { method: "POST" });
        const nc = await res.json();
        setChats((prev) => [nc, ...prev]);
        chatId = nc.id;
        setCurrentChatId(chatId);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    const userMsg: Message = { role: "user", content: trimmed };

    // Auto-title from first message
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const isNew = c.messages.length === 0;
        return {
          ...c,
          title: isNew ? trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : "") : c.title,
          messages: [...c.messages, userMsg],
        };
      })
    );

    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, chat_id: chatId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: { response: string } = await res.json();
      const responseText = data.response ?? "No response received.";

      if (isGuardrailBlock(responseText)) {
        setGuardrailMsg(responseText);
        // Still add assistant message so user can see what happened
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, { role: "assistant", content: responseText }] }
              : c
          )
        );
      } else {
        const assistantMsg: Message = { role: "assistant", content: responseText };
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, messages: [...c.messages, assistantMsg] } : c
          )
        );
      }
    } catch (err) {
      const errorMsg =
        "⚠️ **Connection Error**\n\nCould not reach the research backend. Make sure the FastAPI server is running at `http://127.0.0.1:8000`.\n\n```\nuvicorn main:app --reload\n```";
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, { role: "assistant", content: errorMsg }] }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Filtered history ── */
  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* ── Ambient glow orbs ── */}
      <div
        className="glow-orb w-[400px] h-[400px] -top-32 left-1/2 -translate-x-1/2"
        style={{ background: "rgba(192, 193, 255, 0.04)" }}
      />
      <div
        className="glow-orb w-[300px] h-[300px] top-1/2 -right-24"
        style={{ background: "rgba(208, 188, 255, 0.04)" }}
      />

      {/* ── Drawer backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-container-lowest/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[84vw] max-w-[320px] z-50 flex flex-col transition-transform duration-300 ease-out shadow-[0_8px_48px_-4px_rgba(17,17,37,0.9)] glass-card-elevated ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="h-16 px-gutter-sm flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[22px]">history</span>
            <span className="font-title-md text-title-md text-on-surface font-semibold">Research History</span>
          </div>
          <button
            aria-label="Close drawer"
            onClick={() => setDrawerOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-gutter-sm py-space-sm">
          <div className="flex items-center gap-space-xs px-space-sm h-10 rounded-full bg-surface-container-highest/60 border border-white/5">
            <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prior investigations..."
              className="w-full bg-transparent text-on-surface placeholder:text-outline text-[13px] focus:outline-none"
            />
          </div>
        </div>

        {/* New Research button */}
        <div className="px-gutter-sm pb-space-sm">
          <button
            onClick={handleNewChat}
            className="w-full h-10 flex items-center justify-center gap-space-xs rounded-full bg-primary-container text-on-primary-container text-[12px] font-semibold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Research
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-gutter-sm pb-space-md space-y-1">
          {filteredChats.length === 0 && (
            <p className="text-center text-outline text-[12px] py-8">No sessions found</p>
          )}
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`group flex items-center gap-space-xs p-space-sm rounded-xl cursor-pointer transition-all ${
                chat.id === currentChatId
                  ? "bg-surface-container-high border border-white/8"
                  : "hover:bg-surface-container-high/50"
              }`}
            >
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">
                {chat.messages.length === 0 ? "add_circle" : "neurology"}
              </span>

              {editingChatId === chat.id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => e.key === "Enter" && commitRename()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-surface-container-highest text-on-surface text-[13px] rounded px-2 py-0.5 focus:outline-none border border-primary-container"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface text-[13px] truncate font-medium">{chat.title}</p>
                  <p className="text-outline text-[10px]">
                    {chat.messages.length} message{chat.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  aria-label="Rename"
                  onClick={(e) => startRename(chat.id, chat.title, e)}
                  className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
                <button
                  aria-label="Delete"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    deletingChatId === chat.id
                      ? "text-error bg-error-container/20"
                      : "text-on-surface-variant hover:text-error"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer status */}
        <div className="px-gutter-sm py-space-sm border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></div>
            <span className="text-[11px] text-on-surface-variant">Agent Cluster Active</span>
          </div>
          <span className="material-symbols-outlined text-outline text-[18px]">dns</span>
        </div>
      </aside>

      {/* ── Top header ── */}
      <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-xs">
          {/* Left: menu + title */}
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Open history drawer"
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[22px]">science</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight hidden sm:block">
                Research AI
              </span>
            </div>
          </div>

          {/* Right: new research + avatar */}
          <div className="flex items-center gap-space-xs">
            {/* Session status chip */}
            {currentChat && currentChat.messages.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/8 text-[11px] text-on-surface-variant">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></div>
                Session Active
              </div>
            )}
            <button
              onClick={handleNewChat}
              className="h-9 px-space-md flex items-center gap-space-xs rounded-full bg-primary-container text-on-primary-container text-[12px] font-semibold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">New Research</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary-container text-[16px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Guardrail toast ── */}
      {guardrailMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md animate-slide-down">
          <div className="bg-error-container text-on-error-container rounded-xl p-space-sm shadow-2xl flex items-center justify-between gap-space-xs border border-error/20">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0">warning</span>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-error tracking-tight">Guardrail Active</p>
                <p className="text-[11px] text-on-error-container/80 line-clamp-2">{guardrailMsg}</p>
              </div>
            </div>
            <button
              aria-label="Dismiss"
              onClick={() => setGuardrailMsg(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-error/20 text-on-error-container transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Messages feed */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-gutter-sm pt-space-md pb-6"
          style={{ maxHeight: "calc(100vh - 64px - 140px)" }}
        >
          {isClient && currentChat ? (
            currentChat.messages.length === 0 ? (
              <EmptyHero onSuggestion={handleSuggestion} />
            ) : (
              <div className="space-y-space-md max-w-2xl mx-auto pb-4">
                {currentChat.messages.map((msg, i) =>
                  msg.role === "user" ? (
                    /* User bubble */
                    <div key={i} className="flex justify-end animate-slide-up">
                      <div className="max-w-[88%] bg-surface-container-highest text-on-surface rounded-2xl rounded-tr-sm p-space-md shadow-md border border-white/5">
                        <div className="flex items-center justify-between gap-space-xs mb-1">
                          <span className="text-[10px] text-secondary-fixed-dim uppercase tracking-wider font-bold">
                            Lead Investigator
                          </span>
                        </div>
                        <p className="text-body-md font-body-md leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className="mt-2 flex items-center justify-end gap-1">
                          <span className="material-symbols-outlined text-secondary-fixed-dim text-[13px]">done_all</span>
                          <span className="text-[10px] text-on-surface-variant">Routed to crawlers</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant card */
                    <AssistantCard
                      key={i}
                      content={msg.content}
                      onCopy={() => {}}
                    />
                  )
                )}

                {/* Loading skeleton */}
                {loading && <ResearchingLoader />}
              </div>
            )
          ) : (
            !isClient && <div className="flex items-center justify-center min-h-[50vh]">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-primary typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-primary typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className="sticky bottom-0 z-20 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-4 pb-4 px-gutter-sm">
          {/* Suggestion chips when chat has messages */}
          {currentChat && currentChat.messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-2">
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s.query}
                  onClick={() => handleSuggestion(s.query)}
                  className="shrink-0 px-space-md py-1.5 rounded-full bg-surface-container-high/90 border border-white/8 text-on-surface-variant hover:text-primary hover:bg-surface-bright font-medium text-[11px] transition-all active:scale-95"
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input container */}
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl bg-surface-container-high border border-white/8 p-space-xs shadow-2xl input-glow transition-all">
              <div className="flex items-end gap-space-xs">
                {/* Attach button */}
                <button
                  aria-label="Attach file"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  id="research-prompt-input"
                  rows={1}
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything to research across the web..."
                  disabled={loading}
                  className="w-full bg-transparent text-on-surface placeholder:text-outline text-body-md py-2.5 px-1 focus:outline-none resize-none max-h-28 leading-relaxed disabled:opacity-50"
                />

                {/* Right actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Web crawl toggle */}
                  <button
                    aria-label="Web crawl mode"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">travel_explore</span>
                  </button>

                  {/* Send button */}
                  <button
                    id="send-query-btn"
                    aria-label="Submit research query"
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className={`h-10 px-space-md flex items-center justify-center gap-1 rounded-xl text-[12px] font-bold transition-all shadow-md ${
                      message.trim() && !loading
                        ? "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary active:scale-95 cursor-pointer"
                        : "bg-surface-container-highest text-outline cursor-not-allowed opacity-50"
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-current typing-dot"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-current typing-dot"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-current typing-dot"></span>
                      </>
                    ) : (
                      <>
                        <span>Investigate</span>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-on-surface-variant/50">
                <span>Crawl: Semantic Scholar · ArXiv · Web</span>
                <span>Shift+Enter for newline</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

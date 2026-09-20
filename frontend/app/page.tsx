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
    <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low/60 backdrop-blur-xl p-space-lg shadow-xl mb-4">
      {/* Neon Laser Scan Indicator */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_2s_infinite] shadow-[0_0_12px_#c0c1ff]"></div>
      
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-space-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
            </span>
            <span className="font-title-md text-title-md text-primary font-semibold">
              Synthesizing deep web telemetry & verifying sources...
            </span>
          </div>
          <span className="font-label-md text-label-md text-secondary font-mono">Stage 3 of 4</span>
        </div>
        
        {/* Shimmering Skeleton Lines */}
        <div className="flex flex-col gap-3 py-1">
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container animate-pulse"></div>
          <div className="w-4/5 h-3 rounded-full bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2/3 h-3 rounded-full bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container animate-pulse" style={{ animationDelay: "300ms" }}></div>
        </div>
        
        <div className="flex flex-wrap items-center gap-space-md text-outline font-label-sm text-label-sm mt-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span> Extracting Context
          </span>
          <span className="flex items-center gap-1 text-primary animate-pulse">
            <span className="material-symbols-outlined text-[14px]">sync</span> Parsing Cross-citations
          </span>
        </div>
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
    <div className="flex flex-col gap-space-md w-full animate-slide-up mb-6">
      <div className="relative rounded-2xl bg-surface-container/80 backdrop-blur-2xl shadow-2xl p-space-lg md:p-8 flex flex-col gap-space-lg border border-white/5">
        
        {/* Agent Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md bg-surface-container-low/40 rounded-xl px-space-md py-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined text-on-primary text-[20px]">science</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-title-md text-title-md text-primary font-semibold">Autonomous Synthesizer Node 7</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-sm text-label-sm uppercase tracking-wider">Verified Run</span>
              </div>
              <span className="font-body-sm text-body-sm text-outline">Cross-referenced against web repositories & live data</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-bright/50 text-on-surface hover:text-primary transition-all font-label-md text-label-md" 
              title="Copy Raw Markdown" 
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? "check" : "content_copy"}
              </span>
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-bright/50 text-on-surface hover:text-primary transition-all font-label-md text-label-md" type="button">
              <span className="material-symbols-outlined text-[16px]">ios_share</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Markdown content */}
        <div className="prose-research">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || "Research image"}
                  className="w-full max-h-64 object-cover rounded-xl border border-white/10 my-4 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ),
              h2: ({ children }) => (
                <div className="flex items-center gap-2 mt-6 mb-3">
                  <span className="text-xl">🔬</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold m-0">{children}</h2>
                </div>
              ),
              h3: ({ children }) => (
                <h3 className="flex items-center gap-2 text-base font-semibold text-primary-fixed-dim mt-5 mb-2 p-2.5 pl-3 bg-primary/5 border-l-[3px] border-primary-container rounded-r-lg font-headline-sm">
                  <span>{children}</span>
                </h3>
              ),
              pre: ({ children }) => (
                <div className="rounded-xl bg-surface-container-lowest shadow-2xl overflow-hidden my-4 border border-white/5">
                  <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low/90 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-error-container/90"></div>
                        <div className="w-3 h-3 rounded-full bg-tertiary-container/80"></div>
                        <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant ml-2 font-mono">snippet</span>
                    </div>
                  </div>
                  <div className="p-space-md overflow-x-auto text-[13px] font-mono leading-relaxed bg-surface-container-lowest text-on-surface">
                    {children}
                  </div>
                </div>
              ),
              code: ({ className, children }) => {
                if (className) return <code className={className}>{children}</code>;
                return <code className="bg-surface-container-highest/60 text-secondary-fixed px-1.5 py-0.5 rounded-md font-mono text-[13px]">{children}</code>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE HERO
───────────────────────────────────────── */
function EmptyHero({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-gutter-sm text-center relative z-10">
      {/* Glow icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary-container/20 blur-2xl scale-150 animate-[pulse_3s_ease-in-out_infinite]"></div>
        <div className="relative w-24 h-24 rounded-3xl bg-surface-container-high border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl">
          <span className="material-symbols-outlined text-primary text-[48px]">travel_explore</span>
        </div>
      </div>
      <h1 className="font-display-md text-display-md font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary">
        What do you want to research?
      </h1>
      <p className="text-on-surface-variant font-body-lg text-body-lg mb-10 max-w-md mx-auto">
        Deep web synthesis, real-time autonomous crawling, and multi-node correlation.
      </p>
      
      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.query}
            onClick={() => onSuggestion(s.query)}
            className="px-space-md py-2.5 rounded-full bg-surface-container-high/80 backdrop-blur-md border border-white/5 text-on-surface-variant hover:text-primary hover:bg-surface-bright hover:border-white/10 transition-all font-label-md text-label-md shadow-md hover:shadow-lg active:scale-95"
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
    <div className="bg-background font-body-md text-on-surface relative min-h-screen selection:bg-primary-container selection:text-on-primary-container flex">
      
      {/* ── Ambient glow orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] rounded-full bg-secondary-container/20 blur-[130px]"></div>
        <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-tertiary-container/10 blur-[140px]"></div>
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-surface-container/40 blur-[120px]"></div>
      </div>

      {/* ── Drawer backdrop (Mobile) ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-container-lowest/80 backdrop-blur-sm xl:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-surface-bright/40 z-50 flex flex-col justify-between shadow-[0_8px_32px_rgba(12,12,32,0.8)] transition-transform duration-300 ease-out xl:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-bright/20">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight">ResearchAI</span>
            </div>
            <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-secondary border border-outline-variant/40 uppercase">v2.4 Pro</span>
          </div>
          
          <div className="p-space-md">
            <button
              onClick={() => { handleNewChat(); setDrawerOpen(false); }}
              className="w-full flex items-center justify-center gap-space-sm py-space-sm px-space-md rounded-xl bg-gradient-to-r from-primary-container/20 via-tertiary-container/20 to-secondary-container/20 border border-primary-container/50 text-primary font-title-md text-title-md shadow-[0_0_20px_rgba(192,193,255,0.2)] hover:border-primary hover:shadow-[0_0_25px_rgba(192,193,255,0.35)] transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
              <span>New Research</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-space-md space-y-space-md">
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between px-space-xs py-space-xs">
                <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">Recent Investigations</span>
                <span className="material-symbols-outlined text-outline text-[16px]">history</span>
              </div>
              <nav className="space-y-space-xs">
                {filteredChats.length === 0 && (
                  <p className="text-center text-outline text-[12px] py-4">No sessions found</p>
                )}
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => { handleSelectChat(chat.id); setDrawerOpen(false); }}
                    className={`group flex items-center justify-between px-space-sm py-space-sm rounded-lg transition-colors cursor-pointer ${
                      chat.id === currentChatId
                        ? "bg-surface-container-high text-primary font-title-md"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-space-sm truncate flex-1 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${chat.id === currentChatId ? 'bg-primary-container shadow-[0_0_8px_#c0c1ff]' : 'bg-surface-bright'}`}></span>
                      {editingChatId === chat.id ? (
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => e.key === "Enter" && commitRename()}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-surface-container-highest text-on-surface text-body-md rounded px-1 py-0.5 focus:outline-none min-w-0"
                        />
                      ) : (
                        <span className="font-body-md text-body-md truncate">{chat.title}</span>
                      )}
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => startRename(chat.id, chat.title, e)}
                        className="p-0.5 text-outline hover:text-on-surface"
                        title="Rename"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-0.5 text-outline hover:text-error"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
        
        <div className="p-space-md border-t border-surface-bright/30 space-y-space-md bg-surface-container-lowest/50">
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary-container border-2 border-surface-container-lowest"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm font-title-md text-on-surface truncate">Lead Investigator</span>
                <span className="font-label-sm text-label-sm text-outline truncate">Session Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Layout Workspace ── */}
      <div className="xl:pl-72 flex-1 flex flex-col min-h-screen relative w-full">
        <header className="fixed top-0 xl:left-72 left-0 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-bright/40 z-40 flex items-center justify-between px-space-md xl:px-space-lg shadow-[0_4px_24px_rgba(12,12,32,0.4)]">
          <div className="flex items-center gap-space-md flex-1 max-w-xl">
            <button
              onClick={() => setDrawerOpen(true)}
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <button className="flex items-center justify-between w-full max-w-md px-space-md py-1.5 rounded-full bg-surface-container/60 border border-surface-bright text-on-surface-variant hover:border-primary-container/40 hover:text-on-surface transition-all" type="button">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px] text-outline">search</span>
                <span className="font-body-sm text-body-sm text-outline">Quick jump to node, paper, or query...</span>
              </div>
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-surface-variant font-label-sm text-label-sm text-secondary border border-outline-variant/50">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-space-md shrink-0">
            {currentChat && currentChat.messages.length > 0 && (
              <div className="hidden lg:flex items-center gap-space-sm px-space-sm py-1 rounded-full bg-secondary-container/20 border border-secondary-container/40">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-md text-label-md text-secondary">Node Alpha-7 · Crawl Active</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-low border border-surface-bright/50">
              <span className="font-label-sm text-label-sm text-outline">Depth:</span>
              <span className="px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-primary-container text-on-primary-container font-title-md">L3 Deep</span>
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
                onClick={() => setGuardrailMsg(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-error/20 text-on-error-container transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        )}

        <main className="relative pt-16 flex-1 w-full px-space-md sm:px-space-lg bg-surface/20 z-10">
          <div className="flex flex-col w-full h-[calc(100vh-64px)] relative">
            
            {/* Ambient Glow Canvas Accents */}
            <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute top-1/2 right-12 w-[32rem] h-[32rem] bg-secondary-container/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
            
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto pb-32 pt-space-lg no-scrollbar"
            >
              {isClient && currentChat ? (
                currentChat.messages.length === 0 ? (
                  <EmptyHero onSuggestion={handleSuggestion} />
                ) : (
                  <div className="flex flex-col gap-space-xl w-full max-w-6xl mx-auto">
                    {/* Header title for active chat */}
                    <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-space-md py-space-md mb-space-sm">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center gap-2 text-outline">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Investigations</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Session #{currentChat.id.substring(0,6).toUpperCase()}</span>
                        </div>
                        <h1 className="font-headline-md text-headline-md text-primary tracking-tight">{currentChat.title}</h1>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-full bg-surface-container-low/80 backdrop-blur-md shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface">14 Crawlers Active</span>
                        </div>
                      </div>
                    </div>

                    {currentChat.messages.map((msg, i) =>
                      msg.role === "user" ? (
                        /* User Query Row */
                        <div key={i} className="flex justify-end w-full pl-8 md:pl-24 animate-slide-up mb-6">
                          <div className="relative max-w-2xl group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-container/30 to-tertiary-container/30 rounded-2xl blur-sm group-hover:blur opacity-75 transition duration-500"></div>
                            <div className="relative flex flex-col gap-space-xs p-space-lg rounded-2xl bg-surface-container-high/90 backdrop-blur-xl shadow-xl">
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">psychology</span> Lead Query
                                </span>
                              </div>
                              <p className="font-body-lg text-body-lg text-on-background leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <AssistantCard
                          key={i}
                          content={msg.content}
                          onCopy={() => {}}
                        />
                      )
                    )}

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

            {/* ── Sticky Bottom Command Bar Overlay ── */}
            <div className="absolute bottom-4 left-0 right-0 px-space-md sm:px-space-lg pointer-events-none z-40 flex flex-col items-center">
              <div className="w-full max-w-4xl pointer-events-auto flex flex-col gap-space-xs">
                
                {/* Main Input Capsule */}
                <div className="relative w-full rounded-2xl bg-surface-container-high/90 backdrop-blur-2xl shadow-2xl p-space-sm flex flex-col gap-2 border border-white/5 transition-all hover:border-white/10 focus-within:border-primary-container/50">
                  <div className="flex items-end gap-space-sm px-space-xs">
                    <button className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-lowest transition-colors mb-1" title="Attach Document / Dataset" type="button">
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                    
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={message}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Direct your next inquiry, request simulation code, or query cross-citations..."
                      disabled={loading}
                      className="flex-1 bg-transparent text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none py-2 resize-none max-h-32 disabled:opacity-50"
                    />
                    
                    <div className="flex items-center gap-space-xs mb-1">
                      {/* Deep Web Toggle */}
                      <button className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary-container/40 text-secondary hover:bg-secondary-container/60 transition-all font-label-sm text-label-sm" type="button">
                        <span className="material-symbols-outlined text-[15px]">radar</span>
                        <span className="hidden md:inline">Deep Web</span>
                      </button>
                      
                      {/* Send Button */}
                      <button
                        onClick={handleSend}
                        disabled={!message.trim() || loading}
                        className={`flex items-center gap-1.5 px-space-md py-2 rounded-xl font-title-md text-title-md transition-all ${
                          message.trim() && !loading
                            ? "bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(192,193,255,0.45)] cursor-pointer active:scale-95"
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
                            <span className="hidden sm:inline">Investigate</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

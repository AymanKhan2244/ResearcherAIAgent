"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setIsClient(true);
    const savedChats = localStorage.getItem("researcher_ai_chats");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
        } else {
          createNewChat();
        }
      } catch (e) {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("researcher_ai_chats", JSON.stringify(chats));
    }
  }, [chats, isClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, currentChatId, loading]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          role: "assistant",
          content:
            "Hello. I am your Researcher AI agent. How can I assist you today?",
        },
      ],
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
        if (updated.length === 0) {
          setTimeout(createNewChat, 0);
        }
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

  const sendMessage = async () => {
    if (!message.trim() || !currentChatId || loading) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const currentMessage = message;
    setMessage("");
    setLoading(true);

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const isFirstUserMessage = !chat.messages.some((m) => m.role === "user");
          return {
            ...chat,
            title: isFirstUserMessage ? currentMessage.slice(0, 30) + (currentMessage.length > 30 ? "..." : "") : chat.title,
            messages: [...chat.messages, userMessage],
          };
        }
        return chat;
      })
    );

    try {
      const response = await fetch("https://researcheraiagent-1.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, botMessage] }
            : chat
        )
      );
    } catch (error) {
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

  return (
    <div className="h-screen w-full bg-[#0F0F11] text-gray-100 flex overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <div className="w-[280px] bg-[#151518] border-r border-white/5 flex flex-col shrink-0 transition-all">
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Chat
            </span>
            <span className="text-xs text-gray-500 font-mono border border-gray-700/50 rounded px-1.5 py-0.5">⌘K</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="px-2 pb-2 text-xs font-semibold text-gray-500 tracking-wider">HISTORY</div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                currentChatId === chat.id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex-1 flex items-center pr-2">
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
                    className="w-full bg-[#1A1A1E] text-white px-2 py-1 rounded border border-blue-500/50 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <>
                  <div className="truncate font-medium flex-1">
                    {chat.title}
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 gap-1">
                    <button
                      onClick={(e) => startEditing(chat, e)}
                      className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                      aria-label="Rename chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                      aria-label="Delete chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* User profile area mockup */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-semibold text-sm">
             R
           </div>
           <div className="flex-1">
             <div className="text-sm font-medium">Researcher</div>
             <div className="text-xs text-gray-500">Pro Plan</div>
           </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#0F0F11] relative">
        
        {/* HEADER */}
        <div className="h-14 flex items-center px-6 border-b border-white/5 shrink-0 bg-[#0F0F11]/80 backdrop-blur-md absolute top-0 w-full z-10">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
             </div>
            <h1 className="text-sm font-medium text-gray-200">
              Researcher AI Agent
            </h1>
          </div>
        </div>

        {/* CHAT MESSAGES */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 pt-24 md:p-8 md:pt-24 space-y-8 scroll-smooth custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-10">
            {currentChat?.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-sm ${msg.role === "user" ? "bg-[#25252D] text-gray-200 border border-white/10" : "bg-gradient-to-b from-blue-500 to-blue-600 text-white"}`}>
                  {msg.role === "user" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                  )}
                </div>

                <div
                  className={`
                    max-w-[85%] text-[15px] leading-relaxed
                    ${msg.role === "user"
                      ? "px-5 py-3.5 bg-[#25252D] text-gray-100 rounded-2xl rounded-tr-sm border border-white/5"
                      : "text-gray-200 py-1"
                    }
                  `}
                >
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#151518] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none break-words prose-img:rounded-xl prose-img:border prose-img:border-white/10">
                    <ReactMarkdown
                      components={{
                        img: ({ src, alt, ...props }) => {
                          return (
                            <span className="block my-4">
                              <a href={src} target="_blank" rel="noopener noreferrer" className="block no-underline">
                                <span className="relative block overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1E] group">
                                  <img
                                    src={src}
                                    alt={alt || "Related image"}
                                    loading="lazy"
                                    className="w-full max-h-[300px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02] !my-0 !border-0"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      const wrapper = target.closest('span.block.my-4');
                                      if (wrapper) (wrapper as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end p-3">
                                    <span className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                      Open image
                                    </span>
                                  </span>
                                </span>
                              </a>
                              {alt && alt !== "Related Image" && alt !== "Related image" && (
                                <span className="block text-xs text-gray-500 mt-2 text-center italic">{alt}</span>
                              )}
                            </span>
                          );
                        },
                      }}
                    >{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* LOADING */}
            {loading && (
              <div className="flex gap-5 flex-row">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                </div>
                <div className="py-2.5 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT */}
        <div className="p-4 md:p-6 shrink-0 bg-gradient-to-t from-[#0F0F11] via-[#0F0F11] to-transparent">
          <div className="max-w-3xl mx-auto relative shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-xl"></div>
            <div className="relative flex items-center bg-[#1A1A1E] border border-white/10 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 rounded-full transition-all pr-2 pl-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask Researcher AI..."
                className="w-full bg-transparent pl-5 pr-14 py-3.5 outline-none text-white text-[15px] placeholder:text-gray-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:bg-[#333] disabled:text-white flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
             <p className="text-[11px] text-gray-500 font-medium tracking-wide">AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFORMATION.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {

  const [message, setMessage] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello 👋 I am your AI assistant. Ask me anything about AI, coding, machine learning, or frontend development.",
    },
  ]);

  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = message;

    setMessage("");

    setLoading(true);

    try {

      const response = await fetch("http://127.0.0.1:8000/chat", {
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

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Backend connection failed",
        },
      ]);

    }

    setLoading(false);
  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-[#17002e] via-[#32004f] to-[#051937] flex items-center justify-center p-6">

      <div className="w-full max-w-7xl h-[92vh] rounded-[50px] overflow-hidden border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl flex flex-col">

        {/* HEADER */}

        <div className="h-32 px-10 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl">

          <div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Reasearcher AI Agent
            </h1>

            <p className="text-gray-300 mt-2 text-xl">
              
            </p>

          </div>


          <div className="flex gap-4">

            

           

          </div>

        </div>



        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto px-15 py-10 space-y-10">

          {
            messages.map((msg, index) => (

              <div
                key={index}
                className={`flex gap-6 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >

                {
                  msg.role === "assistant" && (

                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg">
                      AI
                    </div>

                  )
                }



                <div
                  className={`
                    max-w-5xl rounded-[35px] px-8 py-7 text-2xl leading-[50px]
                    backdrop-blur-xl border border-white/10 shadow-xl
                    ${msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600"
                      : "bg-white/10"
                    }
                  `}
                >

                  <div className="prose prose-invert max-w-none text-white break-words">

                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>

                  </div>

                </div>

              </div>

            ))
          }



         

          {/* LOADING */}

          {
            loading && (

              <div className="flex gap-6">

                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg">
                  AI
                </div>

                <div className="bg-white/10 border border-white/10 rounded-[35px] px-10 py-8 flex items-center gap-4">

                  <div className="h-4 w-4 rounded-full bg-cyan-400 animate-bounce"></div>
                  <div className="h-4 w-4 rounded-full bg-purple-400 animate-bounce delay-100"></div>
                  <div className="h-4 w-4 rounded-full bg-cyan-400 animate-bounce delay-200"></div>

                </div>

              </div>
            )
          }

        </div>



        {/* INPUT */}

        <div className="p-8 border-t border-white/10 bg-white/5 backdrop-blur-xl">

          <div className="flex items-center gap-6 bg-black/20 rounded-[30px] p-5 border border-white/10">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-white text-2xl px-4 placeholder:text-gray-400"
            />


            <button
              onClick={sendMessage}
              className="px-10 py-5 rounded-[25px] bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition-all text-white text-2xl font-semibold shadow-xl"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
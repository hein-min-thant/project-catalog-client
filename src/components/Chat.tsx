// ChatApp.tsx
import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { Icon } from "@iconify/react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ChatAppProps {
  projectContent: string;
  onClose: () => void;
}

const ChatApp: React.FC<ChatAppProps> = ({
  projectContent,
  onClose,
}: ChatAppProps) => {
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modelId, setModelId] = useState("meta-llama/llama-4-maverick:free");
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const endpoint = "http://localhost:8080/generate";

  useEffect(() => {
    if (projectContent && conversationHistory.length === 0) {
      const systemMessage = {
        role: "user" as const,
        content: `You are an AI assistant. Your Purpose: The following is project content you must use as context to assist user and respond to what they ask:\n\n${projectContent}\n\nIgnore html tags if they are not in code blocks. Always respond with context awareness.`,
      };

      setConversationHistory([systemMessage]);
    }
  }, [projectContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { role: "user" as const, content: userInput };
    const newHistory = [...conversationHistory, userMessage];

    setConversationHistory(newHistory);
    setUserInput("");
    setIsTyping(true);

    try {
      const payload = {
        messages: newHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        modelId: modelId.trim() || "deepseek/deepseek-chat-v3-0324:free",
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const aiResponseText = await response.text();

      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: aiResponseText },
      ]);
    } catch (error) {
      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please try again.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationHistory]);

  return (
    <div className="flex flex-col md:h-[calc(100vh-64px)]  bg-card/60 backdrop-blur-md">
      <header>
        <div className="shrink-0 bg-card/60 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-cyan-500">Project Assistant</h3>
          <button
            className="rounded-full p-2 hover:bg-cyan-500/20 transition"
            onClick={onClose}
          >
            <Icon className="text-xl" icon="mdi:close" />
          </button>
        </div>
        <p className="text-xs text-warning-600 px-4 py-2 bg-warning-100 backdrop-blur-3xl opacity-75">
          Please note that replies may be slow or temporarily unavailable due to
          high traffic for some models!{" "}
        </p>
      </header>
      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
        {conversationHistory.slice(1).map((msg, idx) => (
          <div
            key={idx + 1}
            className={`flex items-start gap-2 max-w-[90%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`px-3 py-2 rounded-xl text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-cyan-500 text-white rounded-br-none"
                  : "bg-card border border-border text-foreground rounded-bl-none"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(msg.content),
                  }}
                  className="prose dark:prose-invert prose-sm"
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Icon icon="mdi:clock" />
            AI is thinking…
          </div>
        )}
        <div ref={conversationEndRef} />
      </main>

      {/* Footer */}
      <footer className="shrink-0 bg-card/60 backdrop-blur-md border-t border-border px-4 py-3 space-y-3">
        {/* Message form */}
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            required
            className="flex-1"
            placeholder="Type your message…"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button
            className="p-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition"
            type="submit"
          >
            <Icon className="text-lg" icon="mdi:send" />
          </button>
        </form>

        {/* Model selector (original Select kept) */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Model:</Label>
          <Select value={modelId} onValueChange={setModelId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-3xl">
              <SelectItem value="meta-llama/llama-4-maverick:free">
                Meta LLMA 4 Maverick{" "}
                <Badge className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                  Fastest
                </Badge>
              </SelectItem>
              <SelectItem value="qwen/qwen3-coder:free">
                Qwen Coder{" "}
                <Badge className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                  Coding
                </Badge>
              </SelectItem>
              <SelectItem value="deepseek/deepseek-r1-0528:free">
                DeepSeek R1{" "}
                <Badge className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                  Reasoning
                </Badge>
              </SelectItem>
              <SelectItem value="deepseek/deepseek-chat-v3-0324:free">
                DeepSeek Chat{" "}
                <Badge className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                  Greneral
                </Badge>
              </SelectItem>
              <SelectItem value="google/gemini-2.0-flash-exp:free">
                Gemini 2.0 Flash
              </SelectItem>
              <SelectItem value="tngtech/deepseek-r1t2-chimera:free">
                DeepSeek R1T2 Chimera
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </footer>
    </div>
  );
};

export default ChatApp;

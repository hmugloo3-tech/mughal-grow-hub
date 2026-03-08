import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Leaf, Trash2, Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Msg {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farm-chat`;

const quickCategories = [
  {
    emoji: "🍎",
    label: "Apple Care",
    questions: [
      "Best spray schedule for apple scab?",
      "When to apply calcium spray on apples?",
      "How to control woolly aphid?",
    ],
  },
  {
    emoji: "🌾",
    label: "Rice & Paddy",
    questions: [
      "Best fertilizer dose for rice?",
      "How to control rice blast disease?",
      "When to transplant rice in Kashmir?",
    ],
  },
  {
    emoji: "🌸",
    label: "Saffron",
    questions: [
      "Saffron planting tips for Kashmir",
      "How to prevent saffron corm rot?",
      "Best fertilizer for saffron?",
    ],
  },
  {
    emoji: "🥬",
    label: "Vegetables",
    questions: [
      "How to control tomato blight?",
      "Best seeds for this season?",
      "Organic pest control methods",
    ],
  },
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim(), timestamp: new Date() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setSelectedCategory(null);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar, timestamp: new Date() }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar, timestamp: new Date() }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${e.message || "Something went wrong. Please try again."}`, timestamp: new Date() }]);
    }

    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Floating Toggle */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-28 lg:bottom-24 right-4 lg:right-6 z-40 group"
            aria-label="Open AI Chat"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
              <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-3.5 lg:p-4 rounded-full shadow-xl shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-110 active:scale-95 transition-all">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 lg:bottom-24 right-2 sm:right-4 lg:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[400px] h-[65vh] lg:h-[70vh] max-h-[600px] flex flex-col rounded-2xl border border-border/50 shadow-2xl shadow-primary/10 overflow-hidden bg-background"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground px-4 py-3.5 flex items-center justify-between shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Mughal Agri Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-[11px] text-primary-foreground/70">AI-powered farming advisor</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                {messages.length > 0 && (
                  <button onClick={clearChat} className="p-2 rounded-lg hover:bg-primary-foreground/15 transition-colors" title="Clear chat">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-primary-foreground/15 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-2">
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-3">
                      <Bot className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground text-base">Assalamu Alaikum! 🌾</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">I'm your AI farming advisor. Ask me about crops, pesticides, fertilizers, or any agricultural question!</p>
                  </div>

                  {/* Category chips */}
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {quickCategories.map((cat, i) => (
                      <button key={i} onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                          selectedCategory === i
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-accent text-accent-foreground hover:bg-accent/80"
                        }`}>
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Questions for selected category */}
                  <AnimatePresence mode="wait">
                    {selectedCategory !== null && (
                      <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        {quickCategories[selectedCategory].questions.map((q) => (
                          <button key={q} onClick={() => sendMessage(q)}
                            className="block w-full text-left text-xs bg-accent/60 hover:bg-primary/10 text-foreground px-3.5 py-2.5 rounded-xl transition-all border border-transparent hover:border-primary/20">
                            💬 {q}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedCategory === null && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider font-semibold mb-2">Popular Questions</p>
                      {["Which fertilizer is best for apple trees?", "How to control pests in rice?", "Saffron planting tips", "Best seeds for this season"].map(q => (
                        <button key={q} onClick={() => sendMessage(q)}
                          className="block w-full text-left text-xs bg-accent/60 hover:bg-primary/10 text-foreground px-3.5 py-2.5 rounded-xl transition-all border border-transparent hover:border-primary/20">
                          💬 {q}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-br-md shadow-sm"
                      : "bg-accent/70 text-foreground rounded-bl-md border border-border/30"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-xs [&>h3]:font-bold [&>li]:text-xs [&_code]:text-xs [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:rounded">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-3.5 w-3.5 text-secondary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-accent/70 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scroll to bottom button */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="sticky bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10">
                    <ArrowDown className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 shrink-0 bg-background/80 backdrop-blur-sm">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about crops, fertilizers, pests..."
                  className="flex-1 bg-accent/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                  maxLength={500}
                  disabled={isLoading}
                />
                <Button type="submit" size="sm" disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3.5 rounded-xl h-10 w-10 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[9px] text-muted-foreground text-center mt-1.5">Powered by AI • For expert advice, call <a href="tel:+916006561732" className="text-primary hover:underline">6006561732</a></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

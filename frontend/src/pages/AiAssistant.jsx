import { useState } from "react";
import { Bot, Send, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { askAiChatbot } from "../api/api";

function AiAssistant() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text:
        "👋 Hello! Welcome to the IDS Help Desk AI Assistant.\n\nI can help with tickets, priorities, statuses, attachments, reports, login issues, network issues, and troubleshooting.\n\nHow can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;

    const userMessage = message;

    setChat((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");

    try {
      setLoading(true);

      const response = await askAiChatbot({
        message: userMessage,
      });

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI chatbot failed:", error);

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I could not process that right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask for help with tickets, priorities, statuses, and troubleshooting.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Bot className="w-5 h-5" />
          </div>

          <div>
            <h2 className="font-semibold">Help Desk AI</h2>
            <p className="text-sm text-muted-foreground">
              Rule-based assistant for Assignment 6
            </p>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-accent/20">
          {chat.map((item, index) => (
            <div
              key={index}
              className={
                "flex " +
                (item.role === "user" ? "justify-end" : "justify-start")
              }
            >
              <div
                className={
                  "max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-line " +
                  (item.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground")
                }
              >
                {item.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something like: How do I handle a login issue?"
              rows={2}
              className="flex-1 px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
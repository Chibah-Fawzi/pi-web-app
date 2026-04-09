import type { Metadata } from "next";
import { ChatPageClient } from "@/components/llm/chat-page-client";

export const metadata: Metadata = {
  title: "LLM Chat",
  description: "Chat through pi-chat → Ollama",
};

export default function ChatPage() {
  return (
    <div className="from-background to-muted/30 min-h-[calc(100vh-5rem)] bg-gradient-to-b">
      <ChatPageClient />
    </div>
  );
}

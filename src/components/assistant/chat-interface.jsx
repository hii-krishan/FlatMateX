"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aiRoomAssistantChat } from "@/ai/flows/ai-room-assistant-chat";
const examplePrompts = [
  "Remind me to pay rent tomorrow",
  "Create a to-do list for cleaning the flat",
  "What were my total expenses on food last week?",
  "Give me a motivational quote for studying"
];
function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Room Assistant. How can I help you manage your flat today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = async (prompt) => {
    const messageText = prompt || input;
    if (messageText.trim() === "") return;
    const userMessage = { id: Date.now(), text: messageText, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const result = await aiRoomAssistantChat({ message: messageText });
      const aiMessage = { id: Date.now() + 1, text: result.response, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage = { id: Date.now() + 1, text: "Sorry, I encountered an error. Please try again.", isUser: false };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "h-[calc(100vh-10rem)] flex flex-col", children: /* @__PURE__ */ jsx(Card, { className: "flex-1 flex flex-col", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex-1 flex flex-col p-0", children: [
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 p-4 lg:p-6", viewportRef: scrollAreaRef, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      messages.map((msg, index) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-4 ${msg.isUser ? "justify-end" : ""}`, children: [
        !msg.isUser && /* @__PURE__ */ jsx(Avatar, { className: "h-9 w-9 border-2 border-primary", children: /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5" }) }) }),
        /* @__PURE__ */ jsx("div", { className: `max-w-xl rounded-lg px-4 py-2.5 text-sm shadow-sm ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap", children: msg.text }) }),
        msg.isUser && /* @__PURE__ */ jsxs(Avatar, { className: "h-9 w-9", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: "https://picsum.photos/seed/user-avatar/100" }),
          /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(User, {}) })
        ] })
      ] }, msg.id)),
      isLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx(Avatar, { className: "h-9 w-9 border-2 border-primary", children: /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "max-w-xl rounded-lg px-4 py-2.5 bg-muted", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin text-primary" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-6 border-t", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 grid grid-cols-2 lg:grid-cols-4 gap-2", children: examplePrompts.map((prompt, i) => /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "text-xs h-auto py-1.5", onClick: () => handleSend(prompt), disabled: isLoading, children: prompt }, i)) }),
      /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            handleSend();
          },
          className: "flex w-full items-center space-x-3",
          children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "message",
                placeholder: "Type your message here...",
                className: "flex-1",
                autoComplete: "off",
                value: input,
                onChange: (e) => setInput(e.target.value),
                disabled: isLoading
              }
            ),
            /* @__PURE__ */ jsxs(Button, { type: "submit", size: "icon", disabled: isLoading, children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Send Message" })
            ] })
          ]
        }
      )
    ] })
  ] }) }) });
}
export {
  ChatInterface
};

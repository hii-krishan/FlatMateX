"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, ArrowRight, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aiRoomAssistantChat } from "@/ai/flows/ai-room-assistant-chat";
const Link = ({ href, children }) => /* @__PURE__ */ jsxs("a", { href, children });
function AIAssistantPreview() {
  const [messages, setMessages] = useState([
    { text: "Hey! How can I help you organize your day?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const handleSend = async () => {
    if (input.trim() === "") return;
    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const result = await aiRoomAssistantChat({ message: input });
      const aiMessage = { text: result.response, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage = { text: "Sorry, I'm having trouble connecting. Please try again later.", isUser: false };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);
  return /* @__PURE__ */ jsxs(Card, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BrainCircuit, {}),
        "AI Room Assistant"
      ] }),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/assistant", passHref: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }) }) })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "flex-grow overflow-hidden", children: /* @__PURE__ */ jsx(ScrollArea, { className: "h-64 pr-4", ref: scrollAreaRef, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      messages.map((msg, index) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-3 ${msg.isUser ? "justify-end" : ""}`, children: [
        !msg.isUser && /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8 border-2 border-primary", children: /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(Bot, { size: 16 }) }) }),
        /* @__PURE__ */ jsx("div", { className: `rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: msg.text }),
        msg.isUser && /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: "https://picsum.photos/seed/user-avatar/100" }),
          /* @__PURE__ */ jsx(AvatarFallback, { children: "U" })
        ] })
      ] }, index)),
      isLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8 border-2 border-primary", children: /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(Bot, { size: 16 }) }) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg px-3 py-2 bg-muted", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("div", { className: "h-2 w-2 animate-pulse rounded-full bg-primary" }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-2 animate-pulse rounded-full bg-primary delay-150" }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-2 animate-pulse rounded-full bg-primary delay-300" })
        ] }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault();
          handleSend();
        },
        className: "flex w-full items-center space-x-2",
        children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              placeholder: "Ask for a to-do list...",
              value: input,
              onChange: (e) => setInput(e.target.value),
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ jsx(Button, { type: "submit", size: "icon", disabled: isLoading, children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }) })
        ]
      }
    ) })
  ] });
}
export {
  AIAssistantPreview
};

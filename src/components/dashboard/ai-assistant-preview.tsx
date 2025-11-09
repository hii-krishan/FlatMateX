"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, Send, ArrowRight, CornerDownLeft, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aiRoomAssistantChat } from "@/ai/flows/ai-room-assistant-chat";

interface Message {
    text: string;
    isUser: boolean;
}

export function AIAssistantPreview() {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hey! How can I help you organize your day?", isUser: false },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (input.trim() === "") return;

        const userMessage: Message = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const result = await aiRoomAssistantChat({ message: input });
            const aiMessage: Message = { text: result.response, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: Message = { text: "Sorry, I'm having trouble connecting. Please try again later.", isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrainCircuit />
                        AI Room Assistant
                    </div>
                     <Link href="/dashboard/assistant" passHref>
                        <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-64 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.isUser ? "justify-end" : ""}`}>
                                {!msg.isUser && (
                                    <Avatar className="h-8 w-8 border-2 border-primary">
                                        <AvatarFallback><Bot size={16} /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    {msg.text}
                                </div>
                                {msg.isUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://picsum.photos/seed/user-avatar/100" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 border-2 border-primary">
                                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-3 py-2 bg-muted">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary delay-150" />
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary delay-300" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                 <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex w-full items-center space-x-2"
                >
                    <Input
                        type="text"
                        placeholder="Ask for a to-do list..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

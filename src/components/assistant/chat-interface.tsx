"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { aiRoomAssistantChat } from '@/ai/flows/ai-room-assistant-chat';
import { Separator } from '@/components/ui/separator';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
}

const examplePrompts = [
    "Remind me to pay rent tomorrow",
    "Create a to-do list for cleaning the flat",
    "What were my total expenses on food last week?",
    "Give me a motivational quote for studying",
];

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your AI Room Assistant. How can I help you manage your flat today?", isUser: false },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewportRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (prompt?: string) => {
        const messageText = prompt || input;
        if (messageText.trim() === '') return;

        const userMessage: Message = { id: Date.now(), text: messageText, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await aiRoomAssistantChat({ message: messageText });
            const aiMessage: Message = { id: Date.now() + 1, text: result.response, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I encountered an error. Please try again.", isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4 lg:p-6" viewportRef={scrollViewportRef}>
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <div key={msg.id} className={`flex items-start gap-4 ${msg.isUser ? "justify-end" : ""}`}>
                                    {!msg.isUser && (
                                        <Avatar className="h-9 w-9 border-2 border-primary">
                                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xl rounded-lg px-4 py-2.5 text-sm shadow-sm ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    {msg.isUser && (
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="https://picsum.photos/seed/user-avatar/100" />
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4">
                                     <Avatar className="h-9 w-9 border-2 border-primary">
                                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-xl rounded-lg px-4 py-2.5 bg-muted">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 lg:p-6 border-t">
                        <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {examplePrompts.map((prompt, i) => (
                                <Button key={i} variant="outline" size="sm" className="text-xs h-auto py-1.5" onClick={() => handleSend(prompt)} disabled={isLoading}>
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex w-full items-center space-x-3"
                        >
                            <Input
                                id="message"
                                placeholder="Type your message here..."
                                className="flex-1"
                                autoComplete="off"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send Message</span>
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

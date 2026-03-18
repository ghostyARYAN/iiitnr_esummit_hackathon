import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am your AI assistant for Pravesh (Parivesh-3.0). How can I help you with your environmental clearance application today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const generateOpenRouterResponse = async (userText: string) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return "I'm currently unable to connect to my brain (API Key missing). Please contact support.";
    }

    try {
      const systemPrompt = `
        You are an intelligent support assistant for "Pravesh" (Parivesh-3.0), an Environmental Clearance Portal.
        Your goal is to assist Project Proponents, Scrutiny Teams, and other users with the application process.
        
        Key Knowledge Base:
        1. **Platform Purpose**: To streamline Environmental Clearance (EC) applications.
        2. **User Roles**: 
           - **Project Proponent**: Applies for clearance.
           - **Scrutiny Team**: Reviews applications.
           - **MOM Team**: Handles Minutes of Meetings.
           - **Admin**: Manages the system.
        3. **New Application Process**:
           - **Step 1**: Select Category & Sector (e.g., Mining, Infrastructure). This dynamically shows required documents/fees.
           - **Step 2**: Enter Project Details (Title, Description, Location).
           - **Step 3**: Upload Documents (PDF format, drag-and-drop). Files go to Supabase storage.
           - **Step 4**: Payment via Razorpay. Payment is mandatory before submission.
        4. **Features**:
           - Drafts are saved automatically.
           - Real-time updates for document requirements.
           - Dashboard for tracking application status (Pending, Scrutiny, Approved, Rejected).
        
        Guidelines:
        - Be helpful, professional, and concise.
        - If asked about technical issues (upload failures, payment errors), suggest checking file sizes/formats or trying again.
        - If you don't know an answer, politely suggest contacting the official support email: support@pravesh.app.
        - Do not hallucinate features not mentioned above.
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Parivesh-3.0",
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const apiError = data?.error?.message || "Unknown OpenRouter error";
        throw new Error(apiError);
      }

      return data?.choices?.[0]?.message?.content || "I could not generate a response. Please try again.";
    } catch (error: any) {
      console.error("OpenRouter API Error:", error);
      return `Error: ${error.message || "Unknown error occurred"}. Please check your connection or API key.`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    const botResponseText = await generateOpenRouterResponse(newUserMessage.text);

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] h-[500px] mb-4 shadow-xl border-primary/20 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-xl flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <CardTitle className="text-base">Pravesh AI Assistant</CardTitle>
                <p className="text-xs text-primary-foreground/80">Powered by OpenRouter</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[90%] rounded-lg p-3 text-sm break-words leading-relaxed",
                      msg.sender === "user"
                        ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.sender === "bot" ? (
                      <ReactMarkdown
                        components={{
                          ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ ...props }) => <li className="mb-1" {...props} />,
                          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({ ...props }) => <span className="font-bold" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex max-w-[90%] rounded-lg p-3 text-sm bg-muted text-foreground rounded-bl-none items-center gap-2 break-words">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-3 bg-muted/30 border-t">
            <div className="flex w-full items-center gap-2">
              <Input 
                placeholder="Ask for help..." 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-background"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </Button>
    </div>
  );
}

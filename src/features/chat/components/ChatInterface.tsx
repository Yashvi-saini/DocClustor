"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, ChevronDown, ChevronRight, Smile, Sparkles, Shield, FileText, HelpCircle } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isUpload?: boolean;
}

export function ChatInterface() {
  const [view, setView] = useState<'welcome' | 'chat'>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFaq, setShowFaq] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat') {
        scrollToBottom();
    }
  }, [messages, isTyping, view]);

  const handleStartChat = () => {
    if (messages.length === 0) {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: 'Hello, How can I help you?',
                timestamp: new Date()
            }
        ]);
    }
    setView('chat');
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm analyzing the document repository to formulate an answer for your query based on our internal knowledge base.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const faqs = [
    { text: "Is there a free trial available?", icon: <Sparkles className="w-4 h-4 text-[#1E9BFF]" /> },
    { text: "How is my data protected?", icon: <Shield className="w-4 h-4 text-[#1E9BFF]" /> },
    { text: "Can I cancel my subscription at any time?", icon: <FileText className="w-4 h-4 text-[#1E9BFF]" /> },
    { text: "What's New in DocClustor?", icon: <HelpCircle className="w-4 h-4 text-[#1E9BFF]" /> },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-white font-poppins relative overflow-hidden">
      
      {view === 'welcome' && (
        <div className="flex flex-col h-full items-center justify-start overflow-y-auto w-full custom-scrollbar">
            {/* Structured Banner */}
            <div className="bg-[#003259] w-full py-10 px-8 flex flex-col items-center shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm relative z-10">
                    <Image src="/dashboard/bot.svg" alt="Bot" width={32} height={32} style={{ filter: "brightness(0) invert(1)"}} />
                </div>
                <h3 className="font-bold text-2xl mb-2 text-white relative z-10">Our chatbot is here to assist you instantly</h3>
                <p className="text-sm text-blue-100 font-medium relative z-10 text-center">Ask questions and get immediate responses from your knowledge base</p>
            </div>

            {/* Content centered container */}
            <div className="w-full max-w-4xl px-8 flex flex-col gap-6 py-8">
                


                {/* Start Chat Button */}
                <div 
                    onClick={handleStartChat}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex justify-between items-center cursor-pointer hover:border-[#1E9BFF]/30 hover:bg-[#F9FCFF] transition-all group"
                >
                    <div className="flex items-center gap-4">
                       <div className="bg-[#003259] w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                          <Image src="/dashboard/bot.svg" alt="Bot" width={18} height={18} style={{ filter: "brightness(0) invert(1)"}} />
                       </div>
                       <div>
                          <h4 className="font-bold text-[#003259] text-sm group-hover:text-[#1E9BFF] transition-colors">Talk with chatbot</h4>
                          <p className="text-[12px] text-gray-500 mt-0.5">The chatbot will respond immediately.</p>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F4F7FD] group-hover:bg-[#1E9BFF] flex items-center justify-center transition-colors">
                       <ChevronRight className="w-5 h-5 text-[#1E9BFF] group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
            

        </div>
      )}

      {view === 'chat' && (
        <div className="flex flex-col h-full bg-[#FAFCFF] relative">
            {/* Modern Chat View Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#003259] shadow-sm flex items-center justify-center">
                        <Image src="/dashboard/bot.svg" alt="Bot Icon" width={20} height={20} style={{ filter: "brightness(0) invert(1)"}} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <h2 className="text-sm md:text-base font-bold text-[#003259] tracking-tight">RAG Bot</h2>
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mt-0.5"></span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400 font-medium">Online</span>
                    </div>
                </div>
                <button 
                  onClick={() => setView('welcome')}
                  className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-[#003259] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                    <X className="w-3.5 h-3.5" />
                    End Chat
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-6 custom-scrollbar">
                <div className="w-full space-y-6">
                    {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={"flex w-full " + (msg.role === 'user' ? "justify-end" : "justify-start")}
                    >
                        <div className={"flex gap-3 max-w-[85%] md:max-w-[70%] " + (msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                            
                            {/* Bot Avatar */}
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-[#003259] flex items-center justify-center shadow-sm">
                                        <Image src="/dashboard/bot.svg" alt="Bot" width={14} height={14} style={{ filter: "brightness(0) invert(1)"}} />
                                    </div>
                                </div>
                            )}
                        
                            <div className="flex flex-col gap-1">
                                {/* Message Bubble */}
                                <div className={"px-5 py-3.5 text-[14px] font-medium leading-relaxed shadow-sm " + 
                                    (msg.role === 'user' 
                                        ? "bg-[#1E9BFF] text-white rounded-2xl rounded-tr-sm shadow-[0_2px_10px_rgba(1,143,255,0.15)]" 
                                        : "bg-white text-[#003259] rounded-2xl rounded-tl-sm border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]")}>
                                    <p>{msg.content}</p>
                                </div>
                                <span className={"text-[10px] text-gray-400 font-medium " + (msg.role === 'user' ? "text-right" : "text-left leading-tight translate-x-1.5")}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                    <div className="flex w-full justify-start animate-in fade-in">
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-[#003259] flex items-center justify-center shadow-sm">
                                    <Image src="/dashboard/bot.svg" alt="Bot Icon" width={14} height={14} style={{ filter: "brightness(0) invert(1)"}} />
                                </div>
                            </div>
                            <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm flex items-center space-x-1.5 w-16">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0 z-10">
                <div className="w-full px-2 md:px-8 relative">
                    <div className="flex items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl pr-3 pl-6 transition-colors focus-within:border-[#1E9BFF]/50 focus-within:bg-white focus-within:shadow-sm">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything or search your repository..."
                            className="w-full py-4 bg-transparent text-sm font-medium text-[#003259] placeholder:text-gray-400 focus:outline-none"
                            disabled={isTyping}
                        />
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                            <button className="p-2 text-gray-400 hover:text-[#003259] transition-colors rounded-lg text-xs font-bold bg-transparent">
                                GIF
                            </button>
                            <button className="p-2 text-gray-400 hover:text-[#003259] transition-colors rounded-full">
                                <Smile className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-[#003259] transition-colors rounded-full">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            
                            {/* Inner Send Button for full website mode */}
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className={`ml-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    inputValue.trim() && !isTyping 
                                        ? 'bg-[#1E9BFF] text-white shadow-md hover:bg-[#1E9BFF]/80' 
                                        : 'bg-transparent text-gray-300'
                                }`}
                            >
                                <Send className={`w-4 h-4 mr-0.5 ${inputValue.trim() && !isTyping ? "text-white" : "text-gray-300"}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
      )}
    </div>
  );
}

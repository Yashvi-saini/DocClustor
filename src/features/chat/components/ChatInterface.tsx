"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, ChevronDown, ChevronRight, Smile, Sparkles, Shield, FileText, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { toast } from 'react-hot-toast';

interface Source {
  documentId: string;
  title: string;
  snippet: string;
  workspaceName: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isUpload?: boolean;
  sources?: Source[];
}

function SourceBadge({ source }: { source: Source }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left px-3 py-2 rounded-xl bg-gray-50 border border-gray-150 hover:bg-gray-100/80 transition-colors text-xs font-semibold text-[#003259] focus:outline-none"
      >
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-[300px]">{source.title}</span>
          <span className="text-[9px] bg-[#E1F0FF] text-[#1E9BFF] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
            {source.workspaceName}
          </span>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="mt-1.5 p-3.5 rounded-xl bg-[#FAFCFF] border border-[#E1F0FF]/40 text-[12px] text-gray-600 font-medium leading-relaxed shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="font-mono text-gray-500 text-[11px] mb-1.5">Context Segment Match:</p>
          "{source.snippet}"
        </div>
      )}
    </div>
  );
}

function renderMarkdown(content: string, isUser = false) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inList = false;

  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\{\{.*?\}\})/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className={cn("font-extrabold", isUser ? "text-white" : "text-[#00172B]")}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className={cn("px-1.5 py-0.5 rounded font-mono text-xs border", 
            isUser ? "bg-white/10 text-white border-white/20" : "bg-gray-100 text-red-500 border-gray-200"
          )}>
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('{{') && part.endsWith('}}')) {
        return (
          <span key={idx} className={cn("px-1.5 py-0.5 rounded font-semibold font-mono text-[11px] border", 
            isUser ? "bg-white/20 text-white border-white/30" : "bg-blue-50 text-[#1E9BFF] border-blue-100"
          )}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        inList = true;
      }
      currentList.push(
        <li key={`li-${lineIdx}`} className={cn("list-disc ml-5 mb-1 text-[13px] leading-relaxed", isUser ? "text-white/95" : "text-gray-700")}>
          {parseInlineStyles(trimmed.substring(2))}
        </li>
      );
    } else {
      if (inList) {
        elements.push(
          <ul key={`ul-${lineIdx}`} className="my-2 space-y-1">
            {currentList}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      
      if (trimmed === '') {
        elements.push(<div key={`spacer-${lineIdx}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${lineIdx}`} className={cn("mb-1.5 last:mb-0 text-[13px] leading-relaxed", isUser ? "text-white" : "text-gray-700")}>
            {parseInlineStyles(line)}
          </p>
        );
      }
    }
  });

  if (inList && currentList.length > 0) {
    elements.push(
      <ul key="ul-final" className="my-2 space-y-1">
        {currentList}
      </ul>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

const EMOJIS = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "⚙️", "🧑‍💻", "✍️", "🚀", "💡", "🔥", "✨", "🎉", "📅", "📎", "🔒", "🔑", "🛡️"];

export function ChatInterface() {
  const [view, setView] = useState<'welcome' | 'chat'>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchAllWorkspaces, setSearchAllWorkspaces] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { activeWorkspace } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat') {
        scrollToBottom();
    }
  }, [messages, isTyping, view]);

  // Handle click outside emoji picker to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartChat = () => {
    if (messages.length === 0) {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `Hello! I am your DocCluster RAG assistant. Ask me anything, and I will search your active workspace (${activeWorkspace?.name || "Personal Space"}) documents to find answers.`,
                timestamp: new Date()
            }
        ]);
    }
    setView('chat');
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const questionText = inputValue.trim();

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeWorkspace) {
        headers["X-Workspace-Context"] = activeWorkspace.type === "personal" ? "personal" : `org:${activeWorkspace.id}`;
      }

      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: questionText,
          searchAllWorkspaces,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: json.data.answer,
          timestamp: new Date(),
          sources: json.data.sources,
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error(json.message || "Failed to process RAG query");
      }
    } catch (error: any) {
      console.error("RAG Query failed:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error while searching your knowledge base: ${error.message || "Unknown error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'doc' || ext === 'docx') return 'WORD';
    if (ext === 'xls' || ext === 'xlsx') return 'EXCEL';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') return 'IMAGE';
    return 'TEXT';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const MAX_SIZE = 3.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`"${file.name}" is too large. Maximum upload size is 3.5 MB.`);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading & indexing "${file.name}"...`);

    // Optimistic Chat Notification
    const uploadingMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: uploadingMsgId,
      role: 'assistant',
      content: `⏳ Uploading and indexing "${file.name}" into your workspace context...`,
      timestamp: new Date()
    }]);

    const reader = new FileReader();
    const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv");

    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (activeWorkspace) {
          headers["X-Workspace-Context"] = activeWorkspace.type === "personal" ? "personal" : `org:${activeWorkspace.id}`;
        }

        const res = await fetch("/api/documents", {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: file.name,
            content: fileContent || " ",
            type: getFileType(file.name),
            visibility: "SHARED",
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Failed to upload document");
        }

        toast.success(`"${file.name}" successfully indexed!`, { id: toastId });
        
        // Update the uploading message to confirmation
        setMessages(prev => prev.map(m => {
          if (m.id === uploadingMsgId) {
            return {
              ...m,
              content: `📎 Document **"${file.name}"** successfully uploaded and indexed in your workspace! I can now answer questions referencing its content.`
            };
          }
          return m;
        }));

      } catch (err: any) {
        console.error("Chat upload failed:", err);
        toast.error(err.message || "Upload failed", { id: toastId });
        setMessages(prev => prev.map(m => {
          if (m.id === uploadingMsgId) {
            return {
              ...m,
              content: `❌ Failed to upload "${file.name}": ${err.message || "Unknown error"}`
            };
          }
          return m;
        }));
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white font-poppins relative overflow-hidden">
      
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.csv,.pdf,.png,.jpg,.jpeg,.doc,.docx"
      />

      {view === 'welcome' && (
        <div className="flex flex-col h-full items-center justify-start overflow-y-auto w-full custom-scrollbar">
            {/* Structured Banner */}
            <div className="bg-[#003259] w-full py-10 px-8 flex flex-col items-center shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm relative z-10">
                    <Image src="/dashboard/bot.svg" alt="Bot" width={32} height={32} style={{ filter: "brightness(0) invert(1)"}} />
                </div>
                <h3 className="font-bold text-2xl mb-2 text-white relative z-10 text-center">Secure RAG Knowledge Assistant</h3>
                <p className="text-sm text-blue-100 font-medium relative z-10 text-center">Ask questions and search context safely isolated inside your active workspace</p>
            </div>

            {/* Content centered container */}
            <div className="w-full max-w-4xl px-8 flex flex-col gap-6 py-8">
                {/* Info Card */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6">
                    <h4 className="font-bold text-[#003259] text-sm mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#1E9BFF]" />
                      Strict Data Isolation Walls Active
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      All queries run under zero-leakage security boundaries. Locked locker files are excluded automatically unless unlocked. Personal space files are never leaked to organization spaces.
                    </p>
                </div>

                {/* Start Chat Button */}
                <div 
                    onClick={handleStartChat}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-5 flex justify-between items-center cursor-pointer hover:border-[#1E9BFF]/30 hover:bg-[#F9FCFF] transition-all group"
                >
                    <div className="flex items-center gap-4">
                       <div className="bg-[#003259] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">
                          <Image src="/dashboard/bot.svg" alt="Bot" width={20} height={20} style={{ filter: "brightness(0) invert(1)"}} />
                       </div>
                       <div>
                          <h4 className="font-bold text-[#003259] text-sm group-hover:text-[#1E9BFF] transition-colors">Start RAG Assistant Session</h4>
                          <p className="text-[12px] text-gray-500 mt-0.5">Interact with documents in "{activeWorkspace?.name || 'Personal Space'}"</p>
                       </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#F4F7FD] group-hover:bg-[#1E9BFF] flex items-center justify-center transition-colors">
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
                        <span className="text-[10px] md:text-xs text-gray-400 font-medium">
                          Active: {activeWorkspace?.name || "Personal Space"}
                        </span>
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
                        <div className={"flex gap-3 w-full max-w-[90%] sm:max-w-[80%] " + (msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                            
                            {/* Bot Avatar */}
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-[#003259] flex items-center justify-center shadow-sm">
                                        <Image src="/dashboard/bot.svg" alt="Bot" width={14} height={14} style={{ filter: "brightness(0) invert(1)"}} />
                                    </div>
                                </div>
                            )}
                        
                            <div className="flex flex-col gap-1 w-full">
                                {/* Message Bubble */}
                                <div className={"px-5 py-4 text-[14px] font-medium leading-relaxed shadow-sm w-full " + 
                                    (msg.role === 'user' 
                                        ? "bg-[#1E9BFF] text-white rounded-2xl rounded-tr-sm shadow-[0_2px_10px_rgba(1,143,255,0.15)]" 
                                        : "bg-white text-[#003259] rounded-2xl rounded-tl-sm border border-gray-150 shadow-[0_2px_10px_rgba(0,0,0,0.02)]")}>
                                    
                                    <div>{renderMarkdown(msg.content, msg.role === 'user')}</div>

                                    {/* Render cited sources */}
                                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-[#E1F0FF]/40 space-y-2">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-[#1E9BFF]" />
                                          Cited Reference Sources ({msg.sources.length})
                                        </p>
                                        <div className="flex flex-col gap-2">
                                          {msg.sources.map((src, sIdx) => (
                                            <SourceBadge key={sIdx} source={src} />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <span className={"text-[10px] text-gray-400 font-semibold " + (msg.role === 'user' ? "text-right mr-1.5" : "text-left ml-2")}>
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
                            <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white border border-gray-150 shadow-sm flex items-center space-x-1.5 w-16">
                                <div className="w-1.5 h-1.5 bg-[#1E9BFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-[#1E9BFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-[#1E9BFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0 z-10 flex flex-col items-center">
                <div className="w-full px-2 md:px-8 relative max-w-4xl">
                    
                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                      <div 
                        ref={emojiPickerRef}
                        className="absolute bottom-20 left-4 sm:left-8 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-72 h-48 overflow-y-auto grid grid-cols-6 gap-2 z-50 custom-scrollbar animate-in slide-in-from-bottom-2 duration-150"
                      >
                        {EMOJIS.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-xl hover:bg-gray-100 p-1 rounded-lg transition-colors flex items-center justify-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search All Workspace Toggle */}
                    <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-[#FAFCFF] border border-[#E1F0FF]/50 rounded-xl w-fit">
                        <input
                            type="checkbox"
                            id="search-all-toggle"
                            checked={searchAllWorkspaces}
                            onChange={(e) => setSearchAllWorkspaces(e.target.checked)}
                            className="w-4 h-4 text-[#1E9BFF] border-gray-300 rounded focus:ring-[#1E9BFF] cursor-pointer"
                        />
                        <label htmlFor="search-all-toggle" className="text-xs font-bold text-[#003259] cursor-pointer select-none flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#1E9BFF]" />
                            Search All My Workspaces
                        </label>
                    </div>

                    <div className="flex items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl pr-3 pl-6 transition-colors focus-within:border-[#1E9BFF]/50 focus-within:bg-white focus-within:shadow-sm">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isUploading ? "Uploading file..." : (searchAllWorkspaces ? "Search across all workspaces..." : `Ask anything in ${activeWorkspace?.name || "Personal Space"}...`)}
                            className="w-full py-4 bg-transparent text-sm font-semibold text-[#003259] placeholder:text-gray-400 focus:outline-none"
                            disabled={isTyping || isUploading}
                        />
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                            <button 
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              disabled={isUploading || isTyping}
                              className="p-2 text-gray-400 hover:text-[#003259] transition-colors rounded-full focus:outline-none disabled:opacity-50"
                            >
                                <Smile className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={handlePaperclipClick}
                              disabled={isUploading || isTyping}
                              className="p-2 text-gray-400 hover:text-[#003259] transition-colors rounded-full focus:outline-none disabled:opacity-50"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            
                            {/* Inner Send Button for full website mode */}
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping || isUploading}
                                className={`ml-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    inputValue.trim() && !isTyping && !isUploading
                                        ? 'bg-[#1E9BFF] text-white shadow-md hover:bg-[#1E9BFF]/80' 
                                        : 'bg-transparent text-gray-300'
                                }`}
                            >
                                <Send className={`w-4 h-4 mr-0.5 ${inputValue.trim() && !isTyping && !isUploading ? "text-white" : "text-gray-300"}`} />
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

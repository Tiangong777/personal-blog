import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, FileText, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface KbFile {
    name: string;
    size: number;
    modified: number;
}

const LegalChat: React.FC = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

    const [sessionId] = useState(() => {
        if (typeof window === 'undefined') return 'local';
        const existing = window.localStorage.getItem('legal_session_id');
        if (existing) return existing;
        const next = crypto.randomUUID();
        window.localStorage.setItem('legal_session_id', next);
        return next;
    });

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Legal AI Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [kbFiles, setKbFiles] = useState<KbFile[]>([]);
    const [kbLoading, setKbLoading] = useState(false);
    const [kbError, setKbError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [useDocs, setUseDocs] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchSessionFiles = async () => {
        setKbLoading(true);
        setKbError(null);
        try {
            const response = await fetch(`${API_BASE}/session/files?session_id=${encodeURIComponent(sessionId)}`);
            if (!response.ok) throw new Error('Failed to load session files');
            const data = await response.json();
            setKbFiles(Array.isArray(data.files) ? data.files : []);
        } catch (error) {
            setKbError('Failed to load session files');
        } finally {
            setKbLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionFiles();
    }, [sessionId]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    session_id: sessionId,
                    use_docs: useDocs
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer || "No response received."
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);
            Array.from(fileList).forEach(file => formData.append('files', file));

            const response = await fetch(`${API_BASE}/session/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');
            await fetchSessionFiles();
        } catch (error) {
            setKbError('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="container flex flex-col md:flex-row gap-8 h-[calc(100vh-12rem)] max-h-[800px]">
            {/* Sidebar - Files */}
            <aside className="w-full md:w-64 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-color pb-4">
                    <h3 className="text-sm font-bold tracking-widest text-text-main">DOCUMENTS</h3>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 glass rounded-2xl p-4 overflow-y-auto space-y-2">
                    {kbLoading ? (
                        <div className="flex items-center gap-2 text-xs text-text-dim animate-pulse">
                            <Loader2 size={12} className="animate-spin" /> Fetching...
                        </div>
                    ) : kbFiles.length === 0 ? (
                        <div className="text-[10px] text-text-dim/50 font-mono text-center py-8">NO_PDFS_INDEXED</div>
                    ) : (
                        kbFiles.map((file) => (
                            <div key={file.name} className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText size={14} className="text-accent-blue shrink-0" />
                                    <span className="text-xs truncate text-text-dim group-hover:text-text-main transition-colors">{file.name}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Chat Content */}
            <main className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-border-color pb-4">
                    <div className="p-3 rounded-2xl bg-accent-blue/10 text-accent-blue">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-outfit font-bold text-text-main tracking-tight">LEGAL_AI_NODE</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-text-dim uppercase tracking-tighter">Status: Processing_Ready</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 glass rounded-3xl p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                            >
                                <div className={`p-2 rounded-xl shrink-0 ${msg.role === 'user' ? 'bg-accent-blue text-black' : 'bg-white/5 text-accent-blue'}`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-accent-blue text-black font-medium'
                                    : 'bg-white/5 border border-white/5 text-text-main'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex gap-4 self-start animate-pulse">
                            <div className="p-2 rounded-xl bg-white/5 text-accent-blue">
                                <Bot size={18} />
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-accent-blue" />
                                <span className="text-xs font-mono text-text-dim">ANALYZING_NEURAL_PATHWAY...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your query to the neural network..."
                                className="w-full bg-white/5 border border-border-color focus:border-accent-blue/50 rounded-2xl px-6 py-4 text-sm text-text-main placeholder:text-text-dim/40 outline-none transition-all"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent-blue text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${useDocs ? 'bg-accent-blue border-accent-blue' : 'border-white/20 group-hover:border-white/40'}`}>
                                    <input
                                        type="checkbox"
                                        checked={useDocs}
                                        disabled={kbFiles.length === 0}
                                        onChange={(e) => setUseDocs(e.target.checked)}
                                        className="hidden"
                                    />
                                    {useDocs && <div className="w-2 h-2 bg-black rounded-full" />}
                                </div>
                                <span className={`text-[10px] font-bold tracking-widest ${kbFiles.length === 0 ? 'text-text-dim/30' : 'text-text-dim group-hover:text-text-main'}`}>USE_RAG_MEMORY</span>
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={handleUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-text-dim hover:text-accent-blue transition-colors disabled:opacity-30"
                            >
                                <Plus size={14} /> {uploading ? 'LOADING_PDF...' : 'UPLOAD_NEW_SOURCE'}
                            </button>
                        </div>

                        <div className="text-[9px] font-mono text-text-dim opacity-30">ENCRYPTED_SIGNAL_ACTIVE</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LegalChat;

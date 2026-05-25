import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, MessageSquarePlus, Plus, BookOpen, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import AuthGate from '../components/AuthGate';
import KnowledgeSidebar from '../components/KnowledgeSidebar';
import AnnotationPanel from '../components/AnnotationPanel';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Citation {
    entry_id: string;
    title: string;
}

interface KnowledgeEntry {
    entry_id: string;
    title: string;
    category: string;
    description: string;
}

interface Proposal {
    action: 'create_entry' | 'update_entry';
    title: string;
    category: string;
    description: string;
    tags?: string[];
    entry_id?: string;
}

const TOKEN_KEY = 'ai_manage_token';
const CONV_KEY = 'ai_manage_conv_id';

function extractProposals(text: string): Proposal[] {
    const proposals: Proposal[] = [];
    const re = /```proposal\s*\n(.*?)\n```/gs;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        try {
            const p = JSON.parse(m[1]);
            if (p.action && p.title) proposals.push(p);
        } catch {}
    }
    return proposals;
}

function stripProposals(text: string): string {
    return text.replace(/```proposal\s*\n.*?\n```\s*/gs, '').trim();
}

const AiManageChatInner: React.FC = () => {
    const [sessionId] = useState(() => {
        if (typeof window === 'undefined') return 'local';
        const existing = window.localStorage.getItem('ai_manage_session_id');
        if (existing) return existing;
        const next = crypto.randomUUID();
        window.localStorage.setItem('ai_manage_session_id', next);
        return next;
    });

    const [conversationId, setConversationId] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        return window.localStorage.getItem(CONV_KEY) || '';
    });

    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) || '' : '';

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '你好！我是AI项目管理助手。你可以问我关于项目组合的任何问题，比如"有哪些延期项目？"、"KG-006的详情是什么？"或"紫云英公司有哪些项目？"' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [citations, setCitations] = useState<Citation[]>([]);
    const [showAnnotationFor, setShowAnnotationFor] = useState<{ entryId: string; entryTitle: string; msgIdx: number } | null>(null);
    const [proposals, setProposals] = useState<{ msgIdx: number; proposals: Proposal[] } | null>(null);
    const [proposalStatus, setProposalStatus] = useState<Record<number, 'accepted' | 'rejected' | 'editing'>>({});
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);
    const isLoadingRef = useRef(false);

    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

    const scrollToBottom = useCallback((force = false) => {
        if (!force && !isNearBottomRef.current) return;
        const el = chatContainerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: isLoadingRef.current ? 'instant' : 'smooth' });
    }, []);

    const handleScroll = useCallback(() => {
        const el = chatContainerRef.current;
        if (!el) return;
        isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }, []);

    useEffect(() => { const el = chatContainerRef.current; if (el) el.scrollTop = el.scrollHeight; }, []);
    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
    useEffect(() => {
        if (isLoading) { isNearBottomRef.current = true; const el = chatContainerRef.current; if (el) el.scrollTop = el.scrollHeight; }
    }, [isLoading]);

    useEffect(() => {
        if (!conversationId && token) {
            fetch('/api/ai-manage/conversations', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({}),
            }).then(r => r.json()).then(data => {
                if (data.conversation) { setConversationId(data.conversation.conversation_id); window.localStorage.setItem(CONV_KEY, data.conversation.conversation_id); }
            }).catch(() => {});
        }
    }, [conversationId, token]);

    const newConversation = async () => {
        try {
            const res = await fetch('/api/ai-manage/conversations', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.conversation) {
                setConversationId(data.conversation.conversation_id); window.localStorage.setItem(CONV_KEY, data.conversation.conversation_id);
                setMessages([{ role: 'assistant', content: '你好！新对话已开始。有什么我可以帮助你的？' }]);
                setProposals(null);
            }
        } catch {}
    };

    const handleAcceptProposal = async (proposal: Proposal, msgIdx: number) => {
        setIsConfirming(true);
        try {
            const res = await fetch('/api/ai-manage/knowledge/proposals/confirm', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(proposal),
            });
            if (res.ok) {
                setProposalStatus(prev => ({ ...prev, [msgIdx]: 'accepted' }));
            }
        } finally { setIsConfirming(false); }
    };

    const handleRejectProposal = (msgIdx: number) => {
        setProposalStatus(prev => ({ ...prev, [msgIdx]: 'rejected' }));
    };

    const handleEditProposal = (proposal: Proposal) => {
        setEditingProposal({ ...proposal });
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput(''); setIsLoading(true); isNearBottomRef.current = true; setCitations([]);
        setProposals(null); setProposalStatus({}); setEditingProposal(null);
        const recentHistory = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

        try {
            const response = await fetch('/api/ai-manage/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: input, session_id: sessionId, conversation_id: conversationId, history: recentHistory }),
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const reader = response.body!.getReader(); const decoder = new TextDecoder();
            let assistantContent = ''; let buffer = ''; const newCitations: Citation[] = [];
            let lastMsgIdx = messages.length;
            setMessages(prev => { lastMsgIdx = prev.length; return [...prev, { role: 'assistant', content: '' }]; });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n'); buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        if (event.type === 'token') {
                            assistantContent += event.content;
                            setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: assistantContent }; return u; });
                        } else if (event.type === 'citation') {
                            newCitations.push({ entry_id: event.entry_id, title: event.title });
                            setCitations([...newCitations]);
                        }
                    } catch {}
                }
            }

            // After streaming done: detect proposals
            const found = extractProposals(assistantContent);
            if (found.length > 0) {
                setProposals({ msgIdx: lastMsgIdx, proposals: found });
                // Strip proposal blocks from displayed text
                const clean = stripProposals(assistantContent);
                setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: clean }; return u; });
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `请求失败: ${error instanceof Error ? error.message : '未知错误'}。` }]);
        } finally { setIsLoading(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const handleSelectEntry = (_entry: KnowledgeEntry) => {};

    return (
        <div className="h-[calc(100vh-5rem)] flex -mt-24">
            <KnowledgeSidebar token={token} onSelectEntry={handleSelectEntry} />
            <div className="flex-1 flex flex-col min-w-0">
                <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="min-h-full flex flex-col justify-end w-full max-w-3xl mx-auto px-4 md:px-6">
                        {messages.map((msg, idx) => (
                            <div key={idx}>
                                <div className="py-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`p-1 rounded-md ${msg.role === 'user' ? 'bg-accent/15 text-accent' : 'bg-white/10 text-text-secondary'}`}>
                                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <span className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                                            {msg.role === 'user' ? 'You' : 'AI Project Manager'}
                                        </span>
                                    </div>
                                    <div className={`text-base leading-7 ${msg.role === 'user'
                                        ? 'text-text-primary'
                                        : 'text-text-primary prose prose-invert max-w-none prose-base prose-headings:text-text-primary prose-p:leading-7 prose-li:leading-7 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-table:text-sm prose-th:text-left prose-td:px-3 prose-th:px-3 prose-th:py-2 prose-td:py-2 prose-table:border-separate prose-table:border-spacing-0 prose-thead:border-b prose-thead:border-white/10 prose-tr:border-b prose-tr:border-white/5'
                                        }`}>
                                        {msg.role === 'user' ? msg.content : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        )}
                                    </div>

                                    {/* Citations */}
                                    {idx === messages.length - 1 && citations.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {citations.map(c => (
                                                <div key={c.entry_id} className="flex items-center gap-1 px-2 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[11px] text-accent">
                                                    <BookOpen size={12} /> <span>{c.title}</span>
                                                    <button onClick={() => setShowAnnotationFor({ entryId: c.entry_id, entryTitle: c.title, msgIdx: idx })}
                                                        className="ml-1 p-0.5 hover:bg-accent/20 rounded transition-all">
                                                        <MessageSquarePlus size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Annotation form */}
                                    {showAnnotationFor && showAnnotationFor.msgIdx === idx && (
                                        <div className="mt-3 max-w-md">
                                            <AnnotationPanel token={token} entryId={showAnnotationFor.entryId}
                                                entryTitle={showAnnotationFor.entryTitle} relatedMessageId={conversationId}
                                                onAdded={() => setShowAnnotationFor(null)} />
                                        </div>
                                    )}
                                </div>

                                {/* Proposal cards */}
                                {proposals && proposals.msgIdx === idx && (
                                    <div className="ml-10 space-y-3 pb-4">
                                        <div className="text-xs font-mono font-bold text-accent mb-2">
                                            PENDING PROPOSALS — AI wants to write to knowledge base:
                                        </div>
                                        {proposals.proposals.map((p, pi) => {
                                            const status = proposalStatus[pi];
                                            if (status === 'accepted') return (
                                                <div key={pi} className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400">
                                                    <CheckCircle2 size={14} /> Written: {p.title}
                                                </div>
                                            );
                                            if (status === 'rejected') return (
                                                <div key={pi} className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-text-secondary line-through">
                                                    <XCircle size={14} /> Rejected: {p.title}
                                                </div>
                                            );
                                            const display = editingProposal && pi === proposals.proposals.indexOf(p) ? editingProposal : p;
                                            const isEditing = editingProposal && pi === proposals.proposals.indexOf(p);
                                            return (
                                                <div key={pi} className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                                                    {isEditing ? (
                                                        <>
                                                            <input value={display.title}
                                                                onChange={e => setEditingProposal({ ...display, title: e.target.value })}
                                                                className="w-full bg-white/5 border border-border rounded px-3 py-1.5 text-xs text-text-primary outline-none" />
                                                            <textarea value={display.description}
                                                                onChange={e => setEditingProposal({ ...display, description: e.target.value })}
                                                                className="w-full bg-white/5 border border-border rounded px-3 py-2 text-xs text-text-primary outline-none min-h-[60px] resize-y" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="font-bold text-sm text-text-primary">{display.title}</div>
                                                            <div className="text-xs text-text-secondary">{display.description?.slice(0, 500)}</div>
                                                            <div className="flex gap-2">
                                                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 rounded text-text-secondary">{display.category}</span>
                                                                {display.tags?.map((t: string) => (
                                                                    <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 rounded text-text-secondary">{t}</span>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => isEditing ? handleAcceptProposal(display, pi) : handleAcceptProposal(p, pi)}
                                                            disabled={isConfirming}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 disabled:opacity-50 transition-all">
                                                            <CheckCircle2 size={14} /> {isEditing ? 'CONFIRM EDIT' : 'ACCEPT'}
                                                        </button>
                                                        <button
                                                            onClick={() => isEditing ? setEditingProposal(null) : handleEditProposal(p)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-text-secondary rounded-lg text-xs hover:bg-white/10 transition-all">
                                                            <Edit3 size={14} /> {isEditing ? 'CANCEL' : 'EDIT'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectProposal(pi)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-text-secondary rounded-lg text-xs hover:bg-red-500/10 hover:text-red-400 transition-all">
                                                            <XCircle size={14} /> REJECT
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="py-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1 rounded-md bg-white/10 text-text-secondary"><Bot size={14} /></div>
                                    <span className="text-xs font-semibold tracking-wide text-text-secondary uppercase">AI Project Manager</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary"><Loader2 size={16} className="animate-spin" /><span className="text-sm">正在查询项目数据...</span></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="shrink-0 w-full max-w-3xl mx-auto px-4 md:px-6 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={newConversation}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-text-secondary/50 hover:text-text-secondary transition-all border border-white/5 rounded-lg hover:border-white/10">
                            <Plus size={12} /> NEW_CONVERSATION
                        </button>
                    </div>
                    <div className="relative">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                            placeholder="输入问题，例如：有哪些延期项目？KG-006的详情？"
                            className="w-full bg-white/5 border border-border focus:border-accent/40 rounded-xl px-5 py-3.5 pr-12 text-sm text-text-primary placeholder:text-text-secondary/40 outline-none transition-all" />
                        <button onClick={sendMessage} disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all">
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-[10px] font-mono text-text-secondary/25 text-center mt-3">
                        RAG_ENABLED · FTS5 search · Proposal workflow enabled
                    </div>
                </div>
            </div>
        </div>
    );
};

const AiManageChat: React.FC = () => (
    <AuthGate><AiManageChatInner /></AuthGate>
);

export default AiManageChat;

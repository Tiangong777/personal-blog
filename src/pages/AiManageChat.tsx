import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AiManageChat: React.FC = () => {
    const [sessionId] = useState(() => {
        if (typeof window === 'undefined') return 'local';
        const existing = window.localStorage.getItem('ai_manage_session_id');
        if (existing) return existing;
        const next = crypto.randomUUID();
        window.localStorage.setItem('ai_manage_session_id', next);
        return next;
    });

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '你好！我是AI项目管理助手。你可以问我关于项目组合的任何问题，比如"有哪些延期项目？"、"KG-006的详情是什么？"或"紫云英公司有哪些项目？"' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);

    const scrollToBottom = useCallback((force = false) => {
        if (!force && !isNearBottomRef.current) return;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleScroll = useCallback(() => {
        const el = chatContainerRef.current;
        if (!el) return;
        const threshold = 60;
        isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isLoading) {
            isNearBottomRef.current = true;
            scrollToBottom(true);
        }
    }, [isLoading, scrollToBottom]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        isNearBottomRef.current = true;

        const recentHistory = messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
        }));

        try {
            const response = await fetch('/api/ai-manage/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    session_id: sessionId,
                    history: recentHistory,
                }),
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';
            let buffer = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const jsonStr = line.slice(6);
                    try {
                        const event = JSON.parse(jsonStr);
                        if (event.type === 'token') {
                            assistantContent += event.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: assistantContent,
                                };
                                return updated;
                            });
                        } else if (event.type === 'error') {
                            assistantContent += `\n\n[错误: ${event.message}]`;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: assistantContent,
                                };
                                return updated;
                            });
                        }
                    } catch {
                        // skip unparseable lines
                    }
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `请求失败: ${error instanceof Error ? error.message : '未知错误'}。请确认后端服务是否运行正常。`,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col -mt-24">
            {/* Messages */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar"
            >
                <div className="min-h-full flex flex-col justify-end w-full max-w-3xl mx-auto px-4 md:px-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="py-5">
                            {/* Role label */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1 rounded-md ${msg.role === 'user' ? 'bg-accent-blue/15 text-accent-blue' : 'bg-white/10 text-text-dim'}`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <span className="text-xs font-semibold tracking-wide text-text-dim uppercase">
                                    {msg.role === 'user' ? 'You' : 'AI Project Manager'}
                                </span>
                            </div>
                            {/* Content */}
                            <div className={`text-base leading-7 ${msg.role === 'user'
                                ? 'text-text-main'
                                : 'text-text-main prose prose-invert max-w-none prose-base prose-headings:text-text-main prose-p:leading-7 prose-li:leading-7 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-table:text-sm prose-th:text-left prose-td:px-3 prose-th:px-3 prose-th:py-2 prose-td:py-2 prose-table:border-separate prose-table:border-spacing-0 prose-thead:border-b prose-thead:border-white/10 prose-tr:border-b prose-tr:border-white/5'
                                }`}>
                                {msg.role === 'user' ? (
                                    msg.content
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="py-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1 rounded-md bg-white/10 text-text-dim">
                                    <Bot size={14} />
                                </div>
                                <span className="text-xs font-semibold tracking-wide text-text-dim uppercase">
                                    AI Project Manager
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-text-dim">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">正在查询项目数据...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="shrink-0 w-full max-w-3xl mx-auto px-4 md:px-6 pb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入问题，例如：有哪些延期项目？KG-006的详情？"
                        className="w-full bg-white/5 border border-border-color focus:border-accent-blue/40 rounded-xl px-5 py-3.5 pr-12 text-sm text-text-main placeholder:text-text-dim/40 outline-none transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-blue text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>

                <div className="text-[10px] font-mono text-text-dim/25 text-center mt-3">
                    RAG_ENABLED · 实时搜索73个项目文档 · DeepSeek V4 Flash
                </div>
            </div>
        </div>
    );
};

export default AiManageChat;

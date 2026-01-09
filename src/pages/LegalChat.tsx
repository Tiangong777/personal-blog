import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

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
    const API_BASE = 'http://localhost:8000';
    const createSessionId = () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };
    const [sessionId] = useState(() => {
        if (typeof window === 'undefined') return 'local';
        const existing = window.localStorage.getItem('legal_session_id');
        if (existing) return existing;
        const next = createSessionId();
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
    const [enableAdvice, setEnableAdvice] = useState(false);
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
            if (!response.ok) {
                throw new Error('Failed to load session files');
            }
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

    useEffect(() => {
        if (kbFiles.length === 0 && enableAdvice) {
            setEnableAdvice(false);
        }
    }, [kbFiles, enableAdvice]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    session_id: sessionId,
                    task: enableAdvice ? 'advice' : undefined
                }),
            });

            if (!response.ok) {
                let detail = 'Failed to get response';
                try {
                    const errData = await response.json();
                    if (errData?.detail) detail = errData.detail;
                } catch {
                    // Ignore JSON parse errors
                }
                throw new Error(detail);
            }

            const data = await response.json();
            const botMessage: Message = {
                role: 'assistant',
                content: data.answer || "I received your request, but I couldn't parse the response."
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setUploading(true);
        setKbError(null);
        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);
            Array.from(fileList).forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(`${API_BASE}/session/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            await fetchSessionFiles();
        } catch (error) {
            setKbError('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 64px)', // Full height minus navbar
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            paddingBottom: '20px'
        }}>
            <div style={{
                width: '260px',
                paddingTop: 'var(--space-xl)',
                paddingLeft: '20px',
                paddingRight: '10px'
            }}>
                <div style={{
                    marginBottom: 'var(--space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '10px'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Session Files</h3>
                </div>
                <div className="glass" style={{
                    borderRadius: '12px',
                    padding: '12px',
                    background: 'var(--bg-card)',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                }}>
                    {kbLoading && <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Loading...</div>}
                    {kbError && <div style={{ color: 'var(--accent-red)', fontSize: '0.9rem' }}>{kbError}</div>}
                    {!kbLoading && !kbError && kbFiles.length === 0 && (
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No uploaded PDFs</div>
                    )}
                    {kbFiles.map((file) => (
                        <div key={file.name} style={{
                            padding: '8px 6px',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                        }}>
                            {file.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', width: '100%', paddingTop: 'var(--space-xl)' }}>

                {/* Header */}
                <div style={{
                    marginBottom: 'var(--space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '10px'
                }}>
                    <Bot size={24} color="var(--accent-blue)" />
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>LEGAL_AI_AGENT</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Locally Deployed - v1.0.0</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="glass" style={{
                    flex: 1,
                    borderRadius: '12px',
                    marginBottom: 'var(--space-md)',
                    padding: '20px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    background: 'var(--bg-card)'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '12px',
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--glass-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {msg.role === 'user' ? <User size={18} color="#fff" /> : <Bot size={18} color="var(--accent-blue)" />}
                            </div>

                            <div style={{
                                background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--glass-bg)',
                                color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                                borderTopLeftRadius: msg.role === 'user' ? '12px' : '2px',
                                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--glass-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bot size={18} color="var(--accent-blue)" />
                            </div>
                            <div style={{
                                background: 'var(--glass-bg)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                borderTopLeftRadius: '2px',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Loader2 className="spin" size={20} color="var(--text-dim)" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask your legal question..."
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-dim)'
                    }}>
                        <input
                            type="checkbox"
                            checked={enableAdvice}
                            disabled={kbFiles.length === 0}
                            onChange={(e) => setEnableAdvice(e.target.checked)}
                        />
                        Advice mode (requires citations)
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{
                            padding: '0 14px',
                            height: '44px',
                            borderRadius: '8px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: uploading ? 0.6 : 1,
                            transition: 'opacity 0.2s',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                    </button>
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        style={{
                            padding: '0 20px',
                            borderRadius: '8px',
                            background: 'var(--accent-blue)',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isLoading || !input.trim() ? 0.6 : 1,
                            transition: 'opacity 0.2s',
                            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LegalChat;

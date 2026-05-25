import React, { useState, useEffect } from 'react';
import { LockKeyhole, Loader2, AlertTriangle } from 'lucide-react';

interface AuthGateProps {
    children: React.ReactNode;
}

const TOKEN_KEY = 'ai_manage_token';

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const [token, setToken] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        return window.sessionStorage.getItem(TOKEN_KEY) || '';
    });
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (token && !isVerified) {
            fetch('/api/ai-manage/auth/verify', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            })
            .then(r => r.json())
            .then(data => {
                if (data.valid) {
                    setIsVerified(true);
                } else {
                    sessionStorage.removeItem(TOKEN_KEY);
                    setToken('');
                }
            })
            .catch(() => {
                setIsVerified(true);
            });
        }
    }, [token, isVerified]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai-manage/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password.trim(), totp_code: totpCode.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || 'Authentication failed');
                return;
            }
            sessionStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
            setIsVerified(true);
        } catch {
            setError('无法连接到服务器，请稍后重试。');
        } finally {
            setIsLoading(false);
        }
    };

    if (token && isVerified) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <form onSubmit={handleLogin} className="glass rounded-3xl p-8 md:p-10 space-y-6 border border-white/10">
                    <div className="text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-accent/10 text-accent mb-4">
                            <LockKeyhole size={28} />
                        </div>
                        <h2 className="text-xl font-heading font-black tracking-widest text-text-primary">
                            AI_KNOWLEDGE_PORTAL
                        </h2>
                        <p className="mt-2 text-xs font-mono text-text-secondary">
                            Secure access required · Session lasts 7 days
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                            <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="block">
                            <span className="block mb-2 font-mono text-[11px] font-bold tracking-widest text-text-secondary">PASSWORD</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="输入访问密码"
                                autoFocus
                                className="w-full bg-white/5 border border-border focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 outline-none transition-all"
                            />
                        </label>
                        <label className="block">
                            <span className="block mb-2 font-mono text-[11px] font-bold tracking-widest text-text-secondary">
                                TOTP_CODE <span className="opacity-50">(optional)</span>
                            </span>
                            <input
                                type="text"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="6-digit code if enabled"
                                maxLength={6}
                                className="w-full bg-white/5 border border-border focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 outline-none transition-all"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password.trim()}
                        className="w-full flex items-center justify-center gap-3 bg-accent text-black rounded-xl py-3 font-mono text-sm font-bold tracking-widest hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(0,242,255,0.2)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
                        {isLoading ? 'VERIFYING...' : 'UNLOCK_KNOWLEDGE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthGate;

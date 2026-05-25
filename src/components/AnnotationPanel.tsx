import React, { useState } from 'react';
import { MessageSquarePlus, Loader2, CheckCircle2 } from 'lucide-react';

interface AnnotationPanelProps {
    token: string;
    entryId: string;
    entryTitle: string;
    relatedMessageId?: string;
    onAdded?: () => void;
}

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ token, entryId, entryTitle, relatedMessageId, onAdded }) => {
    const [text, setText] = useState('');
    const [annType, setAnnType] = useState('note');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/ai-manage/knowledge/entries/${entryId}/annotations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text: text.trim(), annotation_type: annType, source: 'user_chat', related_message_id: relatedMessageId || '' }),
            });
            if (res.ok) { setDone(true); setText(''); onAdded?.(); }
        } finally { setIsSubmitting(false); }
    };

    if (done) {
        return (
            <div className="flex items-center gap-2 text-xs text-green-400 p-2 bg-green-500/10 border border-green-500/20 rounded">
                <CheckCircle2 size={14} /> Annotation saved to {entryTitle}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
            <div className="flex items-center gap-2">
                <MessageSquarePlus size={14} className="text-accent-blue" />
                <span className="text-xs font-mono font-bold text-text-dim">ADD_NOTE → {entryTitle}</span>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Your note, correction, question, or idea..."
                className="w-full bg-white/5 border border-border-color rounded-lg px-3 py-2 text-xs text-text-main placeholder:text-text-dim/40 outline-none focus:border-accent-blue/50 resize-y min-h-[60px]" />
            <div className="flex items-center gap-3">
                <select value={annType} onChange={(e) => setAnnType(e.target.value)}
                    className="bg-white/5 border border-border-color rounded px-2 py-1 text-[10px] text-text-dim outline-none">
                    <option value="note">Note</option>
                    <option value="correction">Correction</option>
                    <option value="question">Question</option>
                    <option value="link">Link</option>
                </select>
                <button type="submit" disabled={isSubmitting || !text.trim()}
                    className="flex items-center gap-1 px-3 py-1 bg-accent-blue text-black rounded text-xs font-bold tracking-wide hover:opacity-90 disabled:opacity-30 transition-all">
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <MessageSquarePlus size={12} />} SAVE
                </button>
            </div>
        </form>
    );
};

export default AnnotationPanel;

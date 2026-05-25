import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, BookOpen } from 'lucide-react';

interface KnowledgeEntry {
    entry_id: string;
    title: string;
    category: string;
    description: string;
    tags_json: string;
    updated_at: string;
    source_type: string;
    annotations?: Array<{
        annotation_id: string;
        annotation_text: string;
        annotation_type: string;
        source: string;
        created_at: string;
    }>;
}

interface KnowledgeSidebarProps {
    token: string;
    onSelectEntry?: (entry: KnowledgeEntry) => void;
    onClose?: () => void;
}

const CATEGORIES = [
    { key: '', label: 'ALL' },
    { key: 'project', label: 'PROJECTS' },
    { key: 'person', label: 'PEOPLE' },
    { key: 'organization', label: 'ORGS' },
    { key: 'insight', label: 'INSIGHTS' },
    { key: 'topic', label: 'TOPICS' },
    { key: 'decision', label: 'DECISIONS' },
];

const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = ({ token, onSelectEntry, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (category) params.set('category', category);
            params.set('limit', '50');
            const res = await fetch(`/api/ai-manage/knowledge/entries?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            setEntries(data.entries || []);
            setTotal(data.total || 0);
        } finally {
            setIsLoading(false);
        }
    }, [token, search, category]);

    useEffect(() => {
        if (isOpen) fetchEntries();
    }, [isOpen, fetchEntries]);

    const handleSelect = async (entry: KnowledgeEntry) => {
        setSelectedId(entry.entry_id);
        try {
            const res = await fetch(`/api/ai-manage/knowledge/entries/${entry.entry_id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.entry) {
                setSelectedEntry(data.entry);
                onSelectEntry?.(data.entry);
                return;
            }
        } catch {}
        setSelectedEntry(entry);
        onSelectEntry?.(entry);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/5 border border-white/10 rounded-r-xl hover:bg-white/10 transition-all"
                title="Open Knowledge Browser"
            >
                <BookOpen size={18} className="text-accent-blue" />
            </button>
        );
    }

    return (
        <div className="fixed left-0 top-16 bottom-0 z-30 w-80 glass border-r border-white/10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-accent-blue" />
                    <span className="text-xs font-mono font-bold tracking-wider text-text-main">
                        KNOWLEDGE ({total})
                    </span>
                </div>
                <button onClick={() => { setIsOpen(false); onClose?.(); }} className="text-text-dim hover:text-text-main">
                    <ChevronLeft size={18} />
                </button>
            </div>

            <div className="p-3 border-b border-white/10">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input
                        type="text" value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search knowledge..."
                        className="w-full bg-white/5 border border-border-color rounded-lg pl-9 pr-3 py-2 text-xs text-text-main placeholder:text-text-dim/40 outline-none focus:border-accent-blue/50"
                    />
                </div>
            </div>

            <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`shrink-0 px-2 py-1 text-[10px] font-mono font-bold tracking-wide rounded transition-all ${
                            category === cat.key ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-dim hover:text-text-main hover:bg-white/5'
                        }`}
                    >{cat.label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 text-xs text-text-dim text-center">Loading...</div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-xs text-text-dim text-center">No entries found</div>
                ) : entries.map(entry => (
                    <button
                        key={entry.entry_id}
                        onClick={() => handleSelect(entry)}
                        className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-all ${
                            selectedId === entry.entry_id ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue' : ''
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-text-dim uppercase">{entry.category}</span>
                            <span className="text-xs text-text-main truncate font-medium">{entry.title}</span>
                        </div>
                        {entry.description && (
                            <p className="mt-1 text-[11px] text-text-dim line-clamp-2">{entry.description}</p>
                        )}
                    </button>
                ))}
            </div>

            {selectedEntry && (
                <div className="border-t border-white/10 p-4 max-h-48 overflow-y-auto">
                    <h4 className="text-sm font-bold text-text-main">{selectedEntry.title}</h4>
                    <p className="mt-1 text-xs text-text-dim leading-relaxed">{selectedEntry.description || 'No description'}</p>
                    {selectedEntry.annotations && selectedEntry.annotations.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <span className="text-[10px] font-mono font-bold text-text-dim">ANNOTATIONS</span>
                            {selectedEntry.annotations.map(ann => (
                                <div key={ann.annotation_id} className="text-[10px] text-text-dim bg-white/5 p-2 rounded border border-white/5">
                                    <span className="text-accent-blue">[{ann.annotation_type}]</span> {ann.annotation_text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KnowledgeSidebar;

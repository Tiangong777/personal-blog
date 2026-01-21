import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, DollarSign, Plus, Minus, X, Check, Trash2, Pencil } from 'lucide-react';
import { drinks, type Drink } from '../data/drinks';
import { sharedConfig, type PlannerConfig } from '../data/plannerConfig';
import { Download, RefreshCw } from 'lucide-react';

const YearEndPlanner: React.FC = () => {
    // Helper to load from local storage
    const loadState = <T,>(key: string, defaultVal: T): T => {
        try {
            const saved = localStorage.getItem(`planner_${key}`);
            return saved ? JSON.parse(saved) : defaultVal;
        } catch (e) {
            console.error(`Failed to load state for ${key}`, e);
            return defaultVal;
        }
    };

    // Generic Config
    const [title, setTitle] = useState<string>(() => loadState('title', sharedConfig.title ?? '年会筹备'));
    const [timeStr, setTimeStr] = useState<string>(() => loadState('timeStr', sharedConfig.time ?? '2月6日 下午六点开始'));
    const [location, setLocation] = useState<string>(() => loadState('location', sharedConfig.location ?? '龙山露营地 途居厅'));

    // Inputs
    const [budget, setBudget] = useState<number>(() => loadState('budget', sharedConfig.budget ?? 27345));
    const [floatRatio, setFloatRatio] = useState<number>(() => loadState('floatRatio', sharedConfig.floatRatio ?? 0));
    const [peopleDigitalCenter, setPeopleDigitalCenter] = useState<number>(() => loadState('peopleDigitalCenter', sharedConfig.peopleDigitalCenter ?? 60));
    const [peopleCommercialVehicle, setPeopleCommercialVehicle] = useState<number>(() => loadState('peopleCommercialVehicle', sharedConfig.peopleCommercialVehicle ?? 59));
    type ItbpLead = { name: string; people: number; perPerson: number; extra: number };
    const defaultItbpLeads: ItbpLead[] = [
        { name: '牛志高', people: 0, perPerson: 0, extra: 0 },
        { name: '汪亚青', people: 0, perPerson: 0, extra: 0 },
        { name: '陆旭宴', people: 0, perPerson: 0, extra: 0 },
        { name: '李昊', people: 0, perPerson: 0, extra: 0 },
        { name: '左晓海', people: 0, perPerson: 0, extra: 0 },
        { name: '张主涛', people: 0, perPerson: 0, extra: 0 },
        { name: '李云峰', people: 0, perPerson: 0, extra: 0 }
    ];
    const [itbpLeads, setItbpLeads] = useState<ItbpLead[]>(() => {
        const stored = loadState<ItbpLead[]>('itbpLeads', sharedConfig.itbpLeads ?? defaultItbpLeads);
        // If sharedConfig provides leads, we use them as is (user said "everyone from config")
        // No merging with hardcoded list unless no leads provided
        return sharedConfig.itbpLeads ?? stored;
    });
    const [peopleGuests, setPeopleGuests] = useState<number>(() => loadState('peopleGuests', sharedConfig.peopleGuests ?? 10));
    const [tableCount, setTableCount] = useState<number>(() => loadState('tableCount', sharedConfig.tableCount ?? 12));
    const [mealPrice, setMealPrice] = useState<number>(() => loadState('mealPrice', sharedConfig.mealPrice ?? 1000));
    const [activeTab, setActiveTab] = useState<Drink['category']>('Spirits');

    const [dinnerMenu, setDinnerMenu] = useState<{ title: string; items: string[] }[]>(() => loadState('dinnerMenu', sharedConfig.dinnerMenu ?? [
        {
            title: '冷菜',
            items: ['精美四冷']
        },
        {
            title: '热菜',
            items: [
                '美极鲜白条鱼',
                '白灼南美大虾',
                '地锅跑山鸡',
                '金汤羊蝎子',
                '徽州腊鲜笋',
                '黄标牛肉',
                '外婆蒸土鸡蛋',
                '山药木耳',
                '蒿子咸肉丝',
                '高山有机青菜'
            ]
        },
        {
            title: '汤类',
            items: ['酸萝卜老鸭汤（切块）']
        },
        {
            title: '甜品',
            items: ['红糖糍粑', '精美果盘', '饮料2瓶']
        }
    ]));

    // Cart: { drinkId: quantity }
    const [cart, setCart] = useState<Record<string, number>>(() => loadState('cart', sharedConfig.cart ?? {}));

    // Custom materials
    const [customMaterials, setCustomMaterials] = useState<Drink[]>(() => loadState('customMaterials', sharedConfig.customMaterials ?? []));
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');
    const [newMaterialPrice, setNewMaterialPrice] = useState('');
    // Custom prizes and edits
    const [customPrizes, setCustomPrizes] = useState<Drink[]>(() => loadState('customPrizes', sharedConfig.customPrizes ?? []));
    const [prizeEdits, setPrizeEdits] = useState<Record<string, Partial<Drink>>>(() => loadState('prizeEdits', sharedConfig.prizeEdits ?? {}));
    const [showAddPrize, setShowAddPrize] = useState(false);
    const [newPrizeName, setNewPrizeName] = useState('');
    const [newPrizePrice, setNewPrizePrice] = useState('');
    const [newPrizeSpec, setNewPrizeSpec] = useState('');
    const [newPrizeUnit, setNewPrizeUnit] = useState('');
    // Custom red envelopes and edits
    const [customRedEnvelopes, setCustomRedEnvelopes] = useState<Drink[]>(() => loadState('customRedEnvelopes', sharedConfig.customRedEnvelopes ?? []));
    const [redEnvelopeEdits, setRedEnvelopeEdits] = useState<Record<string, Partial<Drink>>>(() => loadState('redEnvelopeEdits', sharedConfig.redEnvelopeEdits ?? {}));
    const [showAddRedEnvelope, setShowAddRedEnvelope] = useState(false);
    const [newRedEnvelopeName, setNewRedEnvelopeName] = useState('');
    const [newRedEnvelopePrice, setNewRedEnvelopePrice] = useState('');
    const [newRedEnvelopeSpec, setNewRedEnvelopeSpec] = useState('');
    const [newRedEnvelopeUnit, setNewRedEnvelopeUnit] = useState('');
    // Other edits (Beer, Wine, Spirits, Materials)
    const [itemEdits, setItemEdits] = useState<Record<string, Partial<Drink>>>(() => loadState('itemEdits', sharedConfig.itemEdits ?? {}));

    // Shared editing state for ALL categories
    const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
    const [editingRewardCategory, setEditingRewardCategory] = useState<Drink['category'] | null>(null);
    const [editingRewardDraft, setEditingRewardDraft] = useState({
        name: '',
        spec: '',
        unit: '',
        price: 0,
        qty: 0
    });

    // Persistence Effects
    useEffect(() => localStorage.setItem('planner_title', JSON.stringify(title)), [title]);
    useEffect(() => localStorage.setItem('planner_timeStr', JSON.stringify(timeStr)), [timeStr]);
    useEffect(() => localStorage.setItem('planner_location', JSON.stringify(location)), [location]);
    useEffect(() => localStorage.setItem('planner_budget', JSON.stringify(budget)), [budget]);
    useEffect(() => localStorage.setItem('planner_floatRatio', JSON.stringify(floatRatio)), [floatRatio]);
    useEffect(() => localStorage.setItem('planner_peopleDigitalCenter', JSON.stringify(peopleDigitalCenter)), [peopleDigitalCenter]);
    useEffect(() => localStorage.setItem('planner_peopleCommercialVehicle', JSON.stringify(peopleCommercialVehicle)), [peopleCommercialVehicle]);
    useEffect(() => localStorage.setItem('planner_itbpLeads', JSON.stringify(itbpLeads)), [itbpLeads]);
    useEffect(() => localStorage.setItem('planner_peopleGuests', JSON.stringify(peopleGuests)), [peopleGuests]);
    useEffect(() => localStorage.setItem('planner_tableCount', JSON.stringify(tableCount)), [tableCount]);
    useEffect(() => localStorage.setItem('planner_mealPrice', JSON.stringify(mealPrice)), [mealPrice]);
    useEffect(() => localStorage.setItem('planner_dinnerMenu', JSON.stringify(dinnerMenu)), [dinnerMenu]);
    useEffect(() => localStorage.setItem('planner_cart', JSON.stringify(cart)), [cart]);
    useEffect(() => localStorage.setItem('planner_customMaterials', JSON.stringify(customMaterials)), [customMaterials]);
    useEffect(() => localStorage.setItem('planner_customPrizes', JSON.stringify(customPrizes)), [customPrizes]);
    useEffect(() => localStorage.setItem('planner_prizeEdits', JSON.stringify(prizeEdits)), [prizeEdits]);
    useEffect(() => localStorage.setItem('planner_customRedEnvelopes', JSON.stringify(customRedEnvelopes)), [customRedEnvelopes]);
    useEffect(() => localStorage.setItem('planner_redEnvelopeEdits', JSON.stringify(redEnvelopeEdits)), [redEnvelopeEdits]);
    useEffect(() => localStorage.setItem('planner_itemEdits', JSON.stringify(itemEdits)), [itemEdits]);

    // Calculations
    const mealCost = useMemo(() => tableCount * mealPrice, [tableCount, mealPrice]);
    const itbpTotals = useMemo(() => {
        return itbpLeads.reduce(
            (acc, lead) => {
                const people = Math.max(0, Number(lead.people) || 0);
                const perPerson = Math.max(0, Number(lead.perPerson) || 0);
                const extra = Math.max(0, Number(lead.extra) || 0);
                acc.people += people;
                acc.sponsorship += people * perPerson + extra;
                return acc;
            },
            { people: 0, sponsorship: 0 }
        );
    }, [itbpLeads]);
    const totalPeople = peopleDigitalCenter + peopleCommercialVehicle + itbpTotals.people + peopleGuests;

    // Effective budget with float + sponsorship
    const effectiveBudget = useMemo(() => {
        const base = budget * (1 + floatRatio / 100);
        const sponsorship = itbpTotals.sponsorship;
        return base + sponsorship;
    }, [budget, floatRatio, itbpTotals.sponsorship]);

    const perCapitaBudget = useMemo(() => totalPeople > 0 ? effectiveBudget / totalPeople : 0, [effectiveBudget, totalPeople]);

    // Merge default drinks with edits + custom items
    const allItems = useMemo(() => {
        const updated = drinks.map(item => {
            const override =
                item.category === 'Prizes'
                    ? prizeEdits[item.id]
                    : item.category === 'RedEnvelope'
                        ? redEnvelopeEdits[item.id]
                        : itemEdits[item.id];
            return override ? { ...item, ...override } : item;
        });
        return [...updated, ...customPrizes, ...customRedEnvelopes, ...customMaterials];
    }, [customMaterials, customPrizes, customRedEnvelopes, prizeEdits, redEnvelopeEdits, itemEdits]);

    const { drinksOnlyCost, prizesCost, materialsCost } = useMemo(() => {
        let dCost = 0;
        let pCost = 0;
        let mCost = 0;
        Object.entries(cart).forEach(([id, qty]) => {
            const item = allItems.find(d => d.id === id);
            if (!item) return;
            const cost = item.price * qty;
            if (['Spirits', 'Wine', 'Beer'].includes(item.category)) {
                dCost += cost;
            } else if (item.category === 'Materials') {
                mCost += cost;
            } else {
                pCost += cost;
            }
        });
        return { drinksOnlyCost: dCost, prizesCost: pCost, materialsCost: mCost };
    }, [cart, allItems]);

    const totalCost = mealCost + drinksOnlyCost + prizesCost + materialsCost;
    const remaining = effectiveBudget - totalCost;
    const budgetPercent = Math.min((totalCost / effectiveBudget) * 100, 100);

    const handleDrinkChange = (id: string, delta: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const handleAddCustomMaterial = () => {
        if (!newMaterialName.trim() || !newMaterialPrice) return;
        const price = parseFloat(newMaterialPrice);
        if (isNaN(price) || price <= 0) return;

        const newMaterial: Drink = {
            id: `custom-material-${Date.now()}`,
            category: 'Materials',
            name: newMaterialName.trim(),
            unit: '个',
            spec: '自定义',
            price: price
        };

        setCustomMaterials(prev => [...prev, newMaterial]);
        setNewMaterialName('');
        setNewMaterialPrice('');
        setShowAddMaterial(false);
    };

    const handleAddCustomRedEnvelope = () => {
        if (!newRedEnvelopeName.trim() || !newRedEnvelopePrice) return;
        const price = parseFloat(newRedEnvelopePrice);
        if (isNaN(price) || price <= 0) return;

        const newEnvelope: Drink = {
            id: `custom-red-envelope-${Date.now()}`,
            category: 'RedEnvelope',
            name: newRedEnvelopeName.trim(),
            unit: newRedEnvelopeUnit.trim() || '个',
            spec: newRedEnvelopeSpec.trim() || '现金',
            price
        };

        setCustomRedEnvelopes(prev => [...prev, newEnvelope]);
        setNewRedEnvelopeName('');
        setNewRedEnvelopePrice('');
        setNewRedEnvelopeSpec('');
        setNewRedEnvelopeUnit('');
        setShowAddRedEnvelope(false);
    };

    const handleAddCustomPrize = () => {
        if (!newPrizeName.trim() || !newPrizePrice) return;
        const price = parseFloat(newPrizePrice);
        if (isNaN(price) || price < 0) return;

        const newPrize: Drink = {
            id: `custom-prize-${Date.now()}`,
            category: 'Prizes',
            name: newPrizeName.trim(),
            unit: newPrizeUnit.trim() || '?',
            spec: newPrizeSpec.trim() || '?',
            price: price
        };

        setCustomPrizes(prev => [...prev, newPrize]);
        setNewPrizeName('');
        setNewPrizePrice('');
        setNewPrizeSpec('');
        setNewPrizeUnit('');
        setShowAddPrize(false);
    };

    const handleRemoveCustomMaterial = (id: string) => {
        setCustomMaterials(prev => prev.filter(m => m.id !== id));
        // Also remove from cart if exists
        setCart(prev => {
            const { [id]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleRemoveCustomRedEnvelope = (id: string) => {
        setCustomRedEnvelopes(prev => prev.filter(p => p.id !== id));
        setCart(prev => {
            const { [id]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleRemoveCustomPrize = (id: string) => {
        setCustomPrizes(prev => prev.filter(p => p.id !== id));
        // Also remove from cart if exists
        setCart(prev => {
            const { [id]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleStartEditReward = (item: Drink) => {
        setEditingRewardId(item.id);
        setEditingRewardCategory(item.category);
        setEditingRewardDraft({
            name: item.name,
            spec: item.spec,
            unit: item.unit,
            price: item.price,
            qty: cart[item.id] || 0
        });
    };

    const handleCancelEditReward = () => {
        setEditingRewardId(null);
        setEditingRewardCategory(null);
    };

    const handleSaveEditReward = (id: string) => {
        if (!editingRewardCategory) return;
        const name = editingRewardDraft.name.trim();
        if (!name) return;
        const price = Number(editingRewardDraft.price);
        if (isNaN(price) || price < 0) return;
        const qty = Math.max(0, Math.floor(Number(editingRewardDraft.qty)));
        if (isNaN(qty)) return;

        const updatedFields = {
            name,
            spec: editingRewardDraft.spec.trim() || '?',
            unit: editingRewardDraft.unit.trim() || '?',
            price
        };

        if (editingRewardCategory === 'Prizes') {
            if (id.startsWith('custom-prize-')) {
                setCustomPrizes(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
            } else {
                setPrizeEdits(prev => ({ ...prev, [id]: updatedFields }));
            }
        }

        if (editingRewardCategory === 'RedEnvelope') {
            if (id.startsWith('custom-red-envelope-')) {
                setCustomRedEnvelopes(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
            } else {
                setRedEnvelopeEdits(prev => ({ ...prev, [id]: updatedFields }));
            }
        }

        if (['Spirits', 'Wine', 'Beer', 'Materials'].includes(editingRewardCategory!)) {
            if (id.startsWith('custom-material-')) {
                setCustomMaterials(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
            } else {
                setItemEdits(prev => ({ ...prev, [id]: updatedFields }));
            }
        }

        setCart(prev => {
            if (qty === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: qty };
        });
        setEditingRewardId(null);
        setEditingRewardCategory(null);
    };

    const handleExportConfig = () => {
        const config: PlannerConfig = {
            title,
            time: timeStr,
            location,
            budget,
            floatRatio,
            peopleDigitalCenter,
            peopleCommercialVehicle,
            itbpLeads,
            peopleGuests,
            tableCount,
            mealPrice,
            dinnerMenu,
            cart,
            customMaterials,
            customPrizes,
            prizeEdits,
            customRedEnvelopes,
            redEnvelopeEdits,
            itemEdits
        };
        const blob = new Blob([JSON.stringify(config, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'full_planner_config.json';
        a.click();
        URL.revokeObjectURL(url);

        console.log('--- Full Planner Configuration ---');
        console.log(JSON.stringify(config, null, 4));
        alert('全量配置已生成！\n请将下载的文件发给我。');
    };

    const handleClearLocalCache = () => {
        if (confirm('确定要清除本地缓存并恢复默认配置吗？')) {
            const keys = [
                'title', 'timeStr', 'location',
                'budget', 'floatRatio', 'peopleDigitalCenter', 'peopleCommercialVehicle',
                'itbpLeads', 'peopleGuests', 'tableCount', 'mealPrice', 'dinnerMenu', 'cart',
                'customMaterials', 'customPrizes', 'prizeEdits',
                'customRedEnvelopes', 'redEnvelopeEdits', 'itemEdits'
            ];
            keys.forEach(key => localStorage.removeItem(`planner_${key}`));
            window.location.reload();
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);

    return (
        <div className="container py-8 max-w-7xl mx-auto">
            <header className="mb-12 text-center relative">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-center text-4xl md:text-5xl font-outfit font-bold mb-4 bg-transparent outline-none focus:text-accent-blue border-b border-transparent hover:border-white/10 transition-all text-gradient"
                />
                <div className="text-text-dim text-sm md:text-base space-y-2 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <span>年会时间:</span>
                        <input
                            value={timeStr}
                            onChange={(e) => setTimeStr(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-0.5 min-w-[200px] text-center"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>地点:</span>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-0.5 min-w-[200px] text-center"
                        />
                    </div>
                </div>

                {/* Developer Tools */}
                <div className="absolute top-0 right-0 flex gap-2">
                    <button
                        onClick={handleExportConfig}
                        className="p-2 glass rounded-xl text-text-dim hover:text-accent-blue transition-all"
                        title="导出配置"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={handleClearLocalCache}
                        className="p-2 glass rounded-xl text-text-dim hover:text-red-400 transition-all"
                        title="清除缓存并恢复默认"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Configuration & Summary */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                    {/* Config Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-6 rounded-3xl border-accent-blue/10"
                    >
                        <h2 className="text-xl font-bold font-outfit mb-6 flex items-center gap-2">
                            <Calculator size={20} className="text-accent-blue" />
                            基础设置
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-text-dim flex items-center gap-2">
                                    <DollarSign size={14} /> 总预算
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono focus:border-accent-blue/50 outline-none transition-all"
                                        placeholder="Base"
                                    />
                                    <div className="w-24 relative">
                                        <input
                                            type="number"
                                            value={floatRatio}
                                            onChange={(e) => setFloatRatio(Number(e.target.value))}
                                            className="w-full h-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-8 font-mono focus:border-accent-blue/50 outline-none transition-all text-center"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim">%</span>
                                    </div>
                                </div>
                                {floatRatio !== 0 && (
                                    <div className="flex justify-between text-xs px-2">
                                        <span className="text-text-dim">浮动后总额:</span>
                                        <span className="font-mono text-accent-blue font-bold">{formatCurrency(effectiveBudget)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-text-dim flex items-center gap-2">
                                        <Users size={14} /> 数信中心
                                    </label>
                                    <input
                                        type="number"
                                        value={peopleDigitalCenter}
                                        onChange={(e) => setPeopleDigitalCenter(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-text-dim flex items-center gap-2">
                                        <Users size={14} /> 商用车
                                    </label>
                                    <input
                                        type="number"
                                        value={peopleCommercialVehicle}
                                        onChange={(e) => setPeopleCommercialVehicle(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <label className="text-sm text-text-dim flex items-center gap-2">
                                        <Users size={14} /> ITBP带队明细&赞助
                                    </label>
                                    <div className="grid grid-cols-4 gap-2 text-xs text-text-dim px-1">
                                        <span>姓名</span>
                                        <span>带人数</span>
                                        <span>人均赞助</span>
                                        <span>额外赞助</span>
                                    </div>
                                    <div className="space-y-2">
                                        {itbpLeads.map((lead, index) => (
                                            <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={lead.name}
                                                    onChange={(e) => setItbpLeads(prev => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm focus:border-accent-blue/50 outline-none transition-all text-text-main"
                                                    placeholder="姓名"
                                                />
                                                <input
                                                    type="number"
                                                    value={lead.people}
                                                    onChange={(e) => setItbpLeads(prev => prev.map((item, i) => i === index ? { ...item, people: Math.max(0, Number(e.target.value)) } : item))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 font-mono text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    placeholder="0"
                                                />
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={lead.perPerson}
                                                        onChange={(e) => setItbpLeads(prev => prev.map((item, i) => i === index ? { ...item, perPerson: Math.max(0, Number(e.target.value)) } : item))}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-5 pr-2 py-1 font-mono text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-dim text-xs">¥</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={lead.extra}
                                                        onChange={(e) => setItbpLeads(prev => prev.map((item, i) => i === index ? { ...item, extra: Math.max(0, Number(e.target.value)) } : item))}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-5 pr-2 py-1 font-mono text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-dim text-xs">¥</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setItbpLeads(prev => [...prev, { name: '新人员', people: 0, perPerson: 0, extra: 0 }])}
                                            className="w-full py-1 border border-dashed border-white/10 rounded-lg text-xs text-text-dim hover:text-accent-blue hover:border-accent-blue/30 transition-all flex items-center justify-center gap-1"
                                        >
                                            <Plus size={12} /> 添加人员
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-1">
                                        <span className="text-text-dim">ITBP合计:</span>
                                        <span className="font-mono text-accent-blue font-bold">
                                            {itbpTotals.people} 人 / + {formatCurrency(itbpTotals.sponsorship)}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm text-text-dim flex items-center gap-2">
                                        <Users size={14} /> 嘉宾
                                    </label>
                                    <input
                                        type="number"
                                        value={peopleGuests}
                                        onChange={(e) => setPeopleGuests(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl text-sm text-text-dim">
                                <div className="flex justify-between items-center">
                                    <span>总人数: {totalPeople}</span>
                                    <span>建议桌数: {Math.ceil(totalPeople / 10)}</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span>人均预算:</span>
                                    <span className="font-mono text-accent-blue font-bold">{formatCurrency(perCapitaBudget)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-text-dim">桌数</label>
                                <input
                                    type="number"
                                    value={tableCount}
                                    onChange={(e) => setTableCount(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-text-dim">餐标/桌</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={mealPrice}
                                        onChange={(e) => setMealPrice(Math.max(0, Number(e.target.value)))}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                    />
                                    <span className="text-accent-blue font-bold font-mono">¥</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dashboard Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass p-6 rounded-3xl border-accent-blue/10 overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                            <div
                                className={`h-full transition-all duration-500 ${budgetPercent > 100 ? 'bg-red-500' : budgetPercent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${budgetPercent}%` }}
                            />
                        </div>

                        <h2 className="text-xl font-bold font-outfit mb-6">费用概览</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-dim">餐饮费用</span>
                                <span className="font-mono">{formatCurrency(mealCost)}</span>
                            </div>

                            {/* Drinks Section */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-dim">酒水费用</span>
                                    <span className="font-mono text-accent-blue">{formatCurrency(drinksOnlyCost)}</span>
                                </div>
                                {Object.entries(cart).length > 0 && (
                                    <div className="pl-4 border-l-2 border-white/5 space-y-1">
                                        {Object.entries(cart).map(([id, qty]) => {
                                            if (qty === 0) return null;
                                            const drink = allItems.find(d => d.id === id);
                                            if (!drink || !['Spirits', 'Wine', 'Beer'].includes(drink.category)) return null;
                                            return (
                                                <div key={id} className="flex justify-between text-xs text-text-dim">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-accent-blue">x{qty}</span>
                                                        <span>{drink.name}</span>
                                                    </div>
                                                    <span className="font-mono">{formatCurrency(drink.price * qty)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Prizes Section */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-dim">奖品费用</span>
                                    <span className="font-mono text-purple-400">{formatCurrency(prizesCost)}</span>
                                </div>
                                {Object.entries(cart).length > 0 && (
                                    <div className="pl-4 border-l-2 border-white/5 space-y-1">
                                        {Object.entries(cart).map(([id, qty]) => {
                                            if (qty === 0) return null;
                                            const drink = allItems.find(d => d.id === id);
                                            if (!drink || ['Spirits', 'Wine', 'Beer', 'Materials'].includes(drink.category)) return null;
                                            return (
                                                <div key={id} className="flex justify-between text-xs text-text-dim">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-purple-400">x{qty}</span>
                                                        <span>{drink.name}</span>
                                                    </div>
                                                    <span className="font-mono">{formatCurrency(drink.price * qty)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Materials Section */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-dim">物料费用</span>
                                    <span className="font-mono text-orange-400">{formatCurrency(materialsCost)}</span>
                                </div>
                                {Object.entries(cart).length > 0 && (
                                    <div className="pl-4 border-l-2 border-white/5 space-y-1">
                                        {Object.entries(cart).map(([id, qty]) => {
                                            if (qty === 0) return null;
                                            const drink = allItems.find(d => d.id === id);
                                            if (!drink || drink.category !== 'Materials') return null;
                                            return (
                                                <div key={id} className="flex justify-between text-xs text-text-dim">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-orange-400">x{qty}</span>
                                                        <span>{drink.name}</span>
                                                    </div>
                                                    <span className="font-mono">{formatCurrency(drink.price * qty)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/10 my-2" />

                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>总计支出</span>
                                <span className={totalCost > effectiveBudget ? 'text-red-500' : 'text-text-main'}>
                                    {formatCurrency(totalCost)}
                                </span>
                            </div>

                            <div className={`p-4 rounded-xl flex justify-between items-center ${remaining >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                <span className="text-sm font-bold tracking-wider uppercase">剩余预算</span>
                                <span className="font-mono font-bold">{formatCurrency(remaining)}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Drinks Catalogue */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass p-6 rounded-3xl border-accent-blue/10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold font-outfit">晚餐清单</h2>
                            <span className="text-sm text-text-dim">套餐合计: ¥{mealPrice}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dinnerMenu.map((section, sIndex) => (
                                <div key={sIndex} className="bg-white/5 rounded-2xl p-4 border border-white/10 group">
                                    <div className="flex items-center justify-between mb-2">
                                        <input
                                            value={section.title}
                                            onChange={(e) => setDinnerMenu(prev => prev.map((s, i) => i === sIndex ? { ...s, title: e.target.value } : s))}
                                            className="text-sm font-bold text-text-main bg-transparent outline-none focus:text-accent-blue"
                                        />
                                        <button
                                            onClick={() => setDinnerMenu(prev => prev.filter((_, i) => i !== sIndex))}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                        >
                                            <Trash2 size={12} className="text-red-400" />
                                        </button>
                                    </div>
                                    <ul className="space-y-1 text-sm text-text-dim">
                                        {section.items.map((item, iIndex) => (
                                            <li key={iIndex} className="flex items-center gap-2">
                                                <span className="text-accent-blue">-</span>
                                                <input
                                                    value={item}
                                                    onChange={(e) => setDinnerMenu(prev => prev.map((s, i) => i === sIndex ? {
                                                        ...s,
                                                        items: s.items.map((it, j) => j === iIndex ? e.target.value : it)
                                                    } : s))}
                                                    className="flex-1 bg-transparent outline-none focus:text-white"
                                                />
                                                <button
                                                    onClick={() => setDinnerMenu(prev => prev.map((s, i) => i === sIndex ? {
                                                        ...s,
                                                        items: s.items.filter((_, j) => j !== iIndex)
                                                    } : s))}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded"
                                                >
                                                    <Minus size={10} className="text-red-400" />
                                                </button>
                                            </li>
                                        ))}
                                        <li>
                                            <button
                                                onClick={() => setDinnerMenu(prev => prev.map((s, i) => i === sIndex ? { ...s, items: [...s.items, '新增菜品'] } : s))}
                                                className="text-xs text-text-dim hover:text-accent-blue flex items-center gap-1 mt-1"
                                            >
                                                <Plus size={10} /> 加菜
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ))}
                            <button
                                onClick={() => setDinnerMenu(prev => [...prev, { title: '新分类', items: ['新菜品'] }])}
                                className="border-2 border-dashed border-white/5 rounded-2xl p-4 flex items-center justify-center text-text-dim hover:text-accent-blue hover:border-accent-blue/30 transition-all opacity-50 hover:opacity-100"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </motion.div>
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {(['Spirits', 'Wine', 'Beer', 'Prizes', 'RedEnvelope', 'Materials'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all whitespace-nowrap text-sm ${activeTab === cat
                                    ? 'bg-white text-black font-bold'
                                    : 'glass text-text-dim hover:text-white'
                                    }`}
                            >
                                {cat === 'Spirits' && '白酒'}
                                {cat === 'Wine' && '红酒'}
                                {cat === 'Beer' && '啤酒'}
                                {cat === 'Prizes' && '抽奖奖品'}
                                {cat === 'RedEnvelope' && '现金红包'}
                                {cat === 'Materials' && '物料费用'}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="space-y-4">
                        {/* Add Prize Button - Only show for Prizes tab */}
                        {activeTab === 'Prizes' && (
                            <AnimatePresence>
                                {!showAddPrize ? (
                                    <motion.button
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onClick={() => setShowAddPrize(true)}
                                        className="w-full glass p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-accent-blue/50 transition-all flex items-center justify-center gap-2 text-text-dim hover:text-accent-blue"
                                    >
                                        <Plus size={20} />
                                        <span className="font-medium">添加自定义奖品</span>
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="glass p-4 rounded-2xl border-accent-blue/30"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-text-main">新增奖品</h3>
                                            <button
                                                onClick={() => {
                                                    setShowAddPrize(false);
                                                    setNewPrizeName('');
                                                    setNewPrizePrice('');
                                                    setNewPrizeSpec('');
                                                    setNewPrizeUnit('');
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <X size={18} className="text-text-dim" />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-text-dim mb-1 block">奖品名称</label>
                                                <input
                                                    type="text"
                                                    value={newPrizeName}
                                                    onChange={(e) => setNewPrizeName(e.target.value)}
                                                    placeholder="例如：特等奖奖品"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPrize()}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-text-dim mb-1 block">规格</label>
                                                    <input
                                                        type="text"
                                                        value={newPrizeSpec}
                                                        onChange={(e) => setNewPrizeSpec(e.target.value)}
                                                        placeholder="例如：1台"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-text-dim mb-1 block">单位</label>
                                                    <input
                                                        type="text"
                                                        value={newPrizeUnit}
                                                        onChange={(e) => setNewPrizeUnit(e.target.value)}
                                                        placeholder="例如：台"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-dim mb-1 block">单价 (¥)</label>
                                                <input
                                                    type="number"
                                                    value={newPrizePrice}
                                                    onChange={(e) => setNewPrizePrice(e.target.value)}
                                                    placeholder="例如：200"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPrize()}
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddCustomPrize}
                                                disabled={!newPrizeName.trim() || !newPrizePrice}
                                                className="w-full bg-accent-blue hover:bg-accent-blue/90 disabled:bg-white/10 disabled:text-text-dim text-black font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} />
                                                添加
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Add Material Button - Only show for Materials tab */}
                        {activeTab === 'Materials' && (
                            <AnimatePresence>
                                {!showAddMaterial ? (
                                    <motion.button
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onClick={() => setShowAddMaterial(true)}
                                        className="w-full glass p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-accent-blue/50 transition-all flex items-center justify-center gap-2 text-text-dim hover:text-accent-blue"
                                    >
                                        <Plus size={20} />
                                        <span className="font-medium">添加自定义物料</span>
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="glass p-4 rounded-2xl border-accent-blue/30"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-text-main">添加自定义物料</h3>
                                            <button
                                                onClick={() => {
                                                    setShowAddMaterial(false);
                                                    setNewMaterialName('');
                                                    setNewMaterialPrice('');
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <X size={18} className="text-text-dim" />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-text-dim mb-1 block">物料名称</label>
                                                <input
                                                    type="text"
                                                    value={newMaterialName}
                                                    onChange={(e) => setNewMaterialName(e.target.value)}
                                                    placeholder="例如:桌面双人足球"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMaterial()}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-dim mb-1 block">单价 (¥)</label>
                                                <input
                                                    type="number"
                                                    value={newMaterialPrice}
                                                    onChange={(e) => setNewMaterialPrice(e.target.value)}
                                                    placeholder="例如:40"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMaterial()}
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddCustomMaterial}
                                                disabled={!newMaterialName.trim() || !newMaterialPrice}
                                                className="w-full bg-accent-blue hover:bg-accent-blue/90 disabled:bg-white/10 disabled:text-text-dim text-black font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} />
                                                确认添加
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Add Red Envelope Button - Only show for RedEnvelope tab */}
                        {activeTab === 'RedEnvelope' && (
                            <AnimatePresence>
                                {!showAddRedEnvelope ? (
                                    <motion.button
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onClick={() => setShowAddRedEnvelope(true)}
                                        className="w-full glass p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-accent-blue/50 transition-all flex items-center justify-center gap-2 text-text-dim hover:text-accent-blue"
                                    >
                                        <Plus size={20} />
                                        <span className="font-medium">新增现金红包</span>
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="glass p-4 rounded-2xl border-accent-blue/30"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-text-main">自定义红包</h3>
                                            <button
                                                onClick={() => {
                                                    setShowAddRedEnvelope(false);
                                                    setNewRedEnvelopeName('');
                                                    setNewRedEnvelopePrice('');
                                                    setNewRedEnvelopeSpec('');
                                                    setNewRedEnvelopeUnit('');
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <X size={18} className="text-text-dim" />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-text-dim mb-1 block">红包名称</label>
                                                    <input
                                                        type="text"
                                                        value={newRedEnvelopeName}
                                                        onChange={(e) => setNewRedEnvelopeName(e.target.value)}
                                                        placeholder="例:188元红包"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomRedEnvelope()}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-text-dim mb-1 block">金额 (元)</label>
                                                    <input
                                                        type="number"
                                                        value={newRedEnvelopePrice}
                                                        onChange={(e) => setNewRedEnvelopePrice(e.target.value)}
                                                        placeholder="例:188"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomRedEnvelope()}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-text-dim mb-1 block">规格</label>
                                                    <input
                                                        type="text"
                                                        value={newRedEnvelopeSpec}
                                                        onChange={(e) => setNewRedEnvelopeSpec(e.target.value)}
                                                        placeholder="例:现金"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-text-dim mb-1 block">单位</label>
                                                    <input
                                                        type="text"
                                                        value={newRedEnvelopeUnit}
                                                        onChange={(e) => setNewRedEnvelopeUnit(e.target.value)}
                                                        placeholder="例:个"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleAddCustomRedEnvelope}
                                                disabled={!newRedEnvelopeName.trim() || !newRedEnvelopePrice}
                                                className="w-full bg-accent-blue hover:bg-accent-blue/90 disabled:bg-white/10 disabled:text-text-dim text-black font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} />
                                                添加红包
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode='popLayout'>
                                {allItems.filter(d => d.category === activeTab).map((drink) => {
                                    const isCustomMaterial = drink.id.startsWith('custom-material-');
                                    const isCustomPrize = drink.id.startsWith('custom-prize-');
                                    const isCustomRedEnvelope = drink.id.startsWith('custom-red-envelope-');
                                    const isPrize = drink.category === 'Prizes';
                                    const isRedEnvelope = drink.category === 'RedEnvelope';
                                    const isEditableReward = isPrize || isRedEnvelope;
                                    const isEditingReward = isEditableReward && editingRewardId === drink.id;
                                    return (
                                        <motion.div
                                            key={drink.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`glass p-4 rounded-2xl flex items-center justify-between group transition-all ${(cart[drink.id] || 0) > 0 ? 'border-accent-blue/30 bg-accent-blue/5' : 'border-white/5'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-2">
                                                    {isEditingReward ? (
                                                        <input
                                                            type="text"
                                                            value={editingRewardDraft.name}
                                                            onChange={(e) => setEditingRewardDraft(prev => ({ ...prev, name: e.target.value }))}
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm focus:border-accent-blue/50 outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <h3 className="font-bold text-text-main truncate group-hover:text-accent-blue transition-colors">
                                                            {drink.name}
                                                        </h3>
                                                    )}
                                                    {isCustomMaterial && (
                                                        <button
                                                            onClick={() => handleRemoveCustomMaterial(drink.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                                            title="删除自定义物料"
                                                        >
                                                            <Trash2 size={14} className="text-red-400" />
                                                        </button>
                                                    )}
                                                    {isCustomPrize && (
                                                        <button
                                                            onClick={() => handleRemoveCustomPrize(drink.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                                            title="删除自定义奖品"
                                                        >
                                                            <Trash2 size={14} className="text-red-400" />
                                                        </button>
                                                    )}
                                                    {isCustomRedEnvelope && (
                                                        <button
                                                            onClick={() => handleRemoveCustomRedEnvelope(drink.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                                            title="删除自定义红包"
                                                        >
                                                            <Trash2 size={14} className="text-red-400" />
                                                        </button>
                                                    )}
                                                    {!isEditingReward && (
                                                        <button
                                                            onClick={() => handleStartEditReward(drink)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                                            title="编辑此项"
                                                        >
                                                            <Pencil size={14} className="text-text-dim" />
                                                        </button>
                                                    )}
                                                </div>
                                                {isEditingReward ? (
                                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            value={editingRewardDraft.spec}
                                                            onChange={(e) => setEditingRewardDraft(prev => ({ ...prev, spec: e.target.value }))}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:border-accent-blue/50 outline-none transition-all"
                                                            placeholder="规格"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editingRewardDraft.unit}
                                                            onChange={(e) => setEditingRewardDraft(prev => ({ ...prev, unit: e.target.value }))}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:border-accent-blue/50 outline-none transition-all"
                                                            placeholder="单位"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={editingRewardDraft.price}
                                                            onChange={(e) => setEditingRewardDraft(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                            placeholder="单价"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={editingRewardDraft.qty}
                                                            onChange={(e) => setEditingRewardDraft(prev => ({ ...prev, qty: Number(e.target.value) }))}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                            placeholder="数量"
                                                            min={0}
                                                            step={1}
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleSaveEditReward(drink.id)}
                                                                className="p-1.5 rounded-lg bg-accent-blue text-black hover:bg-accent-blue/90 transition-colors"
                                                                title="保存"
                                                                disabled={!editingRewardDraft.name.trim()}
                                                            >
                                                                <Check size={12} />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEditReward}
                                                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                                                title="取消"
                                                            >
                                                                <X size={12} className="text-text-dim" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 mt-1 text-sm">
                                                        <span className="text-text-dim font-mono">{drink.spec}</span>
                                                        <span className="text-white/30"> / </span>
                                                        <span className="text-accent-blue font-mono font-bold">¥{drink.price}</span>
                                                        <span className="text-xs text-white/20 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                                                            {drink.unit}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
                                                <button
                                                    onClick={() => handleDrinkChange(drink.id, -1)}
                                                    className={`p-2 rounded-lg transition-colors ${!cart[drink.id] ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-text-dim'
                                                        }`}
                                                    disabled={!cart[drink.id]}
                                                >
                                                    <Minus size={14} />
                                                </button>

                                                <input
                                                    type="number"
                                                    value={cart[drink.id] || ''}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (isNaN(val)) {
                                                            // Allow clearing input (effectively 0)
                                                            handleDrinkChange(drink.id, -1 * (cart[drink.id] || 0));
                                                        } else {
                                                            const diff = Math.max(0, val) - (cart[drink.id] || 0);
                                                            handleDrinkChange(drink.id, diff);
                                                        }
                                                    }}
                                                    className="w-12 bg-transparent text-center font-mono text-sm font-bold outline-none text-white focus:text-accent-blue placeholder-white/20"
                                                    placeholder="0"
                                                />

                                                <button
                                                    onClick={() => handleDrinkChange(drink.id, 1)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearEndPlanner;

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, DollarSign, Plus, Minus } from 'lucide-react';
import { drinks, type Drink } from '../data/drinks';

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

    // Inputs
    const [budget, setBudget] = useState<number>(() => loadState('budget', 27345));
    const [floatRatio, setFloatRatio] = useState<number>(() => loadState('floatRatio', 0));
    const [peopleDigitalCenter, setPeopleDigitalCenter] = useState<number>(() => loadState('peopleDigitalCenter', 60));
    const [peopleCommercialVehicle, setPeopleCommercialVehicle] = useState<number>(() => loadState('peopleCommercialVehicle', 59));
    const [peopleITBP, setPeopleITBP] = useState<number>(() => loadState('peopleITBP', 8));
    const [itbpSponsorship, setItbpSponsorship] = useState<number>(() => loadState('itbpSponsorship', 0));
    const [peopleGuests, setPeopleGuests] = useState<number>(() => loadState('peopleGuests', 10));
    const [tableCount, setTableCount] = useState<number>(() => loadState('tableCount', 12));
    const [mealPrice, setMealPrice] = useState<1000 | 1200 | 1500>(() => loadState('mealPrice', 1000));
    const [activeTab, setActiveTab] = useState<Drink['category']>('Spirits');

    // Cart: { drinkId: quantity }
    const [cart, setCart] = useState<Record<string, number>>(() => loadState('cart', {}));

    // Persistence Effects
    useEffect(() => localStorage.setItem('planner_budget', JSON.stringify(budget)), [budget]);
    useEffect(() => localStorage.setItem('planner_floatRatio', JSON.stringify(floatRatio)), [floatRatio]);
    useEffect(() => localStorage.setItem('planner_peopleDigitalCenter', JSON.stringify(peopleDigitalCenter)), [peopleDigitalCenter]);
    useEffect(() => localStorage.setItem('planner_peopleCommercialVehicle', JSON.stringify(peopleCommercialVehicle)), [peopleCommercialVehicle]);
    useEffect(() => localStorage.setItem('planner_peopleITBP', JSON.stringify(peopleITBP)), [peopleITBP]);
    useEffect(() => localStorage.setItem('planner_itbpSponsorship', JSON.stringify(itbpSponsorship)), [itbpSponsorship]);
    useEffect(() => localStorage.setItem('planner_peopleGuests', JSON.stringify(peopleGuests)), [peopleGuests]);
    useEffect(() => localStorage.setItem('planner_tableCount', JSON.stringify(tableCount)), [tableCount]);
    useEffect(() => localStorage.setItem('planner_mealPrice', JSON.stringify(mealPrice)), [mealPrice]);
    useEffect(() => localStorage.setItem('planner_cart', JSON.stringify(cart)), [cart]);

    // Calculations
    const mealCost = useMemo(() => tableCount * mealPrice, [tableCount, mealPrice]);
    const totalPeople = peopleDigitalCenter + peopleCommercialVehicle + peopleITBP + peopleGuests;

    // Effective budget with float + sponsorship
    const effectiveBudget = useMemo(() => {
        const base = budget * (1 + floatRatio / 100);
        const sponsorship = peopleITBP * itbpSponsorship;
        return base + sponsorship;
    }, [budget, floatRatio, peopleITBP, itbpSponsorship]);

    const perCapitaBudget = useMemo(() => totalPeople > 0 ? effectiveBudget / totalPeople : 0, [effectiveBudget, totalPeople]);

    const { drinksOnlyCost, prizesCost } = useMemo(() => {
        let dCost = 0;
        let pCost = 0;
        Object.entries(cart).forEach(([id, qty]) => {
            const drink = drinks.find(d => d.id === id);
            if (!drink) return;
            const cost = drink.price * qty;
            if (['Spirits', 'Wine', 'Beer'].includes(drink.category)) {
                dCost += cost;
            } else {
                pCost += cost;
            }
        });
        return { drinksOnlyCost: dCost, prizesCost: pCost };
    }, [cart]);

    const totalCost = mealCost + drinksOnlyCost + prizesCost;
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

    const formatCurrency = (val: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);

    return (
        <div className="container py-8 max-w-7xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-outfit font-bold mb-4 text-gradient">年会筹备</h1>
                <p className="text-text-dim">精准规划您的年度盛典</p>
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
                                        <Users size={14} /> ITBP (人数 & 人均赞助)
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <span className="text-xs text-text-dim">人数</span>
                                            <input
                                                type="number"
                                                value={peopleITBP}
                                                onChange={(e) => setPeopleITBP(Math.max(0, Number(e.target.value)))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                placeholder="人数"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-xs text-text-dim">人均赞助</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={itbpSponsorship}
                                                    onChange={(e) => setItbpSponsorship(Math.max(0, Number(e.target.value)))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-6 pr-2 py-2 font-mono focus:border-accent-blue/50 outline-none transition-all"
                                                    placeholder="0"
                                                />
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim text-xs">¥</span>
                                            </div>
                                        </div>
                                    </div>
                                    {itbpSponsorship > 0 && (
                                        <div className="flex justify-between items-center text-xs pt-1">
                                            <span className="text-text-dim">赞助小计:</span>
                                            <span className="font-mono text-accent-blue font-bold">+ {formatCurrency(peopleITBP * itbpSponsorship)}</span>
                                        </div>
                                    )}
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
                                <div className="grid grid-cols-3 gap-2">
                                    {[1000, 1200, 1500].map((price) => (
                                        <button
                                            key={price}
                                            onClick={() => setMealPrice(price as any)}
                                            className={`py-2 rounded-xl text-sm font-medium transition-all ${mealPrice === price
                                                ? 'bg-accent-blue text-black shadow-lg shadow-accent-blue/20'
                                                : 'bg-white/5 text-text-dim hover:bg-white/10'
                                                }`}
                                        >
                                            ¥{price}
                                        </button>
                                    ))}
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
                                            const drink = drinks.find(d => d.id === id);
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
                                            const drink = drinks.find(d => d.id === id);
                                            if (!drink || ['Spirits', 'Wine', 'Beer'].includes(drink.category)) return null;
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
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {(['Spirits', 'Wine', 'Beer', 'Prizes', 'RedEnvelope'] as const).map((cat) => (
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
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {drinks.filter(d => d.category === activeTab).map((drink) => (
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
                                        <h3 className="font-bold text-text-main truncate group-hover:text-accent-blue transition-colors">
                                            {drink.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                            <span className="text-text-dim font-mono">{drink.spec}</span>
                                            <span className="text-white/30">•</span>
                                            <span className="text-accent-blue font-mono font-bold">¥{drink.price}</span>
                                            <span className="text-xs text-white/20 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                                                {drink.unit}
                                            </span>
                                        </div>
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
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearEndPlanner;

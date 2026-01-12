import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, DollarSign, Wine, Beer, Martini, Plus, Minus } from 'lucide-react';
import { drinks } from '../data/drinks';

const YearEndPlanner: React.FC = () => {
    // Inputs
    const [budget, setBudget] = useState<number>(27345);
    const [floatRatio, setFloatRatio] = useState<number>(0);
    const [peopleDigitalCenter, setPeopleDigitalCenter] = useState<number>(60);
    const [peopleCommercialVehicle, setPeopleCommercialVehicle] = useState<number>(59);
    const [tableCount, setTableCount] = useState<number>(12);
    const [mealPrice, setMealPrice] = useState<1000 | 1200 | 1500>(1200);
    const [activeTab, setActiveTab] = useState<'Spirits' | 'Wine' | 'Beer'>('Spirits');

    // Cart: { drinkId: quantity }
    const [cart, setCart] = useState<Record<string, number>>({});

    // Calculations
    const mealCost = useMemo(() => tableCount * mealPrice, [tableCount, mealPrice]);
    const totalPeople = peopleDigitalCenter + peopleCommercialVehicle;

    // Effective budget with float
    const effectiveBudget = useMemo(() => budget * (1 + floatRatio / 100), [budget, floatRatio]);

    const drinksCost = useMemo(() => {
        return Object.entries(cart).reduce((total, [id, qty]) => {
            const drink = drinks.find(d => d.id === id);
            return total + (drink ? drink.price * qty : 0);
        }, 0);
    }, [cart]);

    const totalCost = mealCost + drinksCost;
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
                            </div>

                            <div className="flex justify-between items-center px-2 py-1 bg-white/5 rounded-lg text-xs text-text-dim">
                                <span>总人数: {totalPeople}</span>
                                <span>建议桌数: {Math.ceil(totalPeople / 10)}</span>
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
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-dim">酒水费用</span>
                                <span className="font-mono text-accent-blue">{formatCurrency(drinksCost)}</span>
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
                        {(['Spirits', 'Wine', 'Beer'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === cat
                                    ? 'bg-white text-black font-bold'
                                    : 'glass text-text-dim hover:text-white'
                                    }`}
                            >
                                {cat === 'Spirits' && <Martini size={18} />}
                                {cat === 'Wine' && <Wine size={18} />}
                                {cat === 'Beer' && <Beer size={18} />}
                                {cat === 'Spirits' ? '白酒' : cat === 'Wine' ? '红酒' : '啤酒'}
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

                                    <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-xl">
                                        <button
                                            onClick={() => handleDrinkChange(drink.id, -1)}
                                            className={`p-1.5 rounded-lg transition-colors ${!cart[drink.id] ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-text-dim'
                                                }`}
                                            disabled={!cart[drink.id]}
                                        >
                                            <Minus size={14} />
                                        </button>

                                        <span className={`font-mono w-6 text-center text-sm font-bold ${cart[drink.id] ? 'text-white' : 'text-white/30'
                                            }`}>
                                            {cart[drink.id] || 0}
                                        </span>

                                        <button
                                            onClick={() => handleDrinkChange(drink.id, 1)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
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

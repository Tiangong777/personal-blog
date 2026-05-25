import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  ExternalLink,
  LineChart,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const STOCK_APP_URL = 'https://stock.tiangong777.cn/';
const STOCK_HEALTH_URL = 'https://stock.tiangong777.cn/api/health';

const signals = [
  { label: 'DSA_WEBUI', value: 'ONLINE', icon: Activity },
  { label: 'HOST', value: 'CLOUD_PROXY', icon: Server },
  { label: 'ACCESS', value: 'HTTPS', icon: ShieldCheck },
];

const StockPortal: React.FC = () => {
  return (
    <div className="container py-8 md:py-16">
      <section className="relative overflow-hidden border border-accent/20 bg-glass-bg backdrop-blur-xl px-6 py-10 shadow-lg md:px-10 md:py-14">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute right-6 top-6 hidden text-accent/20 md:block">
          <LineChart size={180} strokeWidth={1} />
        </div>

        <div className="relative max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 border border-green-500/20 bg-green-500/10 px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-green-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            STOCK_SERVICE_LIVE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="font-heading text-4xl font-black tracking-widest text-text-primary md:text-6xl"
          >
            STOCK<span className="text-accent">_</span>TERMINAL
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mt-5 max-w-2xl text-base leading-8 text-text-secondary md:text-lg"
          >
            Quant dashboard is running on your cloud server. The blog keeps the fast static shell, and the stock system stays on its dedicated secure endpoint.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href={STOCK_APP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-accent px-5 py-3 font-mono text-sm font-black tracking-widest text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--accent-glow)]"
            >
              OPEN_STOCK_WEBUI
              <ExternalLink size={18} />
            </a>
            <a
              href={STOCK_HEALTH_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-accent/25 bg-accent/5 px-5 py-3 font-mono text-sm font-bold tracking-widest text-accent transition-all hover:bg-accent/10"
            >
              API_HEALTH
              <ArrowUpRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {signals.map(({ label, value, icon: Icon }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + index * 0.08 }}
            className="card flex min-h-28 items-center justify-between border-accent/10 p-5"
          >
            <div>
              <p className="font-mono text-[11px] font-bold tracking-widest text-text-secondary">{label}</p>
              <p className="mt-2 font-heading text-xl font-black tracking-wider text-text-primary">{value}</p>
            </div>
            <div className="border border-accent/20 bg-accent/10 p-3 text-accent">
              <Icon size={24} />
            </div>
          </motion.div>
        ))}
      </section>

      <section className="mt-8 border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="border border-accent/20 bg-accent/10 p-3 text-accent">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-black tracking-widest text-text-primary">QUANT_WORKBENCH</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
                Personal blog and stock analysis now share the same cloud entry, while the heavy dashboard remains isolated behind its own subdomain.
              </p>
            </div>
          </div>
          <div className="font-mono text-xs font-bold tracking-widest text-accent">
            stock.tiangong777.cn
          </div>
        </div>
      </section>
    </div>
  );
};

export default StockPortal;

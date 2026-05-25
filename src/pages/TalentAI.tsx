import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Loader2,
  LockKeyhole,
  Send,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';

type TalentCandidate = {
  name?: string;
  resume_id?: string;
  profile?: Record<string, unknown>;
};

type TalentEvaluation = {
  evaluation_id: string;
  candidate: TalentCandidate;
  obsidian_sync?: {
    status?: string;
    candidate_note_relative_path?: string;
    error?: string;
    reason?: string;
  };
  score: number;
  recommended: boolean;
  recommendation_reason: string;
  dimension_scores: Record<string, number>;
  highlights: string[];
  risk_notes: string[];
  original_filename: string;
};

const TALENT_API_BASE = (import.meta.env.VITE_TALENT_API_BASE || '/api/talent').replace(/\/$/, '');
const TOKEN_STORAGE_KEY = 'talent_ai_access_token';
const MAX_RESUME_BYTES = 8 * 1024 * 1024;

const dimensionLabels: Record<string, string> = {
  skill_match: '技能匹配',
  experience_match: '经历匹配',
  location_salary_match: '地点/薪资',
  activity_industry: '活跃度/行业',
  level_fit: '层级适配',
};

const TalentAI: React.FC = () => {
  const [accessToken, setAccessToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [evaluation, setEvaluation] = useState<TalentEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [decision, setDecision] = useState<'通过' | '不过' | '待反馈'>('通过');
  const [rating, setRating] = useState('4');
  const [reasonText, setReasonText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const saveToken = (nextToken: string) => {
    setAccessToken(nextToken);
    if (typeof window !== 'undefined') {
      if (nextToken) window.sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      else window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0] || null;
    if (!file) {
      setResumeFile(null);
      return;
    }
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!['.pdf', '.docx'].includes(extension)) {
      setResumeFile(null);
      setError('第一版只支持文字版 PDF 或 DOCX 简历。');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeFile(null);
      setError('简历文件不能超过 8MB。');
      return;
    }
    setResumeFile(file);
  };

  const handleEvaluate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFeedbackStatus(null);

    if (!accessToken.trim()) {
      setError('请先输入 TALENT_AI 访问口令。');
      return;
    }
    if (!resumeFile) {
      setError('请上传一份 PDF 或 DOCX 简历。');
      return;
    }
    if (!jdText.trim()) {
      setError('请粘贴岗位 JD，AI 需要用它来做匹配评分。');
      return;
    }

    setIsEvaluating(true);
    try {
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('jd_text', jdText);
      formData.append('access_token', accessToken.trim());

      const response = await fetch(`${TALENT_API_BASE}/evaluate`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || '评分失败，请稍后重试。');
      }
      setEvaluation(data as TalentEvaluation);
      setReasonText('');
      setDecision((data as TalentEvaluation).recommended ? '通过' : '待反馈');
    } catch (err) {
      setError(err instanceof Error ? err.message : '评分失败，请稍后重试。');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!evaluation) return;
    setError(null);
    setFeedbackStatus(null);
    setIsSubmittingFeedback(true);

    try {
      const formData = new FormData();
      formData.append('evaluation_id', evaluation.evaluation_id);
      formData.append('decision', decision);
      formData.append('reason_text', reasonText);
      formData.append('rating', rating);
      formData.append('access_token', accessToken.trim());

      const response = await fetch(`${TALENT_API_BASE}/feedback`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || '反馈保存失败。');
      }
      setFeedbackStatus(`反馈已保存：${data.feedback_id || 'saved'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '反馈保存失败。');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="container py-8 md:py-14">
      <section className="relative overflow-hidden border border-accent/20 bg-glass-bg px-6 py-8 shadow-lg backdrop-blur-xl md:px-10 md:py-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-green-500/10 blur-[120px]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 border border-green-500/20 bg-green-500/10 px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-green-500"
            >
              <ShieldCheck size={14} />
              PRIVATE_RECRUITMENT_NODE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="font-heading text-4xl font-black tracking-widest text-text-primary md:text-6xl"
            >
              TALENT<span className="text-accent">_</span>AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 max-w-3xl text-sm leading-8 text-text-secondary md:text-base"
            >
              上传文字版 PDF/DOCX 简历，粘贴岗位 JD，由云端招聘 AI 做解析、评分和推荐判断。原文件、解析文本、评分结果和你的人工反馈都会进入招聘 AI 的本地留档。
            </motion.p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono text-[10px] font-bold tracking-widest text-text-secondary">
            {['PDF_DOCX', 'TOKEN_GATED', 'SQLITE_ARCHIVE'].map((item) => (
              <div key={item} className="border border-white/10 bg-white/[0.03] px-3 py-4">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          onSubmit={handleEvaluate}
          className="card space-y-6 p-5 md:p-7"
        >
          <PanelTitle icon={LockKeyhole} title="INPUT_CONSOLE" subtitle="口令、简历和岗位需求" />

          <label className="block">
            <span className="mb-2 block font-mono text-[11px] font-bold tracking-widest text-text-secondary">ACCESS_TOKEN</span>
            <input
              type="password"
              value={accessToken}
              onChange={(event) => saveToken(event.target.value)}
              placeholder="输入 TALENT_AI 访问口令"
              className="w-full border border-border bg-white/5 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/40 focus:border-accent/50"
            />
          </label>

          <label className="group flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-accent/25 bg-accent/5 p-6 text-center transition-all hover:border-accent/50 hover:bg-accent/10">
            <Upload className="mb-4 text-accent" size={28} />
            <span className="font-heading text-lg font-black tracking-wider text-text-primary">
              {resumeFile ? resumeFile.name : 'UPLOAD_RESUME'}
            </span>
            <span className="mt-2 text-xs leading-6 text-text-secondary">支持文字版 PDF / DOCX，最大 8MB。不支持扫描件 OCR。</span>
            <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[11px] font-bold tracking-widest text-text-secondary">JOB_DESCRIPTION</span>
            <textarea
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              placeholder="粘贴岗位职责、任职要求、工作地点、薪资范围等 JD 信息..."
              className="min-h-64 w-full resize-y border border-border bg-white/5 px-4 py-3 text-sm leading-7 text-text-primary outline-none transition-all placeholder:text-text-secondary/40 focus:border-accent/50"
            />
          </label>

          {error && (
            <div className="flex items-start gap-3 border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isEvaluating}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-accent px-5 py-3 font-mono text-sm font-black tracking-widest text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--accent-glow)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isEvaluating ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            {isEvaluating ? 'EVALUATING_RESUME...' : 'RUN_AI_EVALUATION'}
          </button>
        </motion.form>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card min-h-[640px] p-5 md:p-7"
        >
          <PanelTitle icon={BadgeCheck} title="MATCH_REPORT" subtitle="推荐结论、维度分和人工反馈" />

          {!evaluation ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center border border-white/10 bg-white/[0.02] p-8 text-center">
              <FileText size={44} className="mb-5 text-accent/70" />
              <h2 className="font-heading text-2xl font-black tracking-widest text-text-primary">等待简历评分</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-text-secondary">
                完成左侧输入后，这里会展示总分、推荐结论、五个维度、亮点、风险以及反馈入口。
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="flex flex-col items-center justify-center border border-accent/20 bg-accent/5 p-5">
                  <div
                    className="grid h-32 w-32 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--accent) ${Math.max(0, Math.min(100, evaluation.score))}%, rgba(255,255,255,0.08) 0)`,
                    }}
                  >
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-bg-base">
                      <span className="font-heading text-4xl font-black text-text-primary">{Math.round(evaluation.score)}</span>
                    </div>
                  </div>
                  <div className="mt-4 font-mono text-[10px] font-bold tracking-widest text-text-secondary">OVERALL_SCORE</div>
                </div>

                <div className="border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-heading text-2xl font-black tracking-wider text-text-primary">
                      {evaluation.candidate?.name || '候选人'}
                    </span>
                    <span className={`inline-flex items-center gap-2 border px-3 py-1 font-mono text-[10px] font-bold tracking-widest ${
                      evaluation.recommended
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
                    }`}
                    >
                      {evaluation.recommended ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {evaluation.recommended ? 'RECOMMENDED' : 'REVIEW_REQUIRED'}
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-[11px] text-text-secondary">{evaluation.original_filename}</p>
                  {evaluation.obsidian_sync && (
                    <p className="mt-2 font-mono text-[11px] text-text-secondary">
                      OBSIDIAN_SYNC: <span className="text-accent">{evaluation.obsidian_sync.status || 'unknown'}</span>
                      {evaluation.obsidian_sync.candidate_note_relative_path
                        ? ` / ${evaluation.obsidian_sync.candidate_note_relative_path}`
                        : ''}
                    </p>
                  )}
                  <p className="mt-5 text-sm leading-7 text-text-primary">{evaluation.recommendation_reason || '暂无推荐理由。'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(evaluation.dimension_scores || {}).map(([key, value]) => (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between font-mono text-[11px] font-bold tracking-widest">
                      <span className="text-text-secondary">{dimensionLabels[key] || key}</span>
                      <span className="text-accent">{Math.round(value)}</span>
                    </div>
                    <div className="h-2 bg-white/10">
                      <div className="h-full bg-accent shadow-[0_0_16px_var(--accent-glow)]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SignalList title="HIGHLIGHTS" items={evaluation.highlights} positive />
                <SignalList title="RISK_NOTES" items={evaluation.risk_notes} />
              </div>

              <form onSubmit={handleFeedback} className="border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl font-black tracking-widest text-text-primary">MANAGER_FEEDBACK</h3>
                    <p className="mt-1 text-xs text-text-secondary">你的判断会写入招聘 AI 反馈表，用于后续复盘。</p>
                  </div>
                  <Send size={20} className="text-accent" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['通过', '不过', '待反馈'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDecision(item)}
                      className={`border px-3 py-2 font-mono text-xs font-bold tracking-widest transition-all ${
                        decision === item
                          ? 'border-accent bg-accent text-black'
                          : 'border-white/10 bg-white/[0.03] text-text-secondary hover:border-accent/40 hover:text-text-primary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                  <label>
                    <span className="mb-2 block font-mono text-[10px] font-bold tracking-widest text-text-secondary">RATING</span>
                    <select
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      className="w-full border border-border bg-bg-base px-3 py-3 text-sm text-text-primary outline-none focus:border-accent/50"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block font-mono text-[10px] font-bold tracking-widest text-text-secondary">NOTES</span>
                    <input
                      value={reasonText}
                      onChange={(event) => setReasonText(event.target.value)}
                      placeholder="例如：项目经验匹配，可以约一面；或：行业经验不足..."
                      className="w-full border border-border bg-white/5 px-3 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary/40 focus:border-accent/50"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-accent/30 bg-accent/10 px-4 py-3 font-mono text-xs font-black tracking-widest text-accent transition-all hover:bg-accent/20 disabled:opacity-50"
                >
                  {isSubmittingFeedback ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  SAVE_FEEDBACK
                </button>

                {feedbackStatus && (
                  <div className="mt-3 border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                    {feedbackStatus}
                  </div>
                )}
              </form>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

function PanelTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border pb-5">
      <div className="border border-accent/20 bg-accent/10 p-3 text-accent">
        <Icon size={22} />
      </div>
      <div>
        <h2 className="font-heading text-xl font-black tracking-widest text-text-primary">{title}</h2>
        <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
      </div>
    </div>
  );
}

function SignalList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  const safeItems = items?.length ? items : ['暂无'];
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <h3 className="mb-4 font-mono text-[11px] font-bold tracking-widest text-text-secondary">{title}</h3>
      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-text-primary">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${positive ? 'bg-green-400' : 'bg-yellow-300'}`} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TalentAI;

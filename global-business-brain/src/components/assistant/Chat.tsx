'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssistantMessage, AssistantReply, Citation } from '@/lib/domain/types';
import { SCENARIO_LABELS } from '@/lib/domain/taxonomy';
import { formatMoney } from '@/lib/finance/format';
import { apiFetch } from '@/lib/client/api';
import { Button } from '@/components/ui/Button';
import { CitationList } from '@/components/ui/Evidence';
import { Notice } from '@/components/ui/Notice';
import { cx } from '@/components/ui/cx';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  reply?: AssistantReply;
}

const SUGGESTIONS = [
  'Pse kjo ide ka kuptim këtu?',
  'Ma përshtat me kapital më të vogël.',
  'Krahasoje me një shtet tjetër, p.sh. Kosova.',
  'Çfarë duhet të verifikoj sot?',
  'Çfarë ndodh nëse kostot rriten 20%?',
  'Cili supozim është më i dobëti?',
];

/** Renders "[c1]" markers as superscript references to the citation list below the answer. */
function withRefs(text: string, citations: Citation[]) {
  const parts = text.split(/(\[c\d+\])/g);
  return parts.map((p, i) => {
    const m = /^\[c(\d+)\]$/.exec(p);
    if (!m) return <span key={i}>{p}</span>;
    const n = Number(m[1]);
    return n >= 1 && n <= citations.length ? (
      <sup key={i} className="mx-0.5 font-mono text-[10px] text-accent-strong">
        [{n}]
      </sup>
    ) : null;
  });
}

/**
 * Biseda me asistentin. Numbers in answers come from the app's calculator tools; citations come
 * only from stored data. Without an API key the server answers with deterministic calculations.
 */
export function Chat({
  projects,
  initialProjectId,
  initialMessages,
  aiConfigured,
}: {
  projects: { id: string; title: string }[];
  initialProjectId: string | null;
  initialMessages: AssistantMessage[];
  aiConfigured: boolean;
}) {
  const [projectId, setProjectId] = useState<string | null>(initialProjectId);
  const [turns, setTurns] = useState<Turn[]>(initialMessages.map((m) => ({ role: m.role, content: m.content })));
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns.length]);

  async function send(message: string) {
    const m = message.trim();
    if (!m || busy) return;
    setBusy(true);
    setError(null);
    setTurns((t) => [...t, { role: 'user', content: m }]);
    setText('');
    const res = await apiFetch<AssistantReply>('/api/assistant', { method: 'POST', body: { message: m, projectId: projectId ?? undefined } });
    setBusy(false);
    if (!res.ok) {
      setError(res.messageSq);
      return;
    }
    setTurns((t) => [...t, { role: 'assistant', content: res.data.replySq, reply: res.data }]);
  }

  return (
    <div className="flex flex-col gap-4">
      {!aiConfigured ? (
        <Notice tone="warn" title="ANTHROPIC_API_KEY mungon">
          Biseda e lirë me AI është e çaktivizuar në këtë server. Asistenti përgjigjet vetëm me llogaritje deterministe të aplikacionit për pyetjet e sugjeruara më poshtë.
        </Notice>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="chatProject" className="text-sm text-muted">
          Projekti
        </label>
        <select
          id="chatProject"
          value={projectId ?? ''}
          onChange={(e) => setProjectId(e.target.value || null)}
          className="min-h-10 max-w-full rounded-xl border border-line-strong bg-surface-2 px-3 text-sm text-ink"
        >
          <option value="">Pa projekt (pyetje të përgjithshme)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-64 space-y-3 rounded-2xl border border-line bg-surface p-3 sm:p-4" aria-live="polite">
        {turns.length === 0 ? (
          <p className="text-sm text-muted">
            Pyetni për idenë, buxhetin ose detyrat e projektit. Asistenti njeh profilin tuaj, projektin e zgjedhur dhe modelin financiar.
          </p>
        ) : null}
        {turns.map((t, i) => (
          <div key={i} className={cx('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cx(
                'max-w-[92%] rounded-2xl px-3 py-2 text-sm sm:max-w-[80%]',
                t.role === 'user' ? 'bg-accent text-white' : 'border border-line bg-surface-2 text-ink',
              )}
            >
              {t.role === 'assistant' && t.reply ? (
                <p className="mb-1 text-[11px] font-medium text-faint">
                  {t.reply.mode === 'claude' ? 'Asistenti AI' : 'Llogaritje e aplikacionit (pa AI)'}
                </p>
              ) : null}
              <div className="whitespace-pre-wrap leading-6">{t.reply ? withRefs(t.content, t.reply.citations) : t.content}</div>
              {t.reply?.calculations && t.reply.calculations.length > 0 ? (
                <ul className="mt-2 space-y-1 rounded-lg bg-surface p-2 text-xs">
                  {t.reply.calculations.map((c, j) => (
                    <li key={j} className="flex flex-wrap justify-between gap-2">
                      <span className="text-muted">
                        {c.labelSq} ({SCENARIO_LABELS[c.scenario]})
                      </span>
                      <span className="tabular text-ink">
                        {formatMoney(c.before, c.currency)} → {formatMoney(c.after, c.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {t.reply && t.reply.citations.length > 0 ? (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="text-[11px] font-medium text-faint">Burimet</p>
                  <ol className="list-none">
                    <CitationList citations={t.reply.citations} />
                  </ol>
                </div>
              ) : null}
              {t.reply?.missingConfigSq ? <p className="mt-2 text-[11px] text-warn">{t.reply.missingConfigSq}</p> : null}
            </div>
          </div>
        ))}
        {busy ? <p className="text-sm text-muted">Duke menduar…</p> : null}
        <div ref={endRef} />
      </div>

      {error ? <Notice tone="bad">{error}</Notice> : null}

      <div className="flex flex-wrap gap-2" aria-label="Pyetje të sugjeruara">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => send(s)}
            className="min-h-9 rounded-full border border-line-strong bg-surface-2 px-3 text-xs text-muted hover:text-ink disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="sticky bottom-20 flex gap-2 rounded-2xl border border-line bg-bg/95 p-2 backdrop-blur lg:bottom-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
      >
        <label htmlFor="chatInput" className="sr-only">
          Mesazhi
        </label>
        <textarea
          id="chatInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(text);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Shkruani pyetjen…"
          className="min-h-11 flex-1 resize-none rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-accent focus:outline-none sm:text-sm"
        />
        <Button type="submit" disabled={busy || !text.trim()}>
          Dërgo
        </Button>
      </form>
      <p className="text-xs text-faint">
        Asistenti nuk regjistron biznese, nuk bën pagesa dhe nuk kryen asnjë veprim në emrin tuaj. Çështjet ligjore dhe tatimore kërkojnë verifikim lokal.
      </p>
    </div>
  );
}

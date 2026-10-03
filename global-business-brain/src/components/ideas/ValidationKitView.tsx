import type { ValidationKit } from '@/lib/domain/types';
import { Disclosure } from '@/components/ui/Disclosure';
import { Notice } from '@/components/ui/Notice';

function List({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-5 text-sm text-muted`}>{items.map((i) => <li key={i}>{i}</li>)}</Tag>;
}

/** "Testoje përpara se të investosh": interviews, interest tests, trial offer, decision criteria, first customers. */
export function ValidationKitView({ kit }: { kit: ValidationKit }) {
  return (
    <div className="space-y-4">
      <Notice tone="info" title="Interesi verbal nuk është blerje">
        {kit.verbalVsBehaviourSq}
      </Notice>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Pyetje intervistimi (për sjelljen e kaluar, jo hipoteza)</h3>
        <List items={kit.interviewQuestionsSq} ordered />
      </section>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Pyetje që duhen shmangur</h3>
        <List items={kit.avoidQuestionsSq} />
      </section>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Si të testoni interesin real</h3>
        <List items={kit.interestTestsSq} />
      </section>
      <section className="rounded-xl border border-line bg-surface-2/60 p-3">
        <h3 className="mb-1 font-semibold text-ink">Oferta e provës</h3>
        <p className="text-sm text-muted">{kit.trialOfferSq}</p>
      </section>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Kriteret e vendimit</h3>
        <div className="table-scroll rounded-xl border border-line">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-faint">
              <tr>
                <th scope="col" className="px-3 py-2">Çfarë matni</th>
                <th scope="col" className="px-3 py-2">Pragu (supozim i qartë)</th>
                <th scope="col" className="px-3 py-2">Çfarë do të thotë</th>
              </tr>
            </thead>
            <tbody>
              {kit.decisionCriteriaSq.map((c) => (
                <tr key={c.metricSq} className="border-t border-line align-top">
                  <td className="px-3 py-2 text-ink">{c.metricSq}</td>
                  <td className="px-3 py-2 text-ink">{c.thresholdSq}</td>
                  <td className="px-3 py-2 text-muted">{c.meaningSq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Klientët e parë</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Ku mund t’i gjeni</p>
            <List items={kit.firstCustomers.whereSq} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Si t’i kontaktoni (në mënyrë të ligjshme)</p>
            <List items={kit.firstCustomers.howToContactSq} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Çfarë t’u ofroni</p>
            <p className="text-sm text-muted">{kit.firstCustomers.offerSq}</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Si t’i ndiqni</p>
            <p className="text-sm text-muted">{kit.firstCustomers.followUpSq}</p>
          </div>
          <div className="md:col-span-2">
            <p className="mb-1 text-sm font-medium text-ink">Si matet rezultati</p>
            <List items={kit.firstCustomers.metricsSq} />
          </div>
        </div>
      </section>
      <Disclosure summary="Tekst prezantimi (shabllon origjinal — personalizojeni)">
        <p className="whitespace-pre-wrap">{kit.pitchTemplateSq}</p>
      </Disclosure>
      <Disclosure summary="Model oferte">
        <p className="whitespace-pre-wrap">{kit.offerTemplateSq}</p>
      </Disclosure>
      <Disclosure summary="Pyetje për reagimet e klientëve">
        <List items={kit.feedbackQuestionsSq} />
      </Disclosure>
      <Notice tone="warn" title="Mos e bëni këtë">
        <ul className="list-disc space-y-1 pl-5">
          {kit.doNotSq.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Notice>
    </div>
  );
}

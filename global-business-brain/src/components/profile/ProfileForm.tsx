'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { BusinessMode, MarketScope, RiskTolerance, SectorId, StartLocation, TeamMode, UserProfile } from '@/lib/domain/types';
import {
  ASSETS,
  BUSINESS_MODE_LABELS,
  MARKET_SCOPE_LABELS,
  RISK_TOLERANCE_LABELS,
  SECTORS,
  SKILLS,
  START_LOCATION_LABELS,
  TEAM_MODE_LABELS,
} from '@/lib/domain/taxonomy';
import { apiFetch } from '@/lib/client/api';
import { Button } from '@/components/ui/Button';
import { ChipGroup, FieldError, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { CountryMultiPicker, type CountryOption } from './CountryPicker';

const PREFERRED_CURRENCIES = ['EUR', 'USD', 'ALL', 'GBP', 'CHF', 'MKD', 'RSD', 'TRY'];

function emptyProfile(defaultCountry: string): UserProfile {
  return {
    residenceCountry: defaultCountry,
    residenceCity: '',
    operableCountries: [defaultCountry],
    targetCountries: [defaultCountry],
    targetCity: '',
    capital: { amount: 0, currency: 'EUR' },
    skills: [],
    otherSkills: '',
    experienceYears: 0,
    experienceSectors: [],
    hoursPerWeek: 20,
    assets: [],
    otherAssets: '',
    teamMode: 'vetem',
    businessModes: ['fizik', 'online', 'kombinuar'],
    marketScopes: ['lokal'],
    startLocations: ['shtepi'],
    isAdult: false,
    riskTolerance: 'mesatare',
    ownerIncomeNeedMonthly: null,
  };
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {subtitle ? <p className="mb-4 mt-0.5 text-sm text-muted">{subtitle}</p> : <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function RadioRow<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((k) => (
          <label
            key={k}
            className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${
              value === k ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong bg-surface-2 text-muted'
            }`}
          >
            <input type="radio" name={name} value={k} checked={value === k} onChange={() => onChange(k)} className="accent-[var(--color-accent)]" />
            {options[k]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Formulari i profilit. Residence, the markets the user can legally operate in, and the target
 * markets are three separate answers — the app never assumes one implies another.
 */
export function ProfileForm({
  initial,
  countries,
  currencies,
  defaultCountry,
  hasSession,
}: {
  initial: UserProfile | null;
  countries: CountryOption[];
  currencies: string[];
  defaultCountry: string;
  hasSession: boolean;
}) {
  const router = useRouter();
  const [p, setP] = useState<UserProfile>(initial ?? emptyProfile(defaultCountry));
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => {
    setSaved(false);
    setP((prev) => ({ ...prev, [k]: v }));
  };

  const currencyList = [...PREFERRED_CURRENCIES, ...currencies.filter((c) => !PREFERRED_CURRENCIES.includes(c)).sort()];

  function validate(): string[] {
    const e: string[] = [];
    if (!p.residenceCountry) e.push('Zgjidhni vendbanimin.');
    if (p.targetCountries.length === 0) e.push('Zgjidhni të paktën një treg të synuar.');
    if (p.businessModes.length === 0) e.push('Zgjidhni të paktën një mënyrë biznesi (fizik, online ose të kombinuar).');
    if (p.marketScopes.length === 0) e.push('Zgjidhni tregun lokal, ndërkombëtar ose të dy.');
    if (p.startLocations.length === 0) e.push('Zgjidhni ku mund ta nisni (shtëpi ose ambient).');
    if (!(p.capital.amount >= 0)) e.push('Kapitali duhet të jetë 0 ose më shumë.');
    if (!(p.hoursPerWeek >= 0 && p.hoursPerWeek <= 100)) e.push('Orët në javë duhet të jenë 0–100.');
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (e.length) return;
    setSaving(true);
    try {
      if (!hasSession) {
        const g = await apiFetch<unknown>('/api/auth/guest', { method: 'POST', body: {} });
        if (!g.ok && g.status !== 409) {
          setErrors([g.messageSq]);
          return;
        }
      }
      const res = await apiFetch<{ profile: UserProfile }>('/api/profile', { method: 'PUT', body: { profile: p } });
      if (!res.ok) {
        setErrors([res.messageSq]);
        return;
      }
      setSaved(true);
      router.push(`/ide?vendi=${encodeURIComponent(p.targetCountries[0] ?? p.residenceCountry)}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Section title="Ku jeni dhe ku mund të operoni" subtitle="Vendbanimi, vendet ku mund të punoni ligjërisht dhe tregjet që synoni janë tri gjëra të ndryshme.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="residenceCountry">Vendbanimi</Label>
            <Select id="residenceCountry" value={p.residenceCountry} onChange={(e) => set('residenceCountry', e.target.value)}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.nameSq}
                  {c.isDemo ? ' (DEMO)' : ''}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="residenceCity">Qyteti ku banoni</Label>
            <Input id="residenceCity" value={p.residenceCity ?? ''} maxLength={120} onChange={(e) => set('residenceCity', e.target.value)} />
          </div>
        </div>
        <CountryMultiPicker
          label="Shtetet ku mund të operoni"
          hint="E deklaruar nga ju. Aplikacioni nuk verifikon të drejtën për të punuar, për t’u regjistruar apo për t’u zhvendosur — këto shënohen si “Kërkon verifikim”."
          options={countries}
          values={p.operableCountries}
          onChange={(v) => set('operableCountries', v)}
        />
        <CountryMultiPicker
          label="Tregjet që synoni (ku janë klientët)"
          hint="Mund të ndryshojnë nga vendbanimi — p.sh. shërbime online për klientë jashtë vendit."
          options={countries}
          values={p.targetCountries}
          onChange={(v) => set('targetCountries', v)}
          max={5}
        />
        <div>
          <Label htmlFor="targetCity" hint="Për qytetin nuk kemi të dhëna të verifikuara; do të marrni një plan kërkimi në terren.">
            Qyteti i synuar
          </Label>
          <Input id="targetCity" value={p.targetCity ?? ''} maxLength={120} onChange={(e) => set('targetCity', e.target.value)} />
        </div>
      </Section>

      <Section title="Kapitali dhe koha" subtitle="Shuma që mund të investoni pa rrezikuar shpenzimet bazë të jetesës.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="capitalAmount">Kapitali në dispozicion</Label>
            <Input
              id="capitalAmount"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={Number.isFinite(p.capital.amount) ? p.capital.amount : ''}
              onChange={(e) => set('capital', { ...p.capital, amount: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="capitalCurrency">Monedha</Label>
            <Select id="capitalCurrency" value={p.capital.currency} onChange={(e) => set('capital', { ...p.capital, currency: e.target.value })}>
              {currencyList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {p.capital.amount === 0 ? (
          <Notice tone="info" title="Pa kapital">
            Do t’ju sugjerojmë mënyra të ligjshme për të testuar kërkesën me aftësitë dhe mjetet që keni. Bizneset që kërkojnë pajisje, leje ose inventar nuk mund të hapen realisht pa shpenzime — këtë do ta shihni qartë te çdo ide.
          </Notice>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ownerIncome" hint="Përdoret si “paga e pronarit” në modelin financiar. Lëreni bosh nëse nuk dëshironi ta përfshini.">
              Të ardhurat mujore që ju duhen për jetesë ({p.capital.currency})
            </Label>
            <Input
              id="ownerIncome"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={p.ownerIncomeNeedMonthly ?? ''}
              onChange={(e) => set('ownerIncomeNeedMonthly', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="hours">Orë në javë për biznesin</Label>
            <Input id="hours" type="number" inputMode="numeric" min={0} max={100} value={p.hoursPerWeek} onChange={(e) => set('hoursPerWeek', Number(e.target.value))} />
          </div>
        </div>
      </Section>

      <Section title="Aftësitë dhe përvoja">
        {Array.from(new Set(SKILLS.map((s) => s.group ?? 'Të tjera'))).map((group) => (
          <ChipGroup
            key={group}
            name={`skills-${group}`}
            legend={group}
            options={SKILLS.filter((s) => (s.group ?? 'Të tjera') === group)}
            values={p.skills}
            onChange={(v) => set('skills', v)}
          />
        ))}
        <div>
          <Label htmlFor="otherSkills">Aftësi të tjera</Label>
          <Textarea id="otherSkills" maxLength={500} value={p.otherSkills ?? ''} onChange={(e) => set('otherSkills', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="expYears">Vite përvojë pune</Label>
            <Input id="expYears" type="number" inputMode="numeric" min={0} max={60} value={p.experienceYears} onChange={(e) => set('experienceYears', Number(e.target.value))} />
          </div>
        </div>
        <ChipGroup
          name="sectors"
          legend="Sektorët ku keni punuar"
          options={(Object.keys(SECTORS) as SectorId[]).map((id) => ({ id, labelSq: SECTORS[id] }))}
          values={p.experienceSectors}
          onChange={(v) => set('experienceSectors', v as SectorId[])}
        />
      </Section>

      <Section title="Mjetet dhe hapësirat që keni" subtitle="Çdo mjet që zotëroni mund të ulë kapitalin e nevojshëm.">
        <ChipGroup name="assets" legend="Zotëroj" options={ASSETS} values={p.assets} onChange={(v) => set('assets', v)} />
        <div>
          <Label htmlFor="otherAssets">Mjete të tjera</Label>
          <Textarea id="otherAssets" maxLength={500} value={p.otherAssets ?? ''} onChange={(e) => set('otherAssets', e.target.value)} />
        </div>
      </Section>

      <Section title="Si dëshironi të punoni">
        <RadioRow<TeamMode> legend="Do të punoni" name="teamMode" options={TEAM_MODE_LABELS} value={p.teamMode} onChange={(v) => set('teamMode', v)} />
        <ChipGroup
          name="modes"
          legend="Lloji i biznesit që pranoni"
          options={(Object.keys(BUSINESS_MODE_LABELS) as BusinessMode[]).map((id) => ({ id, labelSq: BUSINESS_MODE_LABELS[id] }))}
          values={p.businessModes}
          onChange={(v) => set('businessModes', v as BusinessMode[])}
        />
        <ChipGroup
          name="scopes"
          legend="Tregu"
          options={(Object.keys(MARKET_SCOPE_LABELS) as MarketScope[]).map((id) => ({ id, labelSq: MARKET_SCOPE_LABELS[id] }))}
          values={p.marketScopes}
          onChange={(v) => set('marketScopes', v as MarketScope[])}
        />
        <ChipGroup
          name="starts"
          legend="Ku mund ta nisni"
          options={(Object.keys(START_LOCATION_LABELS) as StartLocation[]).map((id) => ({ id, labelSq: START_LOCATION_LABELS[id] }))}
          values={p.startLocations}
          onChange={(v) => set('startLocations', v as StartLocation[])}
        />
        <RadioRow<RiskTolerance>
          legend="Toleranca ndaj rrezikut"
          name="risk"
          options={RISK_TOLERANCE_LABELS}
          value={p.riskTolerance}
          onChange={(v) => set('riskTolerance', v)}
        />
        <label className="flex min-h-11 items-start gap-3 rounded-xl border border-line-strong bg-surface-2 p-3 text-sm text-ink">
          <input type="checkbox" checked={p.isAdult} onChange={(e) => set('isAdult', e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--color-accent)]" />
          <span>
            Jam 18 vjeç ose më shumë.
            <span className="block text-xs text-muted">Disa veprimtari kërkojnë moshë madhore; nëse jeni nën 18 vjeç, ato përjashtohen nga rekomandimet.</span>
          </span>
        </label>
      </Section>

      {errors.length > 0 ? (
        <div role="alert" className="rounded-xl border border-bad/40 bg-bad-soft p-3">
          {errors.map((e) => (
            <FieldError key={e}>{e}</FieldError>
          ))}
        </div>
      ) : null}
      {saved ? <p className="text-sm text-ok">Profili u ruajt.</p> : null}
      <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
        <Button type="submit" disabled={saving} className="w-full shadow-lg sm:w-auto">
          {saving ? 'Duke ruajtur…' : 'Ruaj profilin dhe shiko idetë'}
        </Button>
      </div>
    </form>
  );
}

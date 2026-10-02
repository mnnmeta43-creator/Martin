# Global Business Brain

**“Zbulo ku ka mundësi. Kupto pse. Ndërto biznesin nga zero.”**

Aplikacion full-stack në shqip që lidh analizën makroekonomike me mundësi konkrete biznesi dhe
të udhëheq nga ideja te testimi, hapja dhe menaxhimi i biznesit. Çdo ide lidh:
**të dhënat → problemin e klientit → kërkesën e mundshme → ofertën → mënyrën e fitimit → provën praktike.**

Asnjë biznes nuk paraqitet si fitim i garantuar. Faktet, interpretimet, supozimet dhe parashikimet
janë të ndara qartë kudo.

> **Statusi:** Ky aplikacion nuk është publikuar (deploy) dhe nuk do të publikohet pa miratimin tuaj.
> Shihni [Çfarë funksionon, çfarë është testuar, çfarë pret konfigurim](#statusi-i-dorëzimit).

---

## Përmbajtja

1. [Nisja e shpejtë](#nisja-e-shpejtë)
2. [Variablat e mjedisit](#variablat-e-mjedisit)
3. [Arkitektura](#arkitektura)
4. [Të dhënat dhe burimet](#të-dhënat-dhe-burimet)
5. [Motori financiar](#motori-financiar)
6. [Siguria](#siguria)
7. [Testet](#testet)
8. [Statusi i dorëzimit](#statusi-i-dorëzimit)

---

## Nisja e shpejtë

Kërkesat: Node.js ≥ 20.9 (testuar me 22), npm. PostgreSQL është opsional në zhvillim.

```bash
cd global-business-brain
npm install
cp .env.example .env.local      # plotësoni vetëm ato që ju duhen

# Mënyra më e shpejtë për ta provuar: ekonomi fiktive DEMO + databazë e brendshme (PGlite)
DATA_MODE=demo npm run dev       # http://localhost:3000
```

- Pa `DATABASE_URL`, në zhvillim përdoret **PGlite** (PostgreSQL i ngulitur) në `.data/pglite`.
- Për PostgreSQL real: vendosni `DATABASE_URL` dhe ekzekutoni `npm run db:migrate`
  (migrimet ekzekutohen edhe automatikisht në lidhjen e parë).
- Për të dhëna reale: `npm run data:refresh` në një server me qasje në internet
  (World Bank, IMF, ECB/Frankfurter). Pa këtë hap, vendet reale shfaqen me **“Mungojnë të dhënat”** —
  asnjë vlerë nuk sajohet.

Komandat:

| Komanda | Çfarë bën |
|---|---|
| `npm run dev` | Serveri i zhvillimit |
| `npm run build` / `npm start` | Ndërtimi dhe nisja për prodhim |
| `npm test` | Testet e njësive dhe integrimit (Vitest) |
| `npm run test:e2e` | Testet end-to-end në telefon dhe kompjuter (Playwright; ndërton më parë me `npm run build`) |
| `npm run typecheck` / `npm run lint` | TypeScript dhe ESLint |
| `npm run db:migrate` | Migrimet e databazës |
| `npm run data:refresh [-- --force] [-- --source=worldbank-wdi]` | Rifreskimi i të dhënave nga burimet |
| `npm run sources:check` | Kontrollon nëse faqet e burimeve dhe lidhjet zyrtare përgjigjen |

## Variablat e mjedisit

Të gjitha janë **vetëm në server**. Asnjë sekret nuk dërgohet në shfletues. Shihni `.env.example`.

| Variabla | E detyrueshme? | Çfarë ndodh nëse mungon |
|---|---|---|
| `DATABASE_URL` | Po, në prodhim | Llogaritë, profilet dhe projektet nuk funksionojnë; aplikacioni e tregon qartë. Në zhvillim përdoret PGlite. |
| `DATA_MODE` | Jo (`live`) | `demo` aktivizon ekonomitë fiktive ZZA/ZZB/ZZC, të shënuara DEMO kudo. |
| `ANTHROPIC_API_KEY` | Jo | Biseda e lirë me AI çaktivizohet; asistenti përgjigjet me llogaritje deterministe të aplikacionit. |
| `ANTHROPIC_MODEL` | Jo | Përdoret modeli i parazgjedhur në `src/lib/ai/assistant.ts`. |
| `CRON_SECRET` | Jo | `POST /api/cron/refresh` është i çaktivizuar: nuk ka rifreskim automatik. |
| `FX_API_BASE_URL` | Jo | Përdoret `https://api.frankfurter.dev/v1`. |
| `APP_URL` | Jo | Kontrolli i origjinës përdor host-in e kërkesës. |
| `ALLOW_EMBEDDED_DB` | Jo | Vetëm për demo/test: lejon PGlite në prodhim. |

## Arkitektura

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + PostgreSQL. Shtresat janë të ndara:

```
src/
  app/                    Ndërfaqja (faqet server) + rrugët e API-së (/api/**)
    _lib/                 Kompozimi i faqeve: vizitori, konteksti i vendit, idetë, projektet
  components/             Komponentët e ndërfaqes (klient), grafikët SVG me alternativë tabelë
  lib/
    domain/               Kontratat e përbashkëta (types.ts) dhe taksonomitë shqip
    data/                 Burimet: regjistri, katalogu i vendeve, treguesit, adaptuesit (World Bank,
                          IMF, ECB), normalizimi i njësive/periudhave, freskia, mbulimi, rifreskimi, DEMO
    analysis/             Analiza makro dhe krahasimi i vendeve (me paralajmërime për krahasueshmërinë)
    ideas/                Biblioteka e arketipeve, motori i ideve, përshtatja me profilin, pretendimet me burim,
                          “6 hapat”, vendndodhja, kompleti i validimit
    scoring/              Pikëzimi me pesha të redaktueshme + cilësia e provave (veçmas)
    finance/              Motori financiar determinist (projeksioni, kapitali, monedha, formatimi)
    plan/                 Plani 0–100, detyrat, progresi (përfundim i planit, jo probabilitet suksesi)
    export/               PDF (plani) dhe Excel (modeli financiar me formula)
    ai/                   Asistenti (Claude me mjete të aplikacionit) + mënyra pa AI
    server/               Mjedisi, databaza (pg / PGlite), ruajtja, autentikimi, kufizimi i kërkesave, log-et
    validation/           Skemat zod për çdo hyrje në API
db/migrations/            SQL
scripts/                  Migrimi, rifreskimi i të dhënave, kontrolli i burimeve
tests/                    Vitest (njësi + integrim)  ·  e2e/  Playwright (telefon + kompjuter)
```

Parime:

- **Llogaritjet janë deterministe dhe të testuara.** AI shpjegon dhe interpreton; për çdo ndryshim
  financiar thërret kalkulatorin e aplikacionit.
- **Të dhënat demonstrative janë të ndara nga prodhimi:** gjenerohen në memorie vetëm për ZZA/ZZB/ZZC,
  nuk shkruhen kurrë në tabelat reale, shënohen DEMO.
- **Projektet ngrijnë “fotografinë” e të dhënave** (vlerat, burimet, kurset dhe data e analizës).
- **Offline:** mund të shihen projektet e hapura më parë në pajisje, me datën e ruajtjes, kurrë si analizë live.

## Të dhënat dhe burimet

| Burimi | Statusi në këtë version |
|---|---|
| World Bank — World Development Indicators (API v2) | Integruar; i paverifikuar live nga mjedisi i zhvillimit (rrjeti e bllokonte) |
| World Bank — klasifikimi i vendeve | Integruar; i paverifikuar live |
| IMF DataMapper (WEO, përfshirë parashikime të shënuara si të tilla) | Integruar; i paverifikuar live |
| ECB — kurset referuese (përmes Frankfurter) | Integruar; i paverifikuar live; mbulon ~30 monedha |
| OECD, ILOSTAT, UNdata | Vlerësuar, jo të integruara (arsyet te faqja “Burimet”) |
| UN Comtrade | Kërkon çelës abonimi; jo i integruar |
| world-countries, i18n-iso-countries (paketa npm) | Katalogu i vendeve dhe emrat shqip |
| Lidhje zyrtare (regjistra biznesi, statistika, banka qendrore) | Vetëm për verifikim manual — “Kërkon verifikim lokal” |

Për çdo tregues ruhen: burimi dhe lidhja, periudha, njësia, monedha, data e publikimit kur ofrohet,
data e marrjes dhe statusi. Kur burimi nuk përgjigjet, shfaqen vlerat e fundit të ruajtura me
paralajmërim; kur mungojnë, shfaqet mungesa.

**Qiratë, çmimet e energjisë dhe pagat** nuk kanë burim global të integruar: aplikacioni jep plan
kërkimi në terren në vend të shifrave të sajuara.

## Motori financiar

Formulat (të shfaqura edhe në ndërfaqe dhe në Excel):

- Të ardhurat = sasia e shitur × çmimi
- Kontributi për njësi = çmimi − kostoja variabël për njësi
- Pika e barazimit në njësi = kostot fikse ÷ kontributi për njësi (nëse kontributi ≤ 0, rritja e
  volumit nuk e zgjidh problemin — ndërfaqja e thotë qartë)
- Kapitali i nevojshëm = investimi fillestar + deficiti maksimal i parasë nga operimi + rezerva
  (pa numëruar dy herë asnjë shpenzim; pa supozuar kredi, grante apo financim)

Vonesat e pagesave (klientë dhe furnitorë), inventari fillestar, sezonaliteti, paga e pronarit
(e përfshirë ose e shënuar si e papërfshirë), tre skenarë të redaktueshëm dhe parashikimi 12–36 mujor.
Fitimi dhe paraja e disponueshme tregohen veçmas. Kthimi i investimit nuk jepet kurrë si datë e garantuar.

## Siguria

- Sekretet vetëm në variabla mjedisi në server; asnjë import i modulit të serverit në klient.
- Fjalëkalimet me scrypt; sesione me token të rastësishëm (në databazë ruhet vetëm hash-i), cookie
  `HttpOnly`, `SameSite=Lax`, `Secure` në prodhim.
- Kontroll origjine për kërkesat që ndryshojnë të dhëna; kufizim kërkesash në databazë.
- Çdo pyetje për projekte/detyra/prova filtrohet sipas përdoruesit (izolim i testuar); projekti i
  dikujt tjetër sillet si “nuk u gjet”.
- Validim zod për çdo hyrje; log-e pa sekrete (maskim automatik); CSP pa origjina të jashtme.
- Asnjë regjistrim biznesi, pagesë, blerje ose veprim i jashtëm në emrin e përdoruesit.

## Testet

```bash
npm test             # Vitest
npm run build && npm run test:e2e   # Playwright: telefon (Pixel 7) + kompjuter
```

Mbulojnë: llogaritjet financiare, monedhën dhe njësitë, të dhënat e munguara dhe të vjetra, dështimin e
burimeve, ruajtjen dhe izolimin e projekteve (PGlite dhe PostgreSQL real), gjurmueshmërinë e pretendimeve
te burimet, eksportet PDF/Excel, asistentin (me klient të simuluar) dhe përdorimin në telefon.

## Statusi i dorëzimit

Shihni seksionin përfundimtar të raportit të dorëzimit në `docs/DORËZIMI.md`.

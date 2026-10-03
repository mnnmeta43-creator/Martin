# Raporti i dorëzimit — Global Business Brain

Ky dokument ndan qartë **çfarë funksionon**, **çfarë është testuar** dhe **çfarë pret konfigurim**.
Aplikacioni nuk quhet "i përfunduar" vetëm sepse hapet ndërfaqja.

## 1. Çfarë funksionon (e verifikuar në ndërtim prodhimi, modaliteti DEMO)

Rrjedha e plotë: **Profili → zgjedhja e vendit → të dhëna të burimuara → ide e arsyetuar →
buxhet i redaktueshëm → plan 0–100 → ruajtje projekti**, plus:

| Seksioni | Statusi |
|---|---|
| Paneli global | Funksionon: profili, projektet me progres, idetë kryesore, gjendja e të dhënave, legjenda fakt/interpretim/supozim/parashikim |
| Profili im | Funksionon: vendbanimi ≠ vendet ku mund të operoni ≠ tregjet e synuara; kapitali dhe monedha; aftësitë, përvoja, koha, mjetet; ekipi; fizik/online/kombinuar; lokal/ndërkombëtar; shtëpi/ambient; mosha 18+; mund të nisni si vizitor |
| Eksploro shtetet | Funksionon: 250 shtete dhe territore (193 anëtare të OKB-së, vëzhguesit, Kosova XKX, territoret), kërkim pa diakritikë, filtra, nivel mbulimi |
| Analiza makro | Funksionon: për çdo tregues — çfarë mat, çfarë ka ndryshuar, cilat biznese ndikohen, mekanizmi, prova shtesë, analogji, kujdes në lexim; seria kohore me tabelë alternative; mungesa shfaqet si mungesë |
| Krahaso vende | Funksionon: 2–5 vende, tregues krah për krah me paralajmërime për vite të ndryshme, krahasim për një ide konkrete |
| Ide biznesi | Funksionon: lista të ndara (të përshtatshme / kërkojnë ekip / të përjashtuara me arsye), filtra |
| Detajet e idesë | Funksionon: "Përmbledhje", "Analizë e thellë", "Çfarë bëj tani", "Ma shpjego në 6 hapa", pse funksionon / pse mund të dështojë, provat rrëzuese, ku ta nis (regjistrimi ≠ operimi ≠ klientët), plan kërkimi në terren, testoje përpara se të investosh |
| Kalkulatori i kapitalit | Funksionon: kosto me vlerë/interval/burim/datë të redaktueshme, tre skenarë, parashikim 12–36 mujor, fitimi ≠ paraja, vonesat e pagesave, pika e barazimit, kapitali i nevojshëm pa numërim të dyfishtë, kthimi i investimit pa datë të garantuar, konvertim monedhe me kurs të ruajtur ose manual |
| Plani 0–100 | Funksionon: 10 faza me veprime, rezultat, buxhet, varësi, provë përfundimi, kriter vazhdimi/ndalimi; planet 7/30/90 ditë |
| Detyrat dhe progresi | Funksionon: statusi i detyrave, % e përfundimit të planit (jo probabilitet suksesi), regjistri i provave nga terreni |
| Burimet dhe përditësimet | Funksionon: statusi i çdo burimi, kushtet e përdorimit, regjistri i rifreskimeve, konfigurimi i serverit (pa vlera sekrete) |
| Asistenti AI | Funksionon pa çelës me llogaritje deterministe (6 pyetjet e specifikimit); me `ANTHROPIC_API_KEY` përdor Claude me mjetet e aplikacionit dhe citime vetëm nga të dhënat e ruajtura |
| Projektet e ruajtura | Funksionon: lista, fshirja, izolimi sipas përdoruesit |
| Cilësimet | Funksionon: llogaria, dalja, fshirja e llogarisë, kopjet offline, funksionet që presin konfigurim |
| Eksportet | Plani në PDF; modeli financiar në Excel me formula të vërteta, supozimet, burimet dhe datën e analizës |
| PWA / offline | Manifest, ikona, service worker; projektet e hapura shihen offline me datën e ruajtjes, kurrë si analizë live |

## 2. Çfarë është testuar

- **Testet e njësive dhe integrimit (Vitest):** shihni numrat e fundit në seksionin 5.
  Mbulojnë llogaritjet financiare, monedhat dhe njësitë, të dhënat e munguara dhe të vjetra,
  dështimin e burimeve (riprovim, ndërprerës, ruajtja e të dhënave të vjetra), ruajtjen dhe izolimin e
  projekteve, gjurmueshmërinë e pretendimeve te burimet, pikëzimin, planin, eksportet, asistentin
  (me klient të simuluar dhe tentativa "prompt injection").
- **PostgreSQL real 16:** 29 teste integrimi (kontrata e ruajtjes, izolimi, migrimet e njëkohshme) — kaluan.
- **End-to-end (Playwright) në telefon (Pixel 7) dhe kompjuter:** rrjedha e plotë, izolimi (një
  përdorues tjetër merr 404), eksportet PDF/Excel, asistenti pa çelës, faqja offline, manifesti PWA,
  katalogu, vendi pa të dhëna, burimet — dhe kontrolli që asnjë faqe nuk ka scroll horizontal.
- **Rishikim kundërshtues i motorit financiar:** 26 probleme të verifikuara u rregulluan me teste regresioni.

## 3. Çfarë pret konfigurim ose verifikim

| Çështja | Çfarë mungon | Çfarë pengon |
|---|---|---|
| Lidhja live me burimet | Mjedisi i zhvillimit bllokonte World Bank, IMF dhe ECB | Adaptuesit janë testuar vetëm me formatin e dokumentuar; lidhja reale verifikohet pas publikimit (rifreskimi i parë) |
| `ANTHROPIC_API_KEY` | Çelësi i Claude | Biseda e lirë me AI; përgjigjet deterministe funksionojnë |
| Publikimi | Lidhja e depos në Netlify ose leje rrjeti për `netlify-mcp.netlify.app` | Lidhja publike |
| Qiratë, energjia, pagat | Nuk ka burim global të integruar | Shfaqet plan kërkimi në terren, jo shifra |
| OECD, ILOSTAT, UNdata, UN Comtrade | Të vlerësuara, jo të integruara (Comtrade kërkon çelës) | Treguesit shtesë nga këto burime |
| Lidhjet zyrtare (regjistra, tatime) | Nuk lexohen automatikisht | Kërkesat ligjore: "Kërkon verifikim lokal" |

## 4. Publikimi (Netlify)

- Projekti: `global-business-brain` (global-business-brain.netlify.app), i ndarë nga Voltex.
- Variablat: `DATA_MODE=live`, `APP_URL`, `CRON_SECRET` (sekret). Databaza: Netlify Database
  (krijohet automatikisht nga paketa `@netlify/database`; aplikacioni lexon `NETLIFY_DB_URL`).
- Rifreskimi: funksion i planifikuar çdo orë nis një funksion në sfond (deri 15 min) që rifreskon
  vetëm burimet e vjetruara. Pa publikim, nuk ka rifreskim automatik.

## 5. Numrat e verifikimit të fundit

Plotësohen në fund të punës (shihni mesazhin përfundimtar).

import { expect, test, type Page } from '@playwright/test';

/**
 * Rrjedha kryesore në telefon dhe kompjuter (DATA_MODE=demo, databazë në memorie):
 * Profili → vendi → të dhëna të burimuara → ide e arsyetuar → buxhet i redaktueshëm → plan 0–100 → ruajtje projekti.
 */

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'faqja nuk duhet të ketë scroll horizontal').toBeLessThanOrEqual(1);
}

async function fillProfile(page: Page) {
  await page.goto('/profili');
  await expect(page.getByRole('heading', { name: 'Profili im', level: 1 })).toBeVisible();
  await page.getByLabel('Vendbanimi', { exact: true }).selectOption('ZZA');
  // In demo mode the default target market is the demo economy ZZA.
  await expect(page.getByRole('button', { name: /^Hiq .*Demolandë A/ }).first()).toBeVisible();
  await page.getByLabel('Kapitali në dispozicion').fill('4000');
  await page.getByLabel('Monedha').selectOption('EUR');
  await page.getByRole('checkbox', { name: /Dizajn web/ }).check();
  await page.getByRole('checkbox', { name: /Kompjuter/ }).check();
  await page.getByRole('checkbox', { name: /Jam 18 vjeç/ }).check();
  await expectNoHorizontalScroll(page);
  await page.getByRole('button', { name: /Ruaj profilin/ }).click();
  await page.waitForURL(/\/ide\?vendi=/);
}

test.describe('rrjedha e plotë', () => {
  test('profil → ide → projekt → kalkulator → plan → detyra', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Zbulo ku ka mundësi');
    await expectNoHorizontalScroll(page);

    await fillProfile(page);
    await page.goto('/ide?vendi=ZZA');
    await expect(page.getByText('DEMO').first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    const firstIdea = page.getByRole('link', { name: 'Shiko detajet →' }).first();
    await firstIdea.click();
    await page.waitForURL(/\/ide\/[a-z0-9-]+\?vendi=ZZA/);
    await expect(page.getByRole('tab', { name: 'Përmbledhje' })).toBeVisible();
    await expect(page.getByText('Ma shpjego në 6 hapa')).toBeVisible();
    await page.getByRole('tab', { name: 'Analizë e thellë' }).click();
    await expect(page.getByRole('heading', { name: 'Pse mund të funksionojë' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pse mund të dështojë' })).toBeVisible();
    await expect(page.getByText('Kjo mbështetet nga të dhënat.').first().or(page.getByText('Mbështetet nga të dhënat').first())).toBeVisible();
    await page.getByRole('tab', { name: 'Çfarë bëj tani' }).click();
    await expect(page.getByRole('heading', { name: 'Testoje përpara se të investosh' })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByRole('button', { name: 'Ruaj si projekt' }).first().click();
    await page.waitForURL(/\/projektet\/[0-9a-f-]{36}$/);
    await expect(page.getByText('Kapitali i nevojshëm (bazë)')).toBeVisible();
    await expectNoHorizontalScroll(page);

    // Calculator: edit a price and save.
    await page.getByRole('link', { name: 'Kalkulatori', exact: true }).click();
    await page.waitForURL(/\/kalkulatori$/);
    const price = page.locator('#price');
    const before = await price.inputValue();
    await price.fill(String(Number(before) + 5));
    await expect(page.getByText('Ka ndryshime të paruajtura.')).toBeVisible();
    await page.getByRole('button', { name: 'Ruaj modelin' }).click();
    await expect(page.getByText('Modeli financiar u ruajt.')).toBeVisible();
    await expectNoHorizontalScroll(page);

    // Plan 0–100 with 10 phases.
    await page.getByRole('link', { name: 'Plani 0–100' }).first().click();
    await page.waitForURL(/\/plani$/);
    await expect(page.getByText('jo probabilitetin e suksesit').first()).toBeVisible();
    for (const range of ['0–10', '50–60', '90–100']) await expect(page.getByText(range, { exact: true }).first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    // Tasks: mark the first task done → progress increases.
    await page.getByRole('link', { name: 'Detyrat & provat' }).click();
    await page.waitForURL(/\/detyrat$/);
    const progress = page.getByRole('progressbar', { name: 'Përfundimi i planit' });
    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    await page.locator('select[id^="st-"]').first().selectOption('perfunduar');
    await expect(progress).not.toHaveAttribute('aria-valuenow', '0');
    await expectNoHorizontalScroll(page);

    // Exports respond with real files.
    const projectUrl = page.url().replace(/\/detyrat$/, '');
    const id = projectUrl.split('/').pop();
    // Fetch from inside the page so the browser's own (Secure, HttpOnly) session cookie is sent.
    const probe = (path: string) =>
      page.evaluate(async (p) => {
        const r = await fetch(p);
        return { status: r.status, type: r.headers.get('content-type') ?? '', size: (await r.arrayBuffer()).byteLength };
      }, path);
    const pdf = await probe(`/api/projects/${id}/export/pdf`);
    expect(pdf.status).toBe(200);
    expect(pdf.type).toContain('application/pdf');
    expect(pdf.size).toBeGreaterThan(5000);
    const xlsx = await probe(`/api/projects/${id}/export/xlsx`);
    expect(xlsx.status).toBe(200);
    expect(xlsx.type).toContain('spreadsheetml');
    expect(xlsx.size).toBeGreaterThan(5000);
  });

  test('izolimi: një vizitor tjetër nuk sheh projektin', async ({ page, browser }) => {
    await fillProfile(page);
    await page.goto('/ide?vendi=ZZA');
    await page.getByRole('link', { name: 'Shiko detajet →' }).first().click();
    await page.getByRole('button', { name: 'Ruaj si projekt' }).first().click();
    await page.waitForURL(/\/projektet\/[0-9a-f-]{36}$/);
    const url = page.url();
    const id = url.split('/').pop();

    const other = await browser.newContext();
    const otherPage = await other.newPage();
    const res = await otherPage.goto(url);
    expect(res?.status()).toBe(404);
    await expect(otherPage.getByRole('heading', { name: 'Faqja nuk u gjet' })).toBeVisible();
    await expect(otherPage.getByText(/Kapitali i nevojshëm/)).toHaveCount(0);
    const api = await otherPage.request.get(`/api/projects/${id}`);
    expect([401, 404]).toContain(api.status());
    await other.close();
  });
});

test.describe('faqet e tjera', () => {
  test('burimet tregojnë statusin e integrimit dhe konfigurimin', async ({ page }) => {
    await page.goto('/burimet');
    await expect(page.getByRole('heading', { name: 'Burimet dhe përditësimet', level: 1 })).toBeVisible();
    await expect(page.getByText('Integruar — pa verifikim live ende').first()).toBeVisible();
    await expect(page.getByText('ANTHROPIC_API_KEY').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test('katalogu i shteteve kërkon pa diakritikë', async ({ page }) => {
    await page.goto('/shtetet');
    await page.getByLabel('Kërko').fill('shqiperi');
    await expect(page.getByRole('link', { name: 'Shqipëri' })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test('vendi real pa të dhëna shfaq mungesën, jo zero', async ({ page }) => {
    await page.goto('/shtetet/ALB');
    await expect(page.getByText('Mungojnë të dhënat').first()).toBeVisible();
    await expect(page.getByText('Mbulim i pamjaftueshëm').first()).toBeVisible();
  });

  test('asistenti pa çelës përgjigjet me llogaritje deterministe', async ({ page }) => {
    await fillProfile(page);
    await page.goto('/ide?vendi=ZZA');
    await page.getByRole('link', { name: 'Shiko detajet →' }).first().click();
    await page.getByRole('button', { name: 'Ruaj si projekt' }).first().click();
    await page.waitForURL(/\/projektet\/[0-9a-f-]{36}$/);
    await page.goto('/asistenti');
    await expect(page.getByText('ANTHROPIC_API_KEY mungon').first()).toBeVisible();
    await page.getByRole('button', { name: 'Çfarë ndodh nëse kostot rriten 20%?' }).click();
    await expect(page.getByText('Llogaritje e aplikacionit (pa AI)')).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test('faqja offline', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { name: 'Pamje offline' })).toBeVisible();
    await expect(page.getByText('Jo analizë live').or(page.getByText('Nuk ka projekte të ruajtura në këtë pajisje'))).toBeVisible();
  });

  test('manifesti PWA', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const m = await res.json();
    expect(m.lang).toBe('sq');
    expect(m.display).toBe('standalone');
  });
});

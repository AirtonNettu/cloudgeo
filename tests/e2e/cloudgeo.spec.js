// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('CloudGeo End-to-End Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Modo determinístico: intercepta tiles para não depender de rede externa
    await page.route('**/*.tile.openstreetmap.org/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        )
      });
    });
  });

  test('deve carregar a aplicação sem erros de console e com títulos corretos', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/index.html');

    await expect(page).toHaveTitle(/CloudGeo/i);
    await expect(page.locator('h1')).toContainText('CloudGeo');
    await expect(page.locator('#mapa')).toBeVisible();

    // Aguarda catálogo carregar
    await expect(page.locator('#total-regioes')).not.toHaveText('0');
    await expect(page.locator('#regioes-visiveis')).not.toHaveText('0');

    expect(consoleErrors).toEqual([]);
  });

  test('deve carregar os catálogos e renderizar o dashboard de métricas', async ({ page }) => {
    await page.goto('/index.html');

    // Valida que os contadores do catálogo foram populados
    const totalRegioes = await page.locator('#total-regioes').textContent();
    const totalLocalZones = await page.locator('#total-local-zones').textContent();
    const totalCloudfront = await page.locator('#total-cloudfront').textContent();
    const totalContinentes = await page.locator('#total-continentes').textContent();
    const regioesVisiveis = await page.locator('#regioes-visiveis').textContent();

    expect(Number(totalRegioes)).toBeGreaterThan(0);
    expect(Number(totalLocalZones)).toBeGreaterThan(0);
    expect(Number(totalCloudfront)).toBeGreaterThan(0);
    expect(Number(totalContinentes)).toBe(6);
    expect(Number(regioesVisiveis)).toBeGreaterThan(0);
  });

  test('deve filtrar pontos através da busca universal', async ({ page }) => {
    await page.goto('/index.html');

    const totalInicial = Number(await page.locator('#regioes-visiveis').textContent());

    // Digita busca por "São Paulo"
    await page.fill('#busca', 'São Paulo');

    const totalAposBusca = Number(await page.locator('#regioes-visiveis').textContent());
    expect(totalAposBusca).toBeLessThan(totalInicial);
    expect(totalAposBusca).toBeGreaterThan(0);

    const badgeRegioes = Number(await page.locator('#badge-regioes').textContent());
    expect(badgeRegioes).toBeGreaterThanOrEqual(1);
  });

  test('deve filtrar por continente no menu dropdown', async ({ page }) => {
    await page.goto('/index.html');

    await page.selectOption('#continente', 'Europa');

    const visiveisEuropa = Number(await page.locator('#regioes-visiveis').textContent());
    const badgeRegioes = Number(await page.locator('#badge-regioes').textContent());

    expect(visiveisEuropa).toBeGreaterThan(0);
    expect(badgeRegioes).toBeGreaterThanOrEqual(8);
  });

  test('deve alternar camadas ativas através dos checkboxes', async ({ page }) => {
    await page.goto('/index.html');

    const totalInicial = Number(await page.locator('#regioes-visiveis').textContent());
    const cfInicial = Number(await page.locator('#badge-cloudfront').textContent());

    // Desmarca CloudFront
    await page.uncheck('#filtro-cloudfront');

    const totalSemCF = Number(await page.locator('#regioes-visiveis').textContent());
    expect(totalSemCF).toBe(totalInicial - cfInicial);

    // Reativa CloudFront
    await page.check('#filtro-cloudfront');
    expect(Number(await page.locator('#regioes-visiveis').textContent())).toBe(totalInicial);
  });

  test('deve restaurar todos os filtros ao clicar no botão de reset', async ({ page }) => {
    await page.goto('/index.html');

    const totalInicial = await page.locator('#regioes-visiveis').textContent();

    // Altera filtros
    await page.fill('#busca', 'Frankfurt');
    await page.selectOption('#continente', 'Europa');
    await page.uncheck('#filtro-localzones');

    // Clica em restaurar
    await page.click('#btn-reset-filtros');

    await expect(page.locator('#busca')).toHaveValue('');
    await expect(page.locator('#continente')).toHaveValue('');
    await expect(page.locator('#filtro-localzones')).toBeChecked();
    await expect(page.locator('#regioes-visiveis')).toHaveText(totalInicial);
  });

  test('deve exibir painel de detalhes ao selecionar infraestrutura', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#regioes-visiveis')).not.toHaveText('0');

    // Filtra para um único ponto para facilitar o clique preciso
    await page.fill('#busca', 'sa-east-1');
    await page.waitForTimeout(800); // Aguarda estabilização do mapa após fitBounds

    const marker = page.locator('.leaflet-marker-icon').first();
    await expect(marker).toBeVisible({ timeout: 10000 });
    await marker.click({ force: true });

    const detalhes = page.locator('#detalhes-regiao');
    await expect(detalhes.locator('h2')).toBeVisible({ timeout: 10000 });
    await expect(detalhes.locator('.detalhes-grid')).toBeVisible({ timeout: 10000 });
  });

  test('deve ser responsivo em tela móvel', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('.controles')).toBeVisible();
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('#mapa')).toBeVisible();
  });
});

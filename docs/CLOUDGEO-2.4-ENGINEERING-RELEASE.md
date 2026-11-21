# 🚀 CloudGeo 2.4 — Engineering Release Report
## Quality Engineering, Supply Chain Security & Data Reliability

---

### 1. Sumário Executivo

A versão **CloudGeo 2.4** representa uma evolução estrutural completa do projeto CloudGeo, consolidando qualidade automatizada (CI/CD), segurança da cadeia de suprimentos (*Supply Chain Security*), governança e acurácia rigorosa dos catálogos de infraestrutura da Amazon Web Services (AWS), além de auditoria integrada de segurança defensiva.

A aplicação permanece 100% estática, compatível com a hospedagem no **AWS Amplify Hosting**, sem adição de dependências de runtime proprietárias, sem custos adicionais de infraestrutura e com estrita preservação do design visual e da experiência do usuário.

| Métrica / Dimensão | CloudGeo 2.1 (Baseline) | CloudGeo 2.4 (Atual) | Evolução |
|---|---|---|---|
| **Dependências em Runtime** | CDN Externa (`unpkg.com`) | 100% Vendoring Local (`vendor/`) | Eliminação de dependência de terceiros |
| **Política de Scripts (CSP)** | `script-src 'self' https://unpkg.com` | `script-src 'self'` | Superfície XSS drasticamente reduzida |
| **Verificação de Integridade** | Apenas tags HTML (SRI) | SRI no HTML + Validador SHA criptográfico local | Integridade garantida em build/teste e runtime |
| **Regiões AWS** | 39 Regiões ativas | 39 Regiões ativas (4 partições) | Metadados de governança enriquecidos |
| **AWS Local Zones** | 46 Local Zones | 49 Local Zones (+3 em 2026: Atenas, Istambul, Hanói) | 100% alinhado com fontes oficiais da AWS |
| **Cidades com PoPs CloudFront** | 108 Cidades | 108 Cidades (esclarecido: 750+ PoPs físicos) | Métrica contextualizada sem ambiguidade |
| **Total de Pontos de Infraestrutura** | 193 pontos | 196 pontos | +3 zonas auditadas e verificadas |
| **Governança dos Catálogos** | Sem metadados de auditoria | `versaoEsquema`, `estadoOperacional`, `fonteOficial`, `dataUltimaVerificacao` | Rastreabilidade e conformidade contínua |
| **Garantia de Qualidade (QA)** | Testes ad-hoc manuais | Lint + Validador JSON + 9 Testes Unitários + 16 E2E Playwright | Pipeline determinístico automatizado |
| **Pipeline de CI/CD** | Apenas build do Amplify | GitHub Actions (`quality.yml`) com Actions fixadas por SHA | Verificação a cada Push e Pull Request |

---

### 2. Arquitetura do Sistema: Antes vs. Depois

#### 2.1. Arquitetura CloudGeo 2.1 (Baseline)
```text
Navegador do Usuário
    │
    ├── HTML / CSS / JS (AWS Amplify Hosting)
    ├── Dependências Leaflet & MarkerCluster ──► unpkg.com (CDN pública terceira)
    └── Tiles Cartográficos ──► OpenStreetMap
```
*Vulnerabilidade inerente:* Risco de supply chain attack, indisponibilidade ou latência na CDN pública unpkg.com; ausência de validação automatizada pré-deploy.

#### 2.2. Arquitetura CloudGeo 2.4 (Engenharia & Hardening)
```text
Desenvolvedor ──► Git Push / PR ──► GitHub Actions (quality.yml)
                                      ├── Lint sintático JS
                                      ├── Validação de integridade do vendoring (SHA-384/256)
                                      ├── Validação de esquema e dados dos catálogos (196 pontos)
                                      ├── Testes unitários de filtros e agregações (Node.js)
                                      └── Testes E2E multi-dispositivo (Playwright Desktop/Mobile)
                                      
                                      ▼ (Deploy automático seguro via Git)
                                AWS Amplify Hosting
                                      │
                                      ▼
Navegador do Usuário ◄────────────────┴─────────────────────────┐
    │                                                          │
    ├── HTML5 Semântico (CSP: script-src 'self', SRI SHA-384) │
    ├── vendor/leaflet/ (Arquivos locais verificados)          │ (Origem única)
    ├── vendor/markercluster/ (Arquivos locais verificados)    │
    ├── dados/*.json (Catálogos auditados com governança)      │
    └── OpenStreetMap Tiles (Attribution obrigatória preservada)
```

---

### 3. Detalhamento das Alterações por Operação

#### 3.1. CloudGeo 2.2 — Quality & CI/CD
1. **Infraestrutura de Testes e Build**:
   - `package.json` e `package-lock.json` criados com escopo estrito de `devDependencies` (`@playwright/test`, `playwright`).
   - Servidor local cross-platform `scripts/serve.js` implementado em Node.js nativo com validação rigorosa contra path traversal.
   - Script de validação `scripts/validate-catalogs.js` para assegurar:
     - Sintaxe válida em todos os catálogos JSON.
     - Unicidade e não duplicidade de chaves `id`.
     - Delimitação geográfica correta (`-90 <= lat <= 90` e `-180 <= lng <= 180`).
     - Presença de campos obrigatórios (`id`, `nome`, `codigo`, `pais`, `continente`, `lat`, `lng`, etc.).
     - Categorias, continentes, partições e estados operacionais permitidos.
     - Proteção contra Prototype Pollution em propriedades de objeto.
2. **Testes Unitários (`tests/unit/data-filters.test.js`)**:
   - 9 testes unitários usando o test runner nativo do Node.js (`node:test` e `node:assert`).
   - Cobertura completa de filtragem por texto, código de região, continente, camadas ativas/inativas, ordenação alfabética de continentes e cálculos agregados de métricas.
3. **Testes End-to-End (`tests/e2e/cloudgeo.spec.js`)**:
   - 16 cenários automatizados cobrindo Desktop e Mobile (Chromium):
     - Inicialização sem erros de console ou CSP.
     - Carregamento de catálogos e renderização do dashboard (196 pontos).
     - Busca universal e filtragem por texto.
     - Seleção de continentes no dropdown.
     - Alternância de visibilidade das camadas (Regiões, Local Zones, CloudFront).
     - Restauração de visão global e reset de filtros.
     - Abertura e preenchimento do painel lateral de detalhes.
     - Responsividade e usabilidade mobile.
   - Mocking de tiles de mapa com imagem PNG transparente 1x1, garantindo execução 100% determinística, rápida (11.7s) e sem dependência de rede externa.
4. **GitHub Actions Workflow (`.github/workflows/quality.yml`)**:
   - Disparado em `push` e `pull_request` nas branches `main` e `feature/**`.
   - Concorrência configurada com `cancel-in-progress: true` para cancelar builds redundantes.
   - Permissões mínimas (`permissions: contents: read`).
   - Actions oficiais do GitHub fixadas por commit SHA (`actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683` e `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af`).
   - Execução de `npm ci`, lint, verificação de integridade de vendor, validação de catálogos, testes unitários e testes E2E.

#### 3.2. CloudGeo 2.3 — Supply Chain Security
1. **Vendoring Local de Dependências**:
   - Todas as 5 dependências de runtime e recursos estáticos associados foram baixados para `vendor/`:
     - `vendor/leaflet/leaflet.css` (v1.9.4)
     - `vendor/leaflet/leaflet.js` (v1.9.4)
     - `vendor/leaflet/images/` (`marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`, `layers.png`, `layers-2x.png`)
     - `vendor/markercluster/MarkerCluster.css` (v1.5.3)
     - `vendor/markercluster/MarkerCluster.Default.css` (v1.5.3)
     - `vendor/markercluster/leaflet.markercluster.js` (v1.5.3)
   - Licenças oficiais incluídas localmente:
     - `vendor/leaflet/LICENSE` (BSD-2-Clause)
     - `vendor/markercluster/LICENSE` (MIT License)
2. **Manifesto e Verificador de Integridade**:
   - `vendor/integrity-manifest.json` com versão, procedência oficial, caminho e hashes criptográficos SHA-384 e SHA-256 para cada um dos 12 arquivos locais.
   - Script `scripts/verify-vendor-integrity.js` que audita o hash dos arquivos locais antes de cada build ou teste.
3. **Endurecimento de Content Security Policy (CSP)**:
   - Removido `https://unpkg.com` de `script-src` e `style-src` em `index.html` e `customHttp.yml`.
   - `script-src 'self'` exclusivamente.
   - `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`.
   - Hashes SRI (`sha384-...`) mantidos e revalidados em todas as tags `<link>` e `<script>` locais com `crossorigin="anonymous"`.

#### 3.3. CloudGeo 2.4 — Data Automation & Accuracy
1. **Auditoria e Resolução de Divergências**:
   - Identificada a divergência histórica de AWS Local Zones: em 2026, a AWS inaugurou três novas zonas locais internacionais:
     - Atenas, Grécia (`eu-central-1-ath-1`, ancorada em Frankfurt)
     - Istambul, Turquia (`eu-central-1-ist-1`, ancorada em Frankfurt)
     - Hanói, Vietnã (`ap-southeast-1-han-1`, ancorada em Singapura)
   - Catálogo atualizado de 46 para **49 Local Zones**, totalizando **196 pontos** de infraestrutura.
   - Clarificação métrica sobre CloudFront: o catálogo documenta 108 cidades metropolitanas mundiais com Edge PoPs; o card e a interface agora explicitam "108 Cidades (750+ PoPs físicos)".
2. **Governança de Metadados**:
   - Adicionados os campos padronizados em cada registro dos 3 catálogos:
     - `versaoEsquema: "2.4"`
     - `estadoOperacional: "operacional"`
     - `fonteOficial: "https://aws.amazon.com/..."`
     - `dataUltimaVerificacao: "2026-11-21"`
3. **Automação de Auditoria Periódica**:
   - Script `scripts/audit-aws-data.js` que compara os registros locais com a API oficial de faixas de IP da AWS (`https://ip-ranges.amazonaws.com/ip-ranges.json`).
   - Produção automática do relatório `dados/RELATORIO_AUDITORIA_DADOS.md`.
   - Tratamento defensivo de falhas de rede sem perda de dados e sem commits automáticos (exige revisão humana).
4. **Interface Enriquecida**:
   - Exibição da data da última atualização no cabeçalho ("Atualizado: Nov/2026").
   - Link direto e seguro para a documentação técnica oficial da AWS dentro do painel lateral de detalhes da infraestrutura.

#### 3.4. Auditoria Integrada de Segurança Defensiva
- Implementada validação por regex (`/^https?:\/\//i`) em `app.js` para garantir que apenas links HTTP/HTTPS legítimos sejam renderizados, mitigando riscos de Open Redirect ou injeção `javascript:`.
- Sanitização de caminho com `path.relative()` e bloqueio de caracteres nulos em `scripts/serve.js`.
- Relatório técnico completo arquivado em `docs/SECURITY-AUDIT-INTEGRATED.md`.

---

### 4. Justificativas Técnicas e Trade-offs

| Decisão Técnica | Benefício Primário | Trade-off / Mitigação |
|---|---|---|
| **Vendoring local em vez de CDN unpkg.com** | Resiliência total contra quedas de CDN externa, imunidade contra supply-chain poisoning em runtime e CSP estrita (`script-src 'self'`). | Adiciona ~280 KB de arquivos estáticos versionados no repositório. Totalmente desprezível para Git e cacheado eficientemente pelo AWS Amplify. |
| **Preservação de `style-src 'unsafe-inline'`** | Compatibilidade funcional indispensável com o Leaflet.js, que calcula e aplica coordenadas e transforms CSS diretamente nos elementos DOM dos marcadores. | Mitigado pela ausência total de injeção HTML dinâmica (`textContent` estrito), CSP rígida nos scripts (`'self'`) e ausência de APIs de escrita de terceiros. |
| **Mocking de tiles cartográficos nos testes E2E** | Testes 100% determinísticos, reproduzíveis offline e sem consumir cotas públicas do OpenStreetMap Nominatim/Tileserver. | Smoke tests manuais ou pós-deploy devem validar o carregamento visual dos tiles reais em produção. |
| **Adesão ao Node.js test runner nativo** | Zero dependências adicionais (como Jest, Vitest ou Mocha) no `package.json`, simplificando a esteira e reduzindo superfícies de ataque em devDependencies. | Requer Node.js 18+ (suportado por padrão no ecossistema atual e no GitHub Actions runner ubuntu-latest). |
| **Auditoria periódica semiautomatizada (sem commit automático)** | Garante acurácia e integridade contra respostas malformadas ou alterações estruturais da AWS sem degradar a estabilidade do repositório em produção. | Exige intervenção de um engenheiro para revisar o relatório gerado antes de commitar novos registros nos catálogos. |

---

### 5. Procedência e Licenciamento das Dependências

Todas as dependências locais foram verificadas quanto à procedência e conformidade de licença:

| Dependência | Versão | Licença | Arquivos Locais | Procedência Oficial |
|---|---|---|---|---|
| **Leaflet** | 1.9.4 | BSD-2-Clause | `vendor/leaflet/leaflet.js`<br>`vendor/leaflet/leaflet.css`<br>`vendor/leaflet/images/*`<br>`vendor/leaflet/LICENSE` | [Leafletjs.com](https://leafletjs.com) / [GitHub](https://github.com/Leaflet/Leaflet) |
| **Leaflet.markercluster** | 1.5.3 | MIT License | `vendor/markercluster/leaflet.markercluster.js`<br>`vendor/markercluster/MarkerCluster.css`<br>`vendor/markercluster/MarkerCluster.Default.css`<br>`vendor/markercluster/LICENSE` | [GitHub](https://github.com/Leaflet/Leaflet.markercluster) |

---

### 6. Resultados dos Testes de Regressão e Validação

```text
> npm test

✔ Sintaxe JavaScript (node --check app.js): PASSOU
✔ Integridade das Dependências (12/12 arquivos verificados): PASSOU (Exit Code 0)
✔ Validação de Catálogos (196 registros em 3 catálogos): PASSOU (0 erros, 0 duplicidades)
✔ Testes Unitários (9/9 suites em node:test): PASSOU (0 falhas, 146ms)
✔ Testes E2E Playwright (16/16 testes em Chromium Desktop & Mobile): PASSOU (11.7s)
```

1. **Testes Unitários (9 cenários)**:
   - Filtro sem critérios (retorna total de pontos).
   - Busca por texto (cidade).
   - Busca por código de região.
   - Filtro por continente.
   - Alternância de camadas ativas.
   - Combinação de múltiplos filtros.
   - Extração alfabética de continentes únicos.
   - Cálculo de métricas agregadas.
   - Tratamento de lista vazia.
2. **Testes E2E (16 cenários)**:
   - Ausência de erros de console e CSP nas resoluções Desktop (1280x720) e Mobile (375x667).
   - Validação da renderização do mapa e marcadores agrupados.
   - Validação dos fluxos de busca, seleção de continente, toggles de camada e reset.
   - Abertura e inspeção de dados arquiteturais no painel de detalhes.

---

### 7. Riscos Residuais e Estratégia de Mitigação

1. **Uso de `'unsafe-inline'` na diretiva `style-src` da CSP**:
   - *Risco:* Injeção potencial de estilos CSS arbitrários caso ocorresse injeção no DOM.
   - *Mitigação:* `app.js` utiliza exclusivamente APIs seguras do DOM (`document.createElement`, `element.textContent`, `element.append`), sem qualquer chamada a `innerHTML`, `outerHTML` ou `document.write`. Scripts externos estão proibidos (`script-src 'self'`).
2. **Disponibilidade dos Tiles Públicos do OpenStreetMap**:
   - *Risco:* Falha transitória na CDN do OpenStreetMap pode impedir a visualização dos mapas de fundo.
   - *Mitigação:* As camadas de marcadores, clusters e painel de informações permanecem 100% operacionais mesmo se os tiles falharem. Atribuição legal mantida conforme termos de uso da OSM Foundation.
3. **Atualizações de Infraestrutura Física da AWS**:
   - *Risco:* Lançamento contínuo de novas regiões ou zonas pela AWS tornando os catálogos desatualizados.
   - *Mitigação:* Script periódico `scripts/audit-aws-data.js` para monitoramento automatizado e relatório de divergências.

---

### 8. Procedimento de Rollback

Caso seja identificado qualquer comportamento anômalo após o merge ou deploy no AWS Amplify Hosting:

1. **Reversão via Git**:
   ```bash
   git checkout main
   git revert -m 1 <COMMIT_MERGE_SHA>
   git push origin main
   ```
2. **Reversão via Console AWS Amplify Hosting**:
   - Acesse o Console AWS Amplify > CloudGeo > Deployments.
   - Localize o deployment da versão 2.1 (commit `9150b05` ou PR #3).
   - Clique em **Redeploy this version**. O tráfego será restabelecido instantaneamente para o artefato anterior.

---

### 9. Procedimento de Validação Pós-Deploy

Após o merge do PR e conclusão do build automático no AWS Amplify Hosting:

1. **Verificação de Cabeçalhos HTTP**:
   ```bash
   curl -I https://main.d2cijkf9j4klap.amplifyapp.com
   ```
   *Checagens esperadas:*
   - `Content-Security-Policy`: Contém `script-src 'self'` (sem `unpkg.com`), `object-src 'none'`.
   - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains`.
   - `X-Content-Type-Options`: `nosniff`.
   - `X-Frame-Options`: `DENY`.
   - `Referrer-Policy`: `strict-origin-when-cross-origin`.
   - `Permissions-Policy`: `geolocation=(), camera=(), microphone=(), payment=()`.
2. **Verificação no Navegador**:
   - Abrir o DevTools (F12) > Console.
   - Confirmar zero erros de CSP, SRI ou CORS.
   - Verificar na aba Rede (*Network*) que todos os recursos JavaScript, CSS e imagens são carregados da mesma origem (`/vendor/...` e `/dados/...`), sem requisições para `unpkg.com`.
   - Confirmar que o dashboard exibe 196 pontos (39 Regiões, 49 Local Zones, 108 Cidades com PoPs).

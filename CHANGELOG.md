# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.4.0] - 2026-11-22

### Adicionado
- **Quality Gates & CI/CD**: Workflow do GitHub Actions (`.github/workflows/quality.yml`) com validação sintática, auditoria de integridade de dependências, validação estrutural de catálogos, 10 testes unitários reais e 16 testes ponta a ponta com Playwright.
- **Módulo Isomórfico de Dados (`data-filters.js`)**: Extração da lógica de filtragem, busca, extração de continentes e cálculo de métricas para módulo UMD compartilhado entre o navegador e o test runner nativo do Node.js.
- **Supply Chain Security**: Armazenamento local (*vendoring*) de 100% das dependências externas em `vendor/` (Leaflet 1.9.4 e Leaflet.markercluster 1.5.3), acompanhadas de seus respectivos arquivos de licença (BSD-2-Clause e MIT).
- **Manifesto Criptográfico de Integridade**: Arquivo `vendor/integrity-manifest.json` com hashes SHA-384 e SHA-256 de todos os 12 arquivos locais e script de validação contínua `scripts/verify-vendor-integrity.js`.
- **Preservação Binária Multiplataforma**: Arquivo `.gitattributes` configurando `vendor/** -text` e `* text=auto eol=lf`, eliminando inconsistências de hash entre Windows e Linux.
- **Sincronização Determinística no Playwright**: Substituição de pausas arbitrárias (`waitForTimeout`) por escuta ativa ao evento oficial `'moveend'` do Leaflet e verificação de fim de animação de zoom.
- **Segregação de Artefatos no Host**: Arquivo `amplify.yml` configurado com publicação estrita por allowlist em `artifacts.files`, impedindo a publicação de ferramentas de desenvolvimento no CDN de produção.
- **Automação de Governança de Dados**: Workflow agendado (`.github/workflows/data-audit.yml`) e script `scripts/audit-aws-data.js` para auditoria periódica contra `ip-ranges.amazonaws.com` e documentação oficial da AWS.
- **Reconciliação Factual dos Catálogos**: Classificação transparente das 49 Local Zones entre 35 operacionais (GA), 13 anunciadas (em planejamento) e 1 reclassificada (Detroit - AWS Wavelength), além de 108 cidades metropolitanas com CloudFront PoPs (750+ PoPs físicos consolidados).
- **Nova Arquitetura Oficial**: Diagrama modelado no Eraser (`docs/architecture/cloudgeo-2.4-architecture.png`) representando o fluxo completo de Cloudflare DNS, AWS Amplify Hosting, Amazon CloudFront, ACM, GitHub Actions e OpenStreetMap.
- **Domínio Personalizado de Produção**: Disponibilização em `https://cloudgeo.joseairton.dev.br` com certificado TLS via ACM e DNS gerenciado via Cloudflare em modo *DNS Only*.
- **Evidências de Validação em Produção**: Documento `docs/PRODUCTION-VALIDATION.md` registrando a conformidade dos cabeçalhos HTTP defensivos e o roteamento de borda.

### Modificado
- **README.md**: Reestruturação profissional abrangendo visão geral, arquitetura de sistemas, governança de dados, DevSecOps, stack tecnológico e decisões arquiteturais.
- **Content Security Policy**: Política de scripts endurecida para `script-src 'self'`, eliminando autorizações para `unpkg.com`.

---

## [2.1.0] - 2026-11-21

### Adicionado
- **Hardening de Cabeçalhos HTTP**: Configuração do arquivo `customHttp.yml` no AWS Amplify Hosting implementando HSTS (`max-age=31536000; includeSubDomains`), Content Security Policy, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy e Permissions-Policy.
- **Subresource Integrity (SRI)**: Adição de atributos `integrity` e `crossorigin="anonymous"` nos recursos externos carregados pelo `index.html`.
- **Baseline de Testes de Regressão**: Implementação inicial de testes de ponta a ponta com Playwright.

---

## [2.0.0] - 2026-11-19

### Adicionado
- **Expansão Multicamadas de Infraestrutura**:
  - 39 Regiões AWS ativas contemplando as 4 partições oficiais (`aws`, `aws-us-gov`, `aws-cn`, `aws-eusc`).
  - Inclusão da região European Sovereign Cloud (`eusc-de-east-1` em Brandemburgo, Alemanha).
  - 46 Local Zones e 108 cidades metropolitanas com Points of Presence do CloudFront.
- **Leaflet MarkerCluster**: Agrupamento visual dinâmico com modo *spiderfy* para metrópoles com múltiplos nós de infraestrutura.
- **Dashboard e Filtros em Tempo Real**: Painel com métricas atualizadas por camada e controles independentes de visibilidade.
- **Painel Lateral de Detalhes**: Exibição de atributos arquiteturais ao clicar em nós do mapa.

---

## [1.0.0] - 2026-11-15

### Adicionado
- Versão inicial do CloudGeo com mapa interativo baseado em Leaflet.js.
- Catálogo básico de regiões comerciais da AWS.
- Filtro por continente e busca por nome.
- Deploy estático contínuo no AWS Amplify Hosting.

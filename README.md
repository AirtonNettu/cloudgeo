# ☁️ CloudGeo 2.4 — AWS Global Infrastructure Explorer

**Explore a infraestrutura global da Amazon Web Services (AWS) através de uma experiência geográfica interativa, precisa, segura e moderna.**

CloudGeo 2.4 é a versão de engenharia da aplicação web educacional desenvolvida para ajudar engenheiros, arquitetos de nuvem, estudantes e entusiastas a visualizar e explorar a distribuição geográfica mundial da AWS: **Regiões AWS**, **AWS Local Zones** e **CloudFront Points of Presence (Edge Locations)**.

Construído com HTML5, CSS3, JavaScript puro (ES6+), Leaflet.js e Leaflet.markercluster 100% hospedados localmente (*vendoring*), o CloudGeo combina cartografia interativa de alta performance com uma arquitetura estática de baixo custo hospedada no **AWS Amplify Hosting**, com governança rigorosa de dados e esteira de CI/CD automatizada.

[🌐 Live Demo](https://main.d2cijkf9j4klap.amplifyapp.com) · [💻 GitHub Repository](https://github.com/AirtonNettu/cloudgeo) · [☁️ AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/) · [📚 Fontes & Metadados](dados/FONTES.md) · [📋 Release Report](docs/CLOUDGEO-2.4-ENGINEERING-RELEASE.md)

---

## 🎯 Visão Geral do Projeto

Compreender como a infraestrutura física de nuvem está distribuída globalmente é fundamental para projetar arquiteturas resilientes, com alta disponibilidade (HA), baixa latência e conformidade com requisitos de residência de dados (LGPD, GDPR, etc.).

No entanto, explorar essa infraestrutura apenas por meio de tabelas de documentação pode ser abstrato e pouco intuitivo.

**O CloudGeo 2.4 fornece um mapa interativo unificado que categoriza e contextualiza três camadas fundamentais da rede global da AWS:**

1. **Regiões AWS (39 Regiões ativas)**: Hubs geográficos completos e independentes com múltiplas Zonas de Disponibilidade (AZs), diferenciando claramente as 4 partições oficiais:
   - **Comerciais Padrão (`aws`) — 34 Regiões**: Cobrindo Américas, Europa, Ásia, Oceania e África, incluindo lançamentos recentes como `ap-east-2` (Taipei) e `ap-southeast-6` (New Zealand).
   - **AWS GovCloud (`aws-us-gov`) — 2 Regiões**: Isoladas nos EUA para conformidade governamental estrita (FedRAMP High, ITAR).
   - **AWS China (`aws-cn`) — 2 Regiões**: Isoladas e operadas por parceiros locais licenciados (Sinnet em Pequim e NWCD em Ningxia).
   - **AWS European Sovereign Cloud (`aws-eusc`) — 1 Região**: Inaugurada em janeiro de 2026 em Brandemburgo, Alemanha (`eusc-de-east-1`), totalmente isolada e operada exclusivamente por residentes na UE para atender aos requisitos de soberania digital (GDPR, Schrems II).
2. **AWS Local Zones (49 Local Zones ativas)**: Extensões de regiões que colocam computação e armazenamento em centros metropolitanos para latência de um dígito em milissegundos (< 10 ms), incluindo adições de 2026: Atenas (`eu-central-1-ath-1`), Istambul (`eu-central-1-ist-1`) e Hanói (`ap-southeast-1-han-1`).
3. **CloudFront Points of Presence (108 Cidades com PoPs)**: Nós de borda para entrega acelerada de conteúdo (CDN) e resolução DNS (Route 53). *Nota: o catálogo registra as 108 cidades metropolitanas oficiais com infraestrutura de borda, e não o número físico de datacenters/servidores (a AWS opera 750+ PoPs físicos globalmente).*

O projeto é 100% estático, sem backend proprietário ou banco de dados, maximizando confiabilidade, segurança e minimizando custos operacionais. Todas as métricas do painel são calculadas dinamicamente a partir dos datasets carregados.

---

## ✨ Funcionalidades do CloudGeo 2.4

| Funcionalidade | Descrição |
|---|---|
| 🗺️ **Mapa Global Interativo** | Navegue pelo mapa mundial com controles de zoom e limites dinâmicos |
| 📍 **Marcadores Distintos por Categoria** | Ícones vetoriais exclusivos para Regiões (☁️ laranja), Local Zones (⚡ azul) e CloudFront (🌐 roxo) |
| 🗂️ **Filtros Independentes de Camadas** | Ative e desative camadas de infraestrutura individualmente com contadores em tempo real |
| 🧩 **Agrupamento Inteligente (MarkerCluster)** | Agrupamento de nós próximos para evitar poluição visual e modo spiderfy em áreas densas |
| 🔎 **Busca Universal** | Pesquise em tempo real por nome, código de região/zona, cidade, país, continente ou região pai |
| 🌍 **Filtro de Continentes** | Isole visualmente a infraestrutura em qualquer um dos 6 continentes cobertos (padronização geográfica com Oriente Médio integrado à Ásia) |
| 📊 **Dashboard em Tempo Real** | 5 cards com estatísticas de Regiões, Local Zones, Cidades com PoPs, Continentes e Pontos Visíveis (196 totais) |
| ☁️ **Painel de Detalhes Enriquecido** | Exibe metadados arquiteturais: AZs, ano de lançamento, região pai de ancoragem, coordenadas e link oficial |
| 🧭 **Legenda Dinâmica** | Identificação clara dos tipos de nós presentes no mapa |
| 🛡️ **Supply Chain Security & CSP** | Dependências 100% vendored localmente, SRI validado e política CSP restrita (`script-src 'self'`) |
| 🧪 **Qualidade e CI/CD Integrados** | Testes unitários com test runner nativo do Node.js e testes E2E com Playwright em GitHub Actions |
| 📱 **Design Responsivo & Dark Mode** | Interface adaptada para desktop, tablets e smartphones, preservando a identidade visual AWS |
| ↺ **Restauração de Visão** | Botão para resetar filtros e reposicionar a câmera no panorama global instantaneamente |

---

## 🏗️ Arquitetura do Sistema

O CloudGeo 2.4 preserva a arquitetura estática moderna aliada a práticas defensivas de engenharia e supply chain:

```text
Desenvolvedor
    │
    │ Git Push (branch / pull request)
    ▼
GitHub Repository (AirtonNettu/cloudgeo)
    │
    ├── GitHub Actions (quality.yml: Lint, Integridade Vendor, Validação de Dados, Unit, E2E)
    │
    ▼ (Deploy automático após merge)
AWS Amplify Hosting (us-east-1)
    │
    │ HTTPS com cabeçalhos defensivos (customHttp.yml)
    ▼
Navegador do Usuário
    │
    ├── HTML5 Semântico + CSS3 Dark Theme
    ├── app.js (Lógica de visualização, busca e filtros)
    ├── Dependências Locais (vendor/leaflet/ e vendor/markercluster/ com SRI)
    ├── Fetch paralelo seguro (Promise.all):
    │     ├── dados/regioes.json (39 regiões com governança v2.4)
    │     ├── dados/local_zones.json (49 zonas com governança v2.4)
    │     └── dados/cloudfront_pops.json (108 cidades com governança v2.4)
    └── Map Tiles (OpenStreetMap com atribuição legal)
```

### Decisões de Arquitetura

| Decisão | Justificativa |
|---|---|
| **Arquitetura 100% Estática** | Elimina complexidade de servidores, custos fixos e superfícies de ataque |
| **Vendoring Local de Dependências** | Elimina riscos de supply chain e dependência de tempo de execução de CDNs públicas (unpkg) |
| **Content Security Policy Estrita** | Bloqueia execução de scripts não autorizados (`script-src 'self'`, `object-src 'none'`) |
| **Datasets JSON com Governança** | Rastreabilidade através de campos de esquema, estado operacional, data de checagem e fonte oficial |
| **Leaflet MarkerCluster** | Mantém alta taxa de quadros (60 fps) e evita sobreposição de marcadores em capitais com múltiplos nós |
| **Manipulação DOM Segura** | Uso estrito de APIs nativas (`createElement`, `textContent`, `append`), eliminando vulnerabilidades XSS |
| **Degradação Graciosa** | Fallback defensivo caso o plugin de cluster falhe, garantindo funcionamento ininterrupto |

---

## 📁 Estrutura de Diretórios

```text
cloudgeo/
├── .github/
│   └── workflows/
│       └── quality.yml         # Pipeline CI de qualidade e testes automatizados
├── dados/
│   ├── regioes.json            # Catálogo oficial de Regiões AWS comerciais (39 registros)
│   ├── local_zones.json        # Catálogo oficial de AWS Local Zones (49 registros)
│   ├── cloudfront_pops.json    # Catálogo de cidades com CloudFront PoPs (108 registros)
│   ├── FONTES.md               # Documentação metodológica, fontes e partições
│   └── RELATORIO_AUDITORIA_DADOS.md # Relatório da auditoria de dados contra AWS IP Ranges
├── docs/
│   ├── CLOUDGEO-2.4-ENGINEERING-RELEASE.md # Relatório oficial de engenharia da release 2.4
│   ├── SECURITY-AUDIT-INTEGRATED.md        # Relatório da auditoria de segurança integrada
│   └── architecture/
│       └── cloudgeo-architecture.svg       # Diagrama vetorial oficial da arquitetura
├── scripts/
│   ├── audit-aws-data.js       # Automação de verificação periódica contra fontes públicas da AWS
│   ├── serve.js                # Servidor estático local seguro em Node.js nativo
│   ├── validate-catalogs.js    # Validador de integridade e regras de negócio dos catálogos
│   └── verify-vendor-integrity.js # Verificador de hashes criptográficos dos arquivos vendored
├── tests/
│   ├── e2e/
│   │   └── cloudgeo.spec.js    # Suíte Playwright multi-dispositivo (Desktop & Mobile)
│   └── unit/
│       └── data-filters.test.js # Testes unitários com test runner nativo do Node.js
├── vendor/
│   ├── integrity-manifest.json # Manifesto criptográfico SHA-384 / SHA-256 de todas as dependências
│   ├── leaflet/                # Leaflet 1.9.4 (JS, CSS, imagens e licença BSD-2-Clause)
│   └── markercluster/          # MarkerCluster 1.5.3 (JS, CSS e licença MIT)
├── customHttp.yml              # Cabeçalhos HTTP defensivos para AWS Amplify Hosting
├── index.html                  # Interface da aplicação, controles, dashboard e legenda
├── style.css                   # Design responsivo, tema escuro e customizações Leaflet
├── app.js                      # Inicialização Leaflet, busca, clustering e painel de detalhes
├── package.json                # Configuração do projeto e scripts de teste
├── playwright.config.js        # Configuração do framework de testes E2E Playwright
└── README.md                   # Documentação completa do projeto
```

---

## 🌎 Datasets e Cobertura Geográfica

Todos os conjuntos de dados foram compilados e verificados com base na documentação técnica oficial da AWS em **novembro de 2026**:

- **Regiões AWS (39 regiões ativas catalogadas)**:
  - 34 Regiões Comerciais Padrão (Partição `aws`), incluindo lançamentos recentes como `ap-east-2` (Taipei) e `ap-southeast-6` (New Zealand).
  - 2 Regiões AWS GovCloud nos EUA (Partição `aws-us-gov`).
  - 2 Regiões AWS China (Partição `aws-cn`, operadas por Sinnet e NWCD).
  - 1 Região AWS European Sovereign Cloud (Partição `aws-eusc`, `eusc-de-east-1` em Brandemburgo, Alemanha).
- **Subtotais Consolidados por Continente (39 Regiões)**:
  - **Ásia**: 16 regiões (14 comerciais padrão, incluindo Israel, e 2 AWS China)
  - **Europa**: 9 regiões (8 comerciais padrão e 1 European Sovereign Cloud)
  - **América do Norte**: 9 regiões (7 comerciais padrão e 2 GovCloud)
  - **Oceania**: 3 regiões (3 comerciais padrão)
  - **América do Sul**: 1 região (1 comercial padrão)
  - **África**: 1 região (1 comercial padrão)
- **AWS Local Zones (49 zonas locais ativas)**: centros metropolitanos com Parent Regions documentadas, incluindo expansões de 2026 em Atenas (`eu-central-1-ath-1`), Istambul (`eu-central-1-ist-1`) e Hanói (`ap-southeast-1-han-1`).
- **CloudFront Points of Presence (108 cidades catalogadas)**: cidades metropolitanas mundiais com presença oficial de PoPs de borda (esclarecendo que a métrica quantifica as cidades sedes documentadas, e não os 750+ PoPs físicos operados globalmente).
- **Classificação Continental Padronizada (6 continentes)**: África, América do Norte, América do Sul, Ásia, Europa e Oceania. Regiões e zonas do Oriente Médio são classificadas formalmente no continente asiático.

Consulte o documento [dados/FONTES.md](dados/FONTES.md) para detalhes completos de procedência, metodologia e partições.

> [!NOTE]
> As coordenadas geográficas representam centroides metropolitanos/urbanos de referência para renderização cartográfica. O CloudGeo **não** expõe nem armazena endereços confidenciais de data centers ou instalações privadas da AWS.

---

## 💻 Desenvolvimento Local e Qualidade

### Pré-requisitos

- Node.js (v18+ recomendado).
- Git.
- Navegador moderno (Chrome, Firefox, Safari, Edge).

### 1. Clonar o Repositório e Instalar Dependências de Teste

```bash
git clone https://github.com/AirtonNettu/cloudgeo.git
cd cloudgeo
npm ci
```

### 2. Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `npm test` | Executa a esteira completa de validação (lint, integridade de vendor, catálogos, unit e E2E) |
| `npm run lint:js` | Verifica a integridade sintática do arquivo principal `app.js` |
| `npm run verify:vendor` | Audita os hashes SHA-384 e SHA-256 de todas as bibliotecas locais em `vendor/` |
| `npm run validate:catalogs` | Executa a validação de esquema, tipos e integridade geográfica dos 196 registros |
| `npm run test:unit` | Executa os testes unitários de lógica de filtros usando o test runner nativo do Node.js |
| `npm run test:e2e` | Executa a suíte de testes ponta a ponta com Playwright em Desktop e Mobile |
| `npm run audit:data` | Executa auditoria periódica comparando os catálogos com a API oficial da AWS |
| `npm start` | Inicia o servidor local seguro em `http://localhost:8000` |

---

## 🧪 Suíte de Validações e Testes

- [x] **Lint sintático:** Verificação de sintaxe JavaScript com `node --check app.js`.
- [x] **Supply Chain Integrity:** Auditoria criptográfica de 12 arquivos em `vendor/` via `verify-vendor-integrity.js`.
- [x] **Integridade dos Catálogos:** 196 registros validados sem erros de campos obrigatórios, coordenadas ou IDs duplicados.
- [x] **Testes Unitários:** 9 cenários cobrindo busca universal, filtros de continente, camadas e agregações métricas.
- [x] **Testes End-to-End:** 16 testes Playwright cobrindo Desktop e Mobile (Chromium) sem requisições externas não mockadas.
- [x] **Auditoria de Segurança Integrada:** Validação estrita de URLs externas, caminhos canônicos no servidor local e cabeçalhos defensivos no `customHttp.yml`.
- [x] **Zero Erros de Console:** Navegação limpa de mensagens de erro ou avisos de violação de CSP.

---

## 📈 Roadmap

### Fase 1 — MVP Inicial
- [x] Aplicação web estática com Leaflet.js.
- [x] Catálogo inicial de regiões AWS.
- [x] Busca e filtro por continente.
- [x] Deploy contínuo via AWS Amplify Hosting.

### Fase 2 — CloudGeo 2.0 a 2.4 (Versão Atual)
- [x] Expansão do catálogo para 39 Regiões AWS (34 Comerciais, 2 GovCloud, 2 China e 1 European Sovereign Cloud).
- [x] Diferenciação das 4 partições (`aws`, `aws-us-gov`, `aws-cn`, `aws-eusc`) e escopos regulatórios.
- [x] Expansão para 49 AWS Local Zones (incorporando Atenas, Istambul e Hanói).
- [x] Adição da camada de CloudFront Points of Presence (108 cidades metropolitanas, 750+ PoPs físicos).
- [x] Subtotais consolidados por continente e padronização continental para 6 continentes.
- [x] Implementação de Leaflet MarkerCluster para navegação fluida em alta densidade.
- [x] Filtros independentes de camadas por chips clicáveis e dashboard em tempo real.
- [x] Vendoring local de bibliotecas externas eliminando dependência de CDNs públicas.
- [x] Hardening de segurança com SRI, Content Security Policy restrita e cabeçalhos HTTP defensivos.
- [x] Pipeline automatizado de testes unitários e testes E2E com Playwright em GitHub Actions.
- [x] Automação de auditoria periódica e governança de dados.

### Fase 3 — Evoluções Futuras
- [ ] Visualização de cabos submarinos e rotas de backbone AWS redundantes.
- [ ] Ferramenta de cálculo de latência teórica estimada entre regiões e zonas.
- [ ] Exportação de dados filtrados em formato GeoJSON e CSV.

---

## 👨‍💻 Autor

**José Airton**  
Software Engineering | Cloud Computing | DevSecOps  
GitHub: [@AirtonNettu](https://github.com/AirtonNettu)

---

**☁️ CloudGeo 2.4 — Explorando a infraestrutura global da AWS com qualidade, segurança e precisão.**

# ☁️ CloudGeo 2.0 — AWS Global Infrastructure Explorer

**Explore a infraestrutura global da Amazon Web Services (AWS) através de uma experiência geográfica interativa, precisa e moderna.**

CloudGeo 2.0 é uma evolução da aplicação web educacional desenvolvida para ajudar engenheiros, arquitetos de nuvem, estudantes e entusiastas a visualizar e explorar a distribuição geográfica mundial da AWS: **Regiões AWS**, **AWS Local Zones** e **CloudFront Points of Presence (Edge Locations)**.

Construído com HTML5, CSS3, JavaScript puro (ES6+) e Leaflet.js com Leaflet.markercluster, o CloudGeo combina cartografia interativa de alta performance com uma arquitetura estática de baixo custo hospedada no **AWS Amplify Hosting**.

[🌐 Live Demo](https://main.d2cijkf9j4klap.amplifyapp.com) · [💻 GitHub Repository](https://github.com/AirtonNettu/cloudgeo) · [☁️ AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/) · [📚 Fontes & Metadados](dados/FONTES.md)

---

## 🎯 Visão Geral do Projeto

Compreender como a infraestrutura física de nuvem está distribuída globalmente é fundamental para projetar arquiteturas resilientes, com alta disponibilidade (HA), baixa latência e conformidade com requisitos de residência de dados (LGPD, GDPR, etc.).

No entanto, explorar essa infraestrutura apenas por meio de tabelas de documentação pode ser abstrato e pouco intuitivo.

**O CloudGeo 2.0 fornece um mapa interativo unificado que categoriza e contextualiza três camadas fundamentais da rede global da AWS:**

1. **Regiões AWS (38 Regiões ativas)**: Hubs geográficos completos e independentes com múltiplas Zonas de Disponibilidade (AZs), diferenciando claramente as partições:
   - **Comerciais Padrão (`aws`) — 34 Regiões**: Incluindo lançamentos recentes como `ap-east-2` (Taipei) e `ap-southeast-6` (New Zealand).
   - **AWS GovCloud (`aws-us-gov`) — 2 Regiões**: Isoladas nos EUA para conformidade governamental estrita (FedRAMP High, ITAR).
   - **AWS China (`aws-cn`) — 2 Regiões**: Isoladas e operadas por parceiros locais qualificados (Sinnet em Pequim e NWCD em Ningxia).
   *(Nota: O catálogo reflete as 38 regiões públicas com endpoints documentados. A 39ª região frequentemente citada em estatísticas agregadas da AWS decorre da inclusão de regiões de segurança nacional dedicadas/classificadas ou soberanas restritas).*
2. **AWS Local Zones (46 Local Zones documentadas)**: Extensões de regiões que colocam computação e armazenamento em centros metropolitanos para latência de um dígito em milissegundos (< 10 ms).
3. **CloudFront Points of Presence (108 Cidades com PoPs)**: Nós de borda para entrega acelerada de conteúdo (CDN) e resolução DNS (Route 53). *Nota: o catálogo registra as 108 cidades metropolitanas oficiais com infraestrutura de borda, e não o número físico de datacenters/servidores (a AWS opera 750+ PoPs físicos globalmente).*

O projeto é 100% estático, sem backend proprietário ou banco de dados, maximizando confiabilidade, segurança e minimizando custos operacionais. Todas as métricas do painel são calculadas dinamicamente a partir dos datasets carregados.

---

## ✨ Funcionalidades do CloudGeo 2.0

| Funcionalidade | Descrição |
|---|---|
| 🗺️ **Mapa Global Interativo** | Navegue pelo mapa mundial com controles de zoom e limites dinâmicos |
| 📍 **Marcadores Distintos por Categoria** | Ícones vetoriais exclusivos para Regiões (☁️ laranja), Local Zones (⚡ azul) e CloudFront (🌐 roxo) |
| 🗂️ **Filtros Independentes de Camadas** | Ative e desative camadas de infraestrutura individualmente com contadores em tempo real |
| 🧩 **Agrupamento Inteligente (MarkerCluster)** | Agrupamento de nós próximos para evitar poluição visual e modo spiderfy em áreas densas |
| 🔎 **Busca Universal** | Pesquise em tempo real por nome, código de região/zona, cidade, país, continente ou região pai |
| 🌍 **Filtro de Continentes** | Isole visualmente a infraestrutura em qualquer um dos 6 continentes cobertos (padronização geográfica com Oriente Médio integrado à Ásia) |
| 📊 **Dashboard em Tempo Real** | 5 cards com estatísticas de Regiões, Local Zones, Cidades com PoPs, Continentes e Pontos Visíveis |
| ☁️ **Painel de Detalhes Enriquecido** | Exibe metadados arquiteturais: AZs, ano de lançamento, região pai de ancoragem e coordenadas |
| 🧭 **Legenda Dinâmica** | Identificação clara dos tipos de nós presentes no mapa |
| 📱 **Design Responsivo & Dark Mode** | Interface adaptada para desktop, tablets e smartphones, preservando a identidade visual AWS |
| ↺ **Restauração de Visão** | Botão para resetar filtros e reposicionar a câmera no panorama global instantaneamente |

---

## 🏗️ Arquitetura do Sistema

O CloudGeo 2.0 preserva a arquitetura estática moderna, sem custos de servidores nem dependências de backend:

```text
Desenvolvedor
    │
    │ Git Push (branch / pull request)
    ▼
GitHub Repository (AirtonNettu/cloudgeo)
    │
    │ CI/CD Automático
    ▼
AWS Amplify Hosting (us-east-1)
    │
    │ HTTPS / CDN Global
    ▼
Navegador do Usuário
    │
    ├── HTML5 Semântico + CSS3 Dark Theme
    ├── app.js (Lógica de visualização e filtros)
    ├── Fetch paralelo (Promise.all):
    │     ├── dados/regioes.json
    │     ├── dados/local_zones.json
    │     └── dados/cloudfront_pops.json
    ├── Leaflet.js + Leaflet.markercluster
    └── Map Tiles (OpenStreetMap)
```

### Decisões de Arquitetura

| Decisão | Justificativa |
|---|---|
| **Arquitetura 100% Estática** | Elimina complexidade de servidores, custos fixos e superfícies de ataque |
| **Datasets JSON Independentes** | Separação clara entre Regiões, Local Zones e CloudFront PoPs, facilitando auditoria e manutenção |
| **Leaflet MarkerCluster** | Mantém alta taxa de quadros (60 fps) e evita sobreposição de marcadores em capitais com múltiplos serviços |
| **Manipulação DOM Segura** | Uso estrito de APIs nativas (`createElement`, `textContent`, `append`) eliminando vulnerabilidades XSS |
| **Degradação Graciosa** | Fallback defensivo caso o plugin de cluster falhe, garantindo funcionamento ininterrupto |

---

## 📁 Estrutura de Diretórios

```text
cloudgeo/
├── dados/
│   ├── regioes.json            # Catálogo oficial de Regiões AWS comerciais
│   ├── local_zones.json        # Catálogo oficial de AWS Local Zones com Parent Regions
│   ├── cloudfront_pops.json    # Catálogo de cidades com CloudFront Points of Presence
│   └── FONTES.md               # Documentação metodológica, fontes e limitações técnicas
│
├── docs/
│   └── architecture/
│       └── cloudgeo-architecture.svg
│
├── .gitignore
├── index.html                  # Interface da aplicação, controles, dashboard e legenda
├── style.css                   # Design responsivo, tema escuro e customizações Leaflet
├── app.js                      # Inicialização Leaflet, busca, clustering e painel de detalhes
└── README.md                   # Documentação completa do projeto
```

---

## 🌎 Datasets e Cobertura Geográfica

Todos os conjuntos de dados foram compilados e verificados com base na documentação técnica oficial da AWS em **19 de novembro de 2026**:

- **Regiões AWS (38 regiões ativas catalogadas)**:
  - 34 Regiões Comerciais Padrão (Partição `aws`), incluindo adições confirmadas como `ap-east-2` (Taipei) e `ap-southeast-6` (New Zealand).
  - 2 Regiões AWS GovCloud nos EUA (Partição `aws-us-gov`).
  - 2 Regiões AWS China (Partição `aws-cn`, operadas por Sinnet e NWCD).
  - *Esclarecimento de escopo:* A AWS divulga institucionalmente o número de 39 Geographic Regions; o CloudGeo cataloga rigorosamente as 38 regiões com endpoints públicos documentados, excluindo infraestruturas restritas de segurança nacional que não possuem endpoints públicos de acesso geral.
- **AWS Local Zones (46 zonas locais)**: centros metropolitanos com Parent Regions documentadas (América do Norte, América do Sul, Europa, Ásia e África).
- **CloudFront Points of Presence (108 cidades catalogadas)**: cidades metropolitanas mundiais com presença oficial de PoPs de borda (esclarecendo que a métrica quantifica as cidades sedes documentadas, não os mais de 750+ PoPs físicos individuais).
- **Classificação Continental Padronizada (6 continentes)**: África, América do Norte, América do Sul, Ásia, Europa e Oceania. Regiões e zonas do Oriente Médio são classificadas formalmente no continente asiático.

Consulte o documento [dados/FONTES.md](dados/FONTES.md) para detalhes completos de procedência, metodologia e partições.

> [!NOTE]
> As coordenadas geográficas representam centroides metropolitanos/urbanos de referência para renderização cartográfica. O CloudGeo **não** expõe nem armazena endereços confidenciais de data centers ou instalações privadas da AWS.

---

## 💻 Desenvolvimento Local

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge).
- Git.
- Python 3 ou Node.js (apenas para servir os arquivos estáticos localmente).

### 1. Clonar o Repositório

```bash
git clone https://github.com/AirtonNettu/cloudgeo.git
cd cloudgeo
```

### 2. Iniciar um Servidor Local

Como os arquivos JSON são requisitados via Fetch API, utilize um servidor HTTP local simples:

**Com Python 3:**
```bash
python -m http.server 8000
```

**Com Node.js (npx):**
```bash
npx serve .
```

### 3. Acessar a Aplicação

Abra seu navegador em: `http://localhost:8000`

---

## 🧪 Validações Realizadas

- [x] Sintaxe e integridade estrutural de todos os arquivos JSON (`regioes.json`, `local_zones.json`, `cloudfront_pops.json`).
- [x] Validação das faixas de coordenadas (latitude entre -90 e 90, longitude entre -180 e 180).
- [x] Verificação de sintaxe JavaScript com `node --check app.js`.
- [x] Testes de navegação e renderização com Playwright headless browser.
- [x] Validação do agrupamento de clusters (Leaflet MarkerCluster) e modo spiderfy.
- [x] Validação da busca textual e filtragem cruzada com múltiplos termos ("São Paulo", códigos de região, continentes).
- [x] Validação da ativação/desativação independente de camadas de infraestrutura.
- [x] Validação do painel de detalhes com DOM semântico e seguro.
- [x] Teste de responsividade mobile e tablet.
- [x] Ausência de erros no console do navegador.

---

## 📈 Roadmap

### Fase 1 — MVP Inicial
- [x] Aplicação web estática com Leaflet.js.
- [x] Catálogo inicial de regiões AWS.
- [x] Busca e filtro por continente.
- [x] Deploy contínuo via AWS Amplify Hosting.

### Fase 2 — CloudGeo 2.0 (Versão Atual)
- [x] Expansão do catálogo para 38 Regiões AWS (34 Comerciais incluindo `ap-east-2` e `ap-southeast-6`, 2 GovCloud e 2 China).
- [x] Diferenciação de partições (`aws`, `aws-us-gov`, `aws-cn`) e escopo regulatório.
- [x] Adição da camada independente de AWS Local Zones (46 zonas com Parent Regions).
- [x] Adição da camada de CloudFront Points of Presence (108 cidades metropolitanas catalogadas).
- [x] Padronização continental para 6 continentes (Oriente Médio integrado à Ásia).
- [x] Implementação de Leaflet MarkerCluster para navegação fluida em alta densidade.
- [x] Filtros independentes de camadas por chips clicáveis.
- [x] Dashboard dinâmico expandido com 5 indicadores calculados em tempo real.
- [x] Legenda visual dinâmica e integrada.
- [x] Painel de detalhes enriquecido com metadados arquiteturais e descrições educativas.
- [x] Otimizações de layout responsivo para smartphones e tablets.
- [x] Documentação rigorosa de fontes, metadados e data de checagem (`dados/FONTES.md`).

### Fase 3 — Evoluções Futuras
- [ ] Visualização de cabos submarinos e rotas de backbone AWS redundantes.
- [ ] Ferramenta de cálculo de latência teórica estimada entre regiões e zonas.
- [ ] Exportação de dados filtrados em formato GeoJSON e CSV.

---

## 👨‍💻 Autor

**José Airton**  
Software Engineering | Backend Development | AWS Cloud Computing  
GitHub: [@AirtonNettu](https://github.com/AirtonNettu)

---

**☁️ CloudGeo 2.0 — Explorando a infraestrutura global da AWS com simplicidade e precisão.**

# 📚 Fontes e Metadados dos Dados de Infraestrutura Global AWS

Este documento descreve detalhadamente a metodologia, procedência oficial, datas de verificação efetiva, escopo de cobertura e limitações técnicas dos conjuntos de dados utilizados pelo **CloudGeo 2.0**.

---

## 1. Princípios de Coleta e Qualidade dos Dados

1. **Fontes Oficiais**: Todos os pontos, identificadores de região, zonas locais e cidades de borda foram verificados na documentação pública oficial da Amazon Web Services (AWS).
2. **Data de Efetiva Verificação Documental**: **19 de novembro de 2026**.
3. **Sem Localizações Confidenciais de Data Centers**: Em estrita conformidade com os protocolos de segurança física da computação em nuvem, **não são expostos endereços exatos de galpões, coordenadas sigilosas de data centers ou topografias de cabeamento**.
4. **Coordenadas Metropolitanas**: As coordenadas de latitude e longitude correspondem aos centroides urbanos e metropolitanos aproximados das cidades documentadas publicamente pela AWS.
5. **Classificação Geográfica Padronizada**: A divisão continental segue o padrão geográfico internacional (6 continentes habitados: África, América do Norte, América do Sul, Ásia, Europa e Oceania). Países do Oriente Médio (como Bahrein, Emirados Árabes Unidos, Israel e Omã) estão classificados geograficamente em seu continente correspondente (**Ásia**), não sendo contados como continente separado.

---

## 2. Categorias e Escopo da Infraestrutura

### 2.1 Regiões AWS (`dados/regioes.json`)
* **Definição**: Áreas geográficas isoladas compostas por múltiplos data centers independentes agrupados em Zonas de Disponibilidade (Availability Zones — AZs).
* **Total Catalogado**: 36 regiões ativas.
* **Diferenciação de Partições e Escopos**:
  A AWS organiza suas regiões em partições com escopos de governança, autenticação e conformidade regulatória distintos:
  1. **Comercial Padrão (Partição `aws`)**: 32 regiões globais de acesso público geral para empresas, desenvolvedores e organizações do mundo todo.
  2. **AWS GovCloud (Partição `aws-us-gov`)**: 2 regiões (`us-gov-east-1` e `us-gov-west-1`) isoladas física e logicamente, projetadas para atender aos requisitos de conformidade mais rigorosos do governo dos EUA (FedRAMP High, ITAR, DoD SRG Níveis 4-5).
  3. **AWS China (Partição `aws-cn`)**: 2 regiões (`cn-north-1` em Pequim e `cn-northwest-1` em Ningxia) isoladas do restante da rede global da AWS para conformidade regulatória e soberania de dados chinesa. Essas regiões são operadas por parceiros locais qualificados e licenciados (**Beijing Sinnet Technology Co., Ltd.** e **Ningxia Western Advanced Data Technology Co., Ltd. — NWCD**), possuindo contas e credenciais distintas da partição global da AWS.
* **Campos Registrados**:
  * `codigo`: Código identificador de API da região (ex.: `sa-east-1`, `us-gov-east-1`, `cn-north-1`).
  * `nome`: Nome oficial de apresentação.
  * `cidade`: Cidade ou região metropolitana sede.
  * `pais`: País de implantação.
  * `continente`: Continente geográfico padronizado.
  * `latitude` / `longitude`: Centroide metropolitano aproximado.
  * `tipo`: `"regiao"`.
  * `particao`: Identificador de partição IAM (`aws`, `aws-us-gov` ou `aws-cn`).
  * `tipoRegiao`: `"Comercial Padrão"`, `"AWS GovCloud"` ou `"AWS China"`.
  * `operador`: Operador responsável pela infraestrutura física.
  * `zonasDisponibilidade`: Quantidade de AZs ativas documentadas.
  * `anoLancamento`: Ano de início das operações públicas.
  * `descricaoEscopo`: Esclarecimento sobre o público-alvo e conformidade da partição.
* **Fontes Oficiais**:
  * [AWS Global Infrastructure — Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
  * [AWS GovCloud (US) Overview](https://aws.amazon.com/govcloud-us/)
  * [AWS in China Documentation & Regions](https://www.amazonaws.cn/en/about-aws/china/)
  * [AWS Service Endpoints and Quotas](https://docs.aws.amazon.com/general/latest/gr/rande.html)

---

### 2.2 AWS Local Zones (`dados/local_zones.json`)
* **Definição**: Extensões de uma Região AWS que colocam serviços de computação (EC2), armazenamento (EBS) e banco de dados próximos a grandes centros populacionais e industriais onde não existe uma região tradicional. Seu objetivo principal é fornecer latência de um dígito em milissegundos (< 10 ms) para aplicações locais.
* **Escopo e Relação com Regiões**: Uma Local Zone depende de uma **Região Pai (Parent Region)** que ancora seu plano de controle e serviços de gerenciamento.
* **Total Catalogado**: 46 Local Zones distribuídas globalmente (América do Norte, América Latina, Europa, Ásia e África).
* **Campos Registrados**:
  * `codigo`: Identificador da zona ou grupo zonal (ex.: `us-east-1-bue-1`, `us-west-2-lax-1`).
  * `nome`: Nome descritivo da Local Zone.
  * `cidade`: Cidade metropolitana de instalação.
  * `pais`: País sede.
  * `continente`: Continente padronizado.
  * `regiaoPai`: Código da região de ancoragem (ex.: `us-east-1`, `us-west-2`, `sa-east-1`).
  * `regiaoPaiNome`: Nome da região de ancoragem.
  * `latitude` / `longitude`: Centro urbano aproximado.
  * `tipo`: `"local_zone"`.
* **Fontes Oficiais**:
  * [AWS Local Zones Locations](https://aws.amazon.com/about-aws/global-infrastructure/localzones/locations/)
  * [Available Local Zones — AWS Documentation](https://docs.aws.amazon.com/local-zones/latest/ug/available-local-zones.html)

---

### 2.3 CloudFront Points of Presence (`dados/cloudfront_pops.json`)
* **Definição e Esclarecimento Fundamental de Métrica**:
  * O arquivo `dados/cloudfront_pops.json` cataloga **cidades metropolitanas mundiais com Points of Presence (PoPs) oficiais confirmados**.
  * **Importante**: O total de **108 entradas neste arquivo representa 108 cidades**, e **NÃO** a quantidade física individual de servidores ou data centers de borda.
  * A AWS opera **mais de 750+ Points of Presence (PoPs) físicos** em mais de 100+ cidades em 50+ países, complementados por mais de 1.140+ PoPs integrados (Embedded PoPs). Cidades como São Paulo, Frankfurt, Nova York, Londres e Tóquio contam com múltiplos PoPs e Regional Edge Caches operando simultaneamente na mesma metrópole.
* **Serviços Atendidos**: Amazon CloudFront (CDN global) e Amazon Route 53 (DNS gerenciado global).
* **Campos Registrados**:
  * `nome`: Nome descritivo com a cidade do PoP.
  * `cidade`: Cidade sede dos Pontos de Presença.
  * `pais`: País do PoP.
  * `continente`: Continente geográfico padronizado.
  * `latitude` / `longitude`: Centroide metropolitano aproximado.
  * `tipo`: `"cloudfront_pop"`.
* **Fontes Oficiais**:
  * [Amazon CloudFront Key Features — Global Edge Network](https://aws.amazon.com/cloudfront/features/)
  * [Amazon Route 53 Global Network Details](https://aws.amazon.com/route53/)

---

## 3. Limitações Técnicas

1. **Finalidade Educativa e Arquitetural**: Os dados e coordenadas geográficas servem para compreensão visual da arquitetura global da nuvem, planejamento de zonas de latência e estudo de contingência. Não substituem o console oficial da AWS nem devem ser empregados para geolocalização física precisa.
2. **Atualização Dinâmica**: A expansão da infraestrutura da AWS é contínua. Futuras regiões ou PoPs adicionais anunciados pela AWS podem ser adicionados diretamente aos respectivos arquivos JSON em `dados/`.

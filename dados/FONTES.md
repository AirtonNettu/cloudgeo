# 📚 Fontes e Metadados dos Dados de Infraestrutura Global AWS

Este documento descreve detalhadamente a metodologia, procedência oficial, datas de verificação efetiva, escopo de cobertura e limitações técnicas dos conjuntos de dados utilizados pelo **CloudGeo 2.0**.

---

## 1. Princípios de Coleta e Qualidade dos Dados

1. **Fontes Oficiais**: Todos os pontos, identificadores de região, zonas locais e cidades de borda foram verificados na documentação pública oficial e comunicações institucionais da Amazon Web Services (AWS).
2. **Data de Efetiva Verificação Documental**: **19 de novembro de 2026**.
3. **Sem Localizações Confidenciais de Data Centers**: Em estrita conformidade com os protocolos de segurança física da computação em nuvem, **não são expostos endereços exatos de galpões, coordenadas sigilosas de data centers ou topografias de cabeamento**.
4. **Coordenadas Metropolitanas**: As coordenadas de latitude e longitude correspondem aos centroides urbanos e metropolitanos aproximados das cidades documentadas publicamente pela AWS.
5. **Classificação Geográfica Padronizada**: A divisão continental segue o padrão geográfico internacional (6 continentes habitados: África, América do Norte, América do Sul, Ásia, Europa e Oceania). Países do Oriente Médio (como Bahrein, Emirados Árabes Unidos, Israel e Omã) estão classificados geograficamente em seu continente correspondente (**Ásia**), não sendo contados como continente separado.

---

## 2. Categorias e Escopo da Infraestrutura

### 2.1 Regiões AWS (`dados/regioes.json`)
* **Definição**: Áreas geográficas isoladas compostas por múltiplos data centers independentes agrupados em Zonas de Disponibilidade (Availability Zones — AZs).
* **Total Efetivamente Verificado no Catálogo**: **39 regiões geográficas ativas** (alinhado exatamente ao total institucional de 39 Geographic Regions divulgado pela AWS).
* **Diferenciação de Partições e Escopos**:
  A AWS organiza suas regiões em 4 partições independentes com escopos de governança, autenticação e conformidade regulatória distintos:

  1. **Comerciais Padrão (Partição `aws`) — 34 Regiões**:
     - **Américas (8)**: `us-east-1` (N. Virginia), `us-east-2` (Ohio), `us-west-1` (N. California), `us-west-2` (Oregon), `ca-central-1` (Central), `ca-west-1` (Calgary), `mx-central-1` (Mexico Central), `sa-east-1` (São Paulo).
     - **Europa (8)**: `eu-west-1` (Ireland), `eu-west-2` (London), `eu-west-3` (Paris), `eu-central-1` (Frankfurt), `eu-central-2` (Zurich), `eu-north-1` (Stockholm), `eu-south-1` (Milan), `eu-south-2` (Spain).
     - **Ásia & Oriente Médio (14)**: `me-south-1` (Bahrain), `me-central-1` (UAE), `il-central-1` (Israel), `ap-east-1` (Hong Kong), `ap-east-2` (Taipei), `ap-south-1` (Mumbai), `ap-south-2` (Hyderabad), `ap-southeast-1` (Singapore), `ap-southeast-3` (Jakarta), `ap-southeast-5` (Malaysia), `ap-southeast-7` (Thailand), `ap-northeast-1` (Tokyo), `ap-northeast-2` (Seoul), `ap-northeast-3` (Osaka).
     - **Oceania (3)**: `ap-southeast-2` (Sydney), `ap-southeast-4` (Melbourne), `ap-southeast-6` (New Zealand).
     - **África (1)**: `af-south-1` (Cape Town).

  2. **AWS GovCloud (Partição `aws-us-gov`) — 2 Regiões**:
     - `us-gov-east-1` e `us-gov-west-1`: isoladas física e logicamente nos EUA para atender aos requisitos de conformidade rigorosos do governo norte-americano (FedRAMP High, ITAR, DoD SRG Níveis 4-5).

  3. **AWS China (Partição `aws-cn`) — 2 Regiões**:
     - `cn-north-1` (Pequim) e `cn-northwest-1` (Ningxia): isoladas do restante da rede global da AWS para conformidade regulatória chinesa. Operadas por parceiras locais licenciadas (**Sinnet** e **NWCD**), com credenciais exclusivas separadas da partição global.

  4. **AWS European Sovereign Cloud (Partição `aws-eusc`) — 1 Região**:
     - `eusc-de-east-1` (Brandenburg, Alemanha): lançada oficialmente em janeiro de 2026. Trata-se de uma partição completamente independente projetada para garantir soberania digital, privacidade e conformidade estrita da União Europeia (GDPR, Schrems II). Possui infraestrutura, plano de controle, contas e suporte 100% isolados e operados exclusivamente por cidadãos residentes na UE.

* **Subtotais Consolidados por Continente (39 Regiões)**:
  - **Ásia**: 16 regiões (14 comerciais padrão, incluindo Israel, e 2 AWS China)
  - **Europa**: 9 regiões (8 comerciais padrão e 1 European Sovereign Cloud)
  - **América do Norte**: 9 regiões (7 comerciais padrão e 2 GovCloud)
  - **Oceania**: 3 regiões (3 comerciais padrão)
  - **América do Sul**: 1 região (1 comercial padrão)
  - **África**: 1 região (1 comercial padrão)
  - **Total**: 16 + 9 + 9 + 3 + 1 + 1 = **39 Regiões**.

* **Fontes Oficiais**:
  * [AWS Global Infrastructure — Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
  * [Opening the AWS European Sovereign Cloud (AWS News Blog, Jan/2026)](https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/)
  * [AWS European Sovereign Cloud](https://aws.amazon.com/compliance/european-sovereign-cloud/)
  * [AWS GovCloud (US) Overview](https://aws.amazon.com/govcloud-us/)
  * [AWS in China Documentation & Regions](https://www.amazonaws.cn/en/about-aws/china/)
  * [AWS Service Endpoints and Quotas](https://docs.aws.amazon.com/general/latest/gr/rande.html)

---

### 2.2 AWS Local Zones (`dados/local_zones.json`)
* **Definição**: Extensões de uma Região AWS que colocam serviços de computação (EC2), armazenamento (EBS) e banco de dados próximos a grandes centros populacionais e industriais onde não existe uma região tradicional. Seu objetivo principal é fornecer latência de um dígito em milissegundos (< 10 ms) para aplicações locais.
* **Escopo e Relação com Regiões**: Uma Local Zone depende de uma **Região Pai (Parent Region)** que ancora seu plano de controle e serviços de gerenciamento.
* **Total Catalogado e Classificação Factual (49 Localidades)**:
  - **35 Operacionais / Disponíveis (GA)**: Listadas oficialmente na tabela *Available Local Zones* do guia da AWS, incluindo lançamentos recentes de 2026: Atenas (`eu-central-1-ath-1`), Istambul (`eu-central-1-ist-1`) e Hanói (`ap-southeast-1-han-1`), e cidades consolidadas como Atlanta, Chicago, Dallas, Denver, Los Angeles, Buenos Aires, Santiago, Lima, Bogotá, Copenhague, Hamburgo, Varsóvia, Muscat, Delhi, Kolkata, Auckland, Bangkok, Manila, etc.
  - **13 Anunciadas (Expansão em Planejamento / Não-GA)**: Anunciadas formalmente no mapa global de Local Zones da AWS, mas ainda em fase de implantação: Rio de Janeiro (`us-east-1-rio-1`), Toronto (`ca-central-1-yto-1`), Vancouver (`ca-central-1-yvr-1`), Munique (`eu-central-1-muc-1`), Praga (`eu-central-1-prg-1`), Amsterdam (`eu-west-1-ams-1`), Bruxelas (`eu-west-1-bru-1`), Viena (`eu-central-1-vie-1`), Lisboa (`eu-south-2-lis-1`), Joanesburgo (`af-south-1-jnb-1`), Nairóbi (`af-south-1-nbo-1`), Chennai (`ap-south-1-maa-1`) e Bengaluru (`ap-south-1-blr-1`).
  - **1 Reclassificada / Descontinuada**: Detroit (`us-east-2-dtw-1`), mantida documentalmente com status `descontinuado` por ter sido mapeada como Local Zone mas identificada oficialmente como zona **AWS Wavelength** (`us-east-1-wl1-dtw-wlz-1`).
* **Fontes Oficiais**:
  * [AWS Local Zones Locations](https://aws.amazon.com/about-aws/global-infrastructure/localzones/locations/)
  * [Available Local Zones — AWS Documentation](https://docs.aws.amazon.com/local-zones/latest/ug/available-local-zones.html)

---

### 2.3 CloudFront Points of Presence (`dados/cloudfront_pops.json`)
* **Definição e Esclarecimento Fundamental de Métrica**:
  * O arquivo `dados/cloudfront_pops.json` cataloga **cidades metropolitanas mundiais com Points of Presence (PoPs) oficiais confirmados**.
  * **Importante**: O total de **108 entradas neste arquivo representa 108 cidades sedes**, e **NÃO** a quantidade física individual de servidores ou data centers de borda.
  * A AWS opera **mais de 750+ Points of Presence (PoPs) físicos** em mais de 100+ cidades em 50+ países, complementados por mais de 1.140+ PoPs integrados (Embedded PoPs). Cidades como São Paulo, Frankfurt, Nova York, Londres e Tóquio contam com múltiplos PoPs e Regional Edge Caches operando simultaneamente na mesma metrópole.
* **Serviços Atendidos**: Amazon CloudFront (CDN global) e Amazon Route 53 (DNS gerenciado global).
* **Fontes Oficiais**:
  * [Amazon CloudFront Key Features — Global Edge Network](https://aws.amazon.com/cloudfront/features/)
  * [Amazon Route 53 Global Network Details](https://aws.amazon.com/route53/)

---

## 3. Limitações Técnicas

1. **Finalidade Educativa e Arquitetural**: Os dados e coordenadas geográficas servem para compreensão visual da arquitetura global da nuvem, planejamento de zonas de latência e estudo de contingência. Não substituem o console oficial da AWS nem devem ser empregados para geolocalização física precisa.
2. **Atualização Dinâmica**: A expansão da infraestrutura da AWS é contínua. Futuras regiões ou PoPs adicionais anunciados pela AWS podem ser adicionados diretamente aos respectivos arquivos JSON em `dados/`.

# 📚 Fontes e Metadados dos Dados de Infraestrutura Global AWS

Este documento descreve a procedência, metodologia, datas de verificação e limitações técnicas dos conjuntos de dados utilizados pelo **CloudGeo 2.0**.

---

## 1. Princípios de Coleta e Qualidade dos Dados

1. **Fontes Oficiais**: Todos os pontos e identificadores são obtidos e cruzados com a documentação pública oficial da Amazon Web Services (AWS).
2. **Sem Localizações Confidenciais**: O CloudGeo respeita a segurança e a soberania da AWS e dos seus clientes. Em conformidade com as diretrizes do setor, **não são expostos endereços físicos exatos, coordenadas de galpões ou localizações confidenciais de data centers**.
3. **Coordenadas de Referência Metropolitana**: As coordenadas geográficas (latitude e longitude) correspondem ao centro geográfico/urbano aproximado da cidade ou região metropolitana documentada pela AWS para a respectiva infraestrutura.
4. **Sem Dados Fictícios**: Nenhuma região, Local Zone ou Edge Location foi inventada ou inferida sem referência documentada.

---

## 2. Categorias de Infraestrutura

### 2.1 Regiões AWS (`regioes.json`)
* **Definição**: Áreas geográficas isoladas e totalmente independentes compostas por múltiplos data centers redundantes agrupados em Zonas de Disponibilidade (Availability Zones — AZs).
* **Campos**:
  * `codigo`: Identificador de API da região (ex.: `us-east-1`, `sa-east-1`).
  * `nome`: Nome oficial da região no console AWS.
  * `cidade`: Cidade ou área metropolitana principal.
  * `pais`: País de implantação.
  * `continente`: Continente geográfico.
  * `latitude` / `longitude`: Ponto de referência geográfico metropolitano.
  * `tipo`: `"regiao"`.
  * `anoLancamento`: Ano de início de operação da região.
  * `zonasDisponibilidade`: Quantidade de AZs ativas documentadas.
* **Fonte Oficial**: [AWS Global Infrastructure — Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
* **Data da Última Verificação**: Fevereiro de 2025.
* **Total Catalogado**: 32 regiões comerciais ativas nos 5 continentes.

---

### 2.2 AWS Local Zones (`local_zones.json`)
* **Definição**: Extensões de uma Região AWS que posicionam recursos de computação, armazenamento e banco de dados muito próximos de grandes centros industriais e urbanos, garantindo latências de um dígito em milissegundos (< 10 ms) para aplicações locais.
* **Diferença para Regiões**: Uma Local Zone não é uma região completa independente; seu plano de controle e serviços de gerenciamento são ancorados em uma **Região Pai (Parent Region)**.
* **Campos**:
  * `codigo`: Identificador oficial do zone group ou zona (ex.: `us-east-1-bue-1`, `us-west-2-lax-1`).
  * `nome`: Nome da Local Zone.
  * `cidade`: Cidade sede da Local Zone.
  * `pais`: País de instalação.
  * `continente`: Continente.
  * `regiaoPai`: Código da região AWS que ancora a Local Zone (ex.: `us-east-1`).
  * `regiaoPaiNome`: Nome da região de ancoragem.
  * `latitude` / `longitude`: Centro urbano de referência.
  * `tipo`: `"local_zone"`.
* **Fonte Oficial**:
  * [AWS Local Zones Locations](https://aws.amazon.com/about-aws/global-infrastructure/localzones/locations/)
  * [Available Local Zones — AWS Documentation](https://docs.aws.amazon.com/local-zones/latest/ug/available-local-zones.html)
* **Data da Última Verificação**: Fevereiro de 2025.
* **Total Catalogado**: 46 Local Zones distribuídas globalmente.

---

### 2.3 CloudFront Points of Presence / Edge Locations (`cloudfront_pops.json`)
* **Definição**: Pontos de Presença de borda da rede global da AWS que executam o Amazon CloudFront (CDN global) e o Amazon Route 53 (DNS gerenciado). Permitem cache de conteúdo estático e dinâmico, terminação TLS e proteção contra ataques DDoS (AWS Shield) na borda mais próxima dos clientes finais.
* **Diferença para Regiões e Local Zones**: PoPs não são ambientes de execução para instâncias genéricas EC2 de uso geral da mesma forma que Regiões ou Local Zones; são nós de entrega acelerada de conteúdo, terminação de conexão e computação de borda leve (CloudFront Functions e Lambda@Edge).
* **Campos**:
  * `nome`: Nome descritivo com a cidade do PoP.
  * `cidade`: Cidade sede do Ponto de Presença.
  * `pais`: País do PoP.
  * `continente`: Continente.
  * `latitude` / `longitude`: Ponto de referência urbano.
  * `tipo`: `"cloudfront_pop"`.
* **Fonte Oficial**: [Amazon CloudFront Key Features — Global Edge Network](https://aws.amazon.com/cloudfront/features/)
* **Data da Última Verificação**: Fevereiro de 2025.
* **Total Catalogado**: 108 cidades metropolitanas com PoPs confirmados.

---

## 3. Limitações Técnicas e Geográficas

1. **Precisão de Coordenadas**: As coordenadas geográficas fornecidas nos arquivos JSON representam centroids das cidades sedes para renderização cartográfica com a biblioteca Leaflet.js. Elas **não** devem ser utilizadas para fins de geolocalização física precisa, topografia de cabos submarinos ou roteamento de fibra óptica.
2. **Atualizações Contínuas da AWS**: A AWS anuncia e ativa periodicamente novas Regiões, Local Zones e Edge Locations. Os dados representam o panorama estável mais recente verificado nas fontes citadas.

# 📊 Relatório de Auditoria e Governança de Dados AWS
**Data da Auditoria**: 2026-11-21  
**Versão do Esquema**: 2.4  
**Status do Endpoint AWS IP Ranges**: Online (SyncToken: 1795282025)  

---

## 1. Sumário Executivo dos Catálogos

| Catálogo de Infraestrutura | Entradas Catalogadas | Métrica Representada | Estado Operacional | Fonte Primária Oficial |
|---|---|---|---|---|
| **Regiões AWS** | **39** | Centróides metropolitanos de Regiões AWS com múltiplas AZs | 100% Operacional (GA) | [AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/) |
| **AWS Local Zones** | **49** | Extensões metropolitanas de baixa latência (<10ms) | 100% Operacional (GA) | [Available Local Zones](https://docs.aws.amazon.com/local-zones/latest/ug/available-local-zones.html) |
| **CloudFront (Cidades com PoPs)** | **108** | Cidades metropolitanas mundiais com presença de borda (PoPs) | 100% Operacional (GA) | [CloudFront Global Edge Network](https://aws.amazon.com/cloudfront/features/) |
| **Total Global de Pontos** | **196** | Centróides geográficos urbanos consolidados | — | — |

---

## 2. Auditoria e Resolução de Discrepâncias

### 2.1 Regiões AWS (Total: 39)
- **Partições Oficiais Mapeadas**:
  - Comercial Padrão (`aws`): 34 regiões (incluindo recentes lançamentos como `ap-east-2` Taipei e `ap-southeast-6` New Zealand).
  - AWS GovCloud (`aws-us-gov`): 2 regiões (`us-gov-east-1` e `us-gov-west-1`).
  - AWS China (`aws-cn`): 2 regiões (`cn-north-1` Pequim e `cn-northwest-1` Ningxia).
  - AWS European Sovereign Cloud (`aws-eusc`): 1 região (`eusc-de-east-1` Brandemburgo, Alemanha).
- **Regiões Anunciadas vs Operacionais**:
  - O catálogo inclui estritamente regiões com disponibilidade geral (**GA**) ativas. Regiões em planejamento futuro (ex.: Chile, Reino da Arábia Saudita) permanecem registradas documentalmente em FONTES.md até o efetivo lançamento comercial.

### 2.2 AWS Local Zones (Total: 49)
- **Discrepância Investigada e Resolvida**:
  - Catálogo anterior registrava 46 Local Zones.
  - Verificação na documentação oficial (*Available Local Zones — AWS Documentation*) confirmou a disponibilidade geral (GA) de três novas zonas metropolitanas em 2026:
    1. **Atenas, Grécia** (`eu-central-1-ath-1`, Parent: `eu-central-1`).
    2. **Istambul, Turquia** (`eu-central-1-ist-1`, Parent: `eu-central-1`).
    3. **Hanói, Vietnã** (`ap-southeast-1-han-1`, Parent: `ap-southeast-1`).
  - O catálogo foi atualizado para **49 Local Zones ativas**, com seus respectivos códigos oficiais de Network Border Group e regiões pai documentadas.

### 2.3 CloudFront Points of Presence (Total: 108)
- **Esclarecimento Fundamental de Métrica**:
  - O catálogo registra **108 cidades metropolitanas mundiais sedes** de PoPs de borda.
  - Não confunde cidades catalogadas com quantidade física de data centers: a AWS opera **mais de 750+ PoPs físicos individuais** globalmente. Metrópoles de altíssima densidade (como São Paulo, Nova York, Londres, Tóquio e Frankfurt) abrigam múltiplos PoPs e Regional Edge Caches dentro da mesma cidade sede.

---

## 3. Cobertura Continental Consolidada

| Continente Padronizado | Regiões AWS | Local Zones | Cidades CloudFront | Total de Pontos |
|---|---|---|---|---|
| **América do Norte** | 9 | 20 | 30 | **59** |
| **América do Sul** | 1 | 5 | 8 | **14** |
| **Europa** | 9 | 12 | 32 | **53** |
| **Oceania** | 3 | 1 | 5 | **9** |
| **África** | 1 | 2 | 4 | **7** |
| **Ásia** | 16 | 9 | 29 | **54** |

---

## 4. Governança e Metadados dos Datasets

Cada registro em `dados/*.json` contém os seguintes campos de auditoria e governança:
- `versaoEsquema`: "2.4"
- `estadoOperacional`: "operacional"
- `dataUltimaVerificacao`: "2026-11-21"
- `fonteOficial`: URL da documentação oficial da AWS
- `categoria`: "regiao" | "local_zone" | "cloudfront_pop"

---

## 5. Procedimento de Revisão Manual para Fontes Não-Scrapeáveis

Para fontes cuja documentação oficial consiste em páginas institucionais em HTML sem API JSON direta (como páginas de lançamentos do AWS News Blog e listas de cidades do CloudFront):
1. Verificar os anúncios oficiais em [AWS What's New](https://aws.amazon.com/about-aws/whats-new/).
2. Confirmar o identificador de zona ou código de região na tabela do [AWS Local Zones User Guide](https://docs.aws.amazon.com/local-zones/latest/ug/available-local-zones.html).
3. Obter o centróide metropolitano urbano (nunca coordenadas de instalações físicas privadas).
4. Submeter a alteração através de Pull Request com os testes de qualidade automatizados (`npm test`).

# 🛡️ Relatório de Auditoria Integrada de Segurança — CloudGeo 2.4
**Metodologia de Referência**: NIST SP 800-115 · OWASP Top 10 Web & Client-Side · CIS Software Supply Chain Security Guide  
**Data da Auditoria**: 2026-11-21  
**Escopo**: Frontend estático (`index.html`, `style.css`, `app.js`, `data-filters.js`), dependências locais (`vendor/`), infraestrutura de automação (`scripts/`), pipelines CI/CD (`.github/workflows/`), configuração do host AWS Amplify (`customHttp.yml`, `amplify.yml`) e catálogos de dados (`dados/*.json`).

---

## 1. Sumário Executivo e Metodologia Objetiva

Esta auditoria técnica avaliou a postura de segurança defensiva do CloudGeo na release 2.4. A avaliação baseia-se em critérios objetivos de mitigação de vulnerabilidades, validação de integridade criptográfica, higiene de código e redução da superfície de ataque, sem atribuição de classificações subjetivas ou arbitrárias.

A aplicação permanece 100% estática, executada no navegador do usuário a partir do **AWS Amplify Hosting**, sem execução de código em backend proprietário e sem persistência em banco de dados.

### Principais Controles Auditados e Evidenciados:
1. **Supply Chain Security**: Eliminação de scripts de terceiros em runtime (`unpkg.com`). Todas as bibliotecas de visualização cartográfica foram baixadas e são servidas a partir da mesma origem (`vendor/`).
2. **Content Security Policy (CSP)**: Diretiva `script-src` restringida estritamente a `'self'`, bloqueando vetores comuns de Cross-Site Scripting (XSS).
3. **Subresource Integrity (SRI)**: Hashes criptográficos SHA-384 calculados e verificados de forma determinística em tags `<link>` e `<script>`, respaldados por um manifesto de integridade (`vendor/integrity-manifest.json`).
4. **Isolamento de Artefatos de Desenvolvimento**: Implementação de `amplify.yml` definindo exclusão explícita de `scripts/`, `tests/`, `.github/` e `node_modules/` do pacote final publicado no AWS Amplify.
5. **Higiene do DOM e Sanitização de URLs**: Validação estrita por expressão regular (`/^https?:\/\//i`) antes da renderização de qualquer hyperlink externo, eliminando esquemas de pseudoprotocolos maliciosos (`javascript:`, `data:`).

---

## 2. Matriz Objetiva de Controles e Achados de Segurança

| ID | Domínio / Controle | Componente | Severidade do Risco | Evidência Técnica de Implementação | Limitações e Riscos Residuais |
|---|---|---|---|---|---|
| **SEC-01** | **Cadeia de Suprimentos (Supply Chain)** | `vendor/` | **Alto** (pré-remediação) | 12 arquivos (Leaflet 1.9.4, MarkerCluster 1.5.3, imagens e licenças) armazenados localmente. Scripts de validação contínua `scripts/verify-vendor-integrity.js` auditam hashes SHA-384 e SHA-256 no CI e localmente. | Atualizações futuras de bibliotecas dependem de revisão manual e novo cálculo de hash no manifesto. |
| **SEC-02** | **Proteção contra Injeção de Scripts (CSP)** | `index.html`<br>`customHttp.yml` | **Alto** (pré-remediação) | `script-src 'self'` exclusivamente. Removida autorização a `https://unpkg.com`. `object-src 'none'`. `base-uri 'self'`. | A diretiva `style-src` mantém `'unsafe-inline'` para permitir posicionamento dinâmico de marcadores pelo Leaflet. Mitigado por DOM manipulation 100% seguro. |
| **SEC-03** | **Validação Criptográfica de Recursos (SRI)** | `index.html` | **Médio** | Tags `<link>` e `<script>` utilizam atributos `integrity="sha384-..."` e `crossorigin="anonymous"`. Normalização de quebras de linha (LF) em `.gitattributes` assegura consistência entre Linux, Windows e CDN. | O navegador cliente deve suportar SRI (todos os navegadores modernos suportam). |
| **SEC-04** | **Sanitização de URLs Externas** | `app.js` (`mostrarDetalhes`) | **Médio** | Validação estrita via regex `/^https?:\/\//i` antes de atribuir URLs ao atributo `href`. Links externos aplicam `rel="noopener noreferrer"` e `target="_blank"`. | Links direcionam para domínios oficiais da AWS previamente auditados. |
| **SEC-05** | **Isolamento do Servidor Local de Testes** | `scripts/serve.js` | **Baixo** | Servidor HTTP nativo Node.js vinculado exclusivamente à interface loopback (`127.0.0.1`), com validação canônica via `path.relative()` contra Directory Traversal e whitelist de extensões estáticas. | Utilizado exclusivamente para execução de testes locais e no pipeline de CI (não executado em produção). |
| **SEC-06** | **Prevenção de Prototype Pollution** | `scripts/validate-catalogs.js` | **Baixo** | Validador rejeita propriedades proibidas (`__proto__`, `constructor`, `prototype`) em qualquer nó dos arquivos JSON dos catálogos. | Catálogos são estáticos e versionados no Git. |
| **SEC-07** | **Segregação de Artefatos no Host** | `amplify.yml` | **Baixo** | Configuração declarativa de build do AWS Amplify restringindo a publicação a `index.html`, `style.css`, `app.js`, `data-filters.js`, `dados/**`, `vendor/**`, excluindo arquivos de teste, scripts e configurações de CI. | Depende da correta interpretação do arquivo `amplify.yml` pelo console do AWS Amplify. |
| **SEC-08** | **Cabeçalhos de Segurança HTTP em Borda** | `customHttp.yml` | **Médio** | Definição de `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy`. | A efetiva aplicação dos cabeçalhos depende do provisionamento da CDN CloudFront do Amplify em produção (validação pós-deploy). |

---

## 3. Análise Detalhada dos Mecanismos Defensivos

### 3.1 Integridade da Cadeia de Suprimentos e Preservação de Bytecode
- **Controle**: Os arquivos em `vendor/` possuem hashes fixados no arquivo `vendor/integrity-manifest.json`.
- **Prevenção de Divergência de Hash (CRLF vs LF)**: O arquivo `.gitattributes` define `vendor/** -text`, instruindo o Git a preservar os arquivos como sequências binárias exatas em qualquer sistema operacional (Linux, macOS, Windows).
- **Verificação no CI**: O comando `npm run verify:vendor` é executado como pré-requisito antes dos testes de integração.

### 3.2 Content Security Policy & Compatibilidade com Leaflet
- **Diretiva de Script**:
  `script-src 'self'` — Nenhum script remoto ou código avaliado dinamicamente (`eval`, `Function`) é executado.
- **Diretiva de Estilo**:
  `style-src 'self' 'unsafe-inline'` — O Leaflet.js injeta inline coordenadas de transformação (`style="transform: translate3d(...)`) em elementos do mapa. O uso de `'unsafe-inline'` em estilos é uma restrição arquitetural da biblioteca Leaflet 1.9.4, mitigada pela impossibilidade de execução de scripts arbitrários.
- **Diretiva de Imagens**:
  `img-src 'self' data: https://*.tile.openstreetmap.org` — Permite imagens locais, ícones embutidos em `data:` e tiles do OpenStreetMap sobre HTTPS.

### 3.3 Higiene do DOM e Tratamento de Dados
- **Manipulação Segura**: `app.js` não utiliza `innerHTML`, `outerHTML` ou `document.write`. Toda a renderização utiliza `document.createElement`, `element.textContent`, `element.replaceChildren` e `element.append`.
- **Filtros e Métricas Puros**: A lógica de negócio foi extraída para `data-filters.js`, módulo isomórfico livre de efeitos colaterais e testado unitariamente de forma isolada.

---

## 4. Riscos Residuais e Limitações Conhecidas

1. **Disponibilidade dos Tiles Públicos do OpenStreetMap**:
   - *Risco*: Indisponibilidade transitória ou bloqueio por excesso de requisições por parte da infraestrutura da OpenStreetMap Foundation.
   - *Mitigação*: Os marcadores, clusters e painéis de dados operam de forma autônoma mesmo se os tiles de fundo falharem.
2. **Dependência de Atualização Manual de Catálogos**:
   - *Risco*: Lançamento de novas zonas ou regiões pela AWS que não constem imediatamente no repositório.
   - *Mitigação*: Automação periódica via GitHub Actions (`.github/workflows/data-audit.yml`) que sinaliza divergências semanalmente sem modificar o código de forma descontrolada.

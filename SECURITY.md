# 🛡️ Política de Segurança (Security Policy)

O projeto **CloudGeo** valoriza a segurança, a privacidade e a integridade de seus usuários, da cadeia de suprimentos de software e da infraestrutura de hospedagem.

---

## 1. Versões com Suporte a Atualizações de Segurança

Apenas a versão mais recente em produção recebe correções de segurança ativas:

| Versão | Suportada | Notas |
| :---: | :---: | :--- |
| **2.4.x** | ✅ Sim | Versão atual estável e em produção |
| < 2.4.0 | ❌ Não | Versões anteriores arquivadas |

---

## 2. Como Reportar uma Vulnerabilidade (Responsible Disclosure)

Se você identificar uma potencial vulnerabilidade de segurança no CloudGeo (como problemas em políticas de cabeçalhos HTTP, falhas de sanitização, integridade de dependências ou exposição indevida de dados):

1. **Não abra uma Issue pública** detalhando a vulnerabilidade.
2. Utilize o mecanismo oficial de **GitHub Private Vulnerability Reporting** acessando a aba [Security > Advisories](https://github.com/AirtonNettu/cloudgeo/security/advisories) do repositório e clicando em **Report a vulnerability**.
3. Caso a opção de reporte privado não esteja disponível para seu perfil, entre em contato diretamente através do perfil do mantenedor no GitHub ([@AirtonNettu](https://github.com/AirtonNettu)).

### O que incluir no seu relatório:
- Descrição clara da vulnerabilidade e seu potencial impacto.
- Passos detalhados e reproduzíveis para demonstrar a condição de segurança (Proof of Concept).
- Componentes ou arquivos afetados.
- Sugestão de remediação técnica, se aplicável.

Agradecemos o esforço ético da comunidade e de pesquisadores de segurança que reportam falhas de maneira responsável antes de qualquer divulgação pública.

---

## 3. Práticas Defensivas Implementadas

O CloudGeo adota um modelo de defesa em profundidade (*Defense-in-Depth*):
- **Arquitetura 100% Estática**: Sem execução de código em backend proprietário e sem armazenamento em banco de dados.
- **Vendoring Local e Subresource Integrity (SRI)**: Dependências de terceiros são versionadas localmente em `vendor/` e auditadas criptograficamente com hashes SHA-384 e SHA-256 (`vendor/integrity-manifest.json`).
- **Content Security Policy (CSP) Estrita**: Diretiva `script-src` restringida exclusivamente a `'self'`.
- **Cabeçalhos HTTP Defensivos**: HSTS (`max-age=31536000; includeSubDomains`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy`.
- **Sanitização de Hiperlinks**: Validação estrita por regex (`/^https?:\/\//i`) antes de abrir qualquer link externo.
- **Segregação de Artefatos no Build**: Configuração `amplify.yml` utilizando allowlist para que arquivos de teste e scripts internos nunca sejam publicados no CDN.

# 🌐 Evidência de Validação em Produção — CloudGeo 2.4

Este documento registra formalmente a verificação de conectividade, resolução de domínio personalizado e inspeção dos cabeçalhos HTTP defensivos realizada em ambiente de produção após o deploy da versão **CloudGeo 2.4**.

---

## 1. Dados da Verificação

| Parâmetro | Detalhe |
|---|---|
| **Data e Hora da Verificação** | **22 de novembro de 2026, às 03:10:07 UTC** |
| **Domínio Oficial de Produção** | `https://cloudgeo.joseairton.dev.br` |
| **Hospedagem** | AWS Amplify Hosting |
| **Distribuição e CDN** | Amazon CloudFront (gerenciado via Amplify) |
| **Gerenciamento de DNS** | Cloudflare (registro CNAME em modo *DNS Only*) |
| **Status da Resposta** | `HTTP/1.1 200 OK` |

---

## 2. Cabeçalhos de Segurança HTTP Confirmados

A inspeção da resposta HTTP confirmou a aplicação efetiva dos seis cabeçalhos de segurança definidos em `customHttp.yml`:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

### Análise dos Controles de Segurança:
1. **Strict-Transport-Security (HSTS)**: Garante que navegadores comuniquem-se exclusivamente via HTTPS por 1 ano (`max-age=31536000`), incluindo todos os subdomínios (`includeSubDomains`). A diretiva `preload` foi deliberadamente omitida nesta fase conforme decisão técnica de mitigação de risco operacional.
2. **Content-Security-Policy (CSP)**:
   - `default-src 'self'`: Restringe a origem padrão de carregamento à própria origem da aplicação.
   - `script-src 'self'`: Elimina qualquer execução de scripts remotos ou CDNs públicas de terceiros.
   - `style-src 'self' 'unsafe-inline'`: Autoriza os estilos locais do Leaflet e permite o posicionamento e estilização dinâmica dos marcadores cartográficos.
   - `img-src 'self' data: https://*.tile.openstreetmap.org`: Permite o carregamento de imagens locais, data URIs e os tiles de mapa do OpenStreetMap.
   - `object-src 'none'`: Desabilita plugins legados como Flash e Java Applets.
   - `base-uri 'self'`: Impede manipulação da tag `<base>` para sequestro de caminhos relativos.
   - `frame-ancestors 'none'`: Impede que a aplicação seja embutida em `<iframe>`, `<frame>` ou `<object>` de terceiros, neutralizando ataques de clickjacking em nível de CSP.
3. **X-Frame-Options: DENY**: Proteção redundante contra clickjacking em navegadores legados que não suportam `frame-ancestors`.
4. **X-Content-Type-Options: nosniff**: Impede que o navegador infira tipos MIME diferentes dos declarados, mitigando ataques de MIME-confusion.
5. **Referrer-Policy: strict-origin-when-cross-origin**: Protege a privacidade do usuário enviando apenas a origem em requisições cross-origin e suprimindo o cabeçalho em conexões não seguras.
6. **Permissions-Policy**: Desativa o acesso a recursos sensíveis do dispositivo (`camera`, `microphone`, `geolocation`, `payment`, `usb`), minimizando a superfície de ataque no cliente.

---

## 3. Telemetria de Infraestrutura e Borda

A resposta HTTP apresentou cabeçalhos complementares característicos da infraestrutura de borda da AWS:

```http
Server: AmazonS3
X-Cache: Miss from cloudfront
X-Amz-Cf-Pop: FOR50-P6
Alt-Svc: h3=":443"; ma=86400
```

### Contextualização Técnica e Esclarecimentos:
- **Participação do Amazon CloudFront**: O CloudFront atua como camada de CDN gerenciada do AWS Amplify Hosting, terminando conexões TLS na borda mais próxima ao usuário e aplicando os cabeçalhos de resposta configurados.
- **Identificador de Borda (`X-Amz-Cf-Pop: FOR50-P6`)**: O código `FOR50-P6` corresponde a um Point of Presence (PoP) físico de borda do CloudFront localizado em **Fortaleza, Ceará, Brasil**, demonstrando o roteamento geográfico efetivo da requisição para a infraestrutura mais próxima na América do Sul.
- **Cabeçalho `Server: AmazonS3`**: O valor `AmazonS3` é retornado pela infraestrutura de armazenamento gerenciada internamente pelo AWS Amplify Hosting na região raiz (`us-east-1`). **Não significa** que um bucket S3 foi provisionado diretamente pelo desenvolvedor ou que há um bucket público configurado; trata-se do backend nativo do serviço gerenciado da AWS.
- **Cabeçalho `Alt-Svc: h3=":443"; ma=86400`**: O CloudFront anuncia ao navegador o suporte ao protocolo moderno **HTTP/3** sobre QUIC na porta 443 com validade de 24 horas (`ma=86400`). Este cabeçalho é um anúncio de capacidade para conexões futuras; ele **não comprova** que esta requisição específica utilizou HTTP/3 (a qual foi negociada via HTTP/1.1 / HTTP/2 conforme indicado no status da requisição).
- **Ressalva de Segurança**: A observação de cabeçalhos HTTP defensivos atesta a conformidade das políticas de borda configuradas, mas **não constitui certificação de segurança integral**. A segurança da aplicação é complementada por vendoring local, Subresource Integrity, sanitização estrita do DOM e ausência de banco de dados ou backend dinâmico.

---

## 4. Privacidade e Governança

Em estrita observância às práticas recomendadas de segurança:
- Nenhum identificador confidencial de requisição (`X-Amz-Cf-Id`), credenciais de acesso, ID de conta da AWS ou dados privados foram incluídos neste relatório.

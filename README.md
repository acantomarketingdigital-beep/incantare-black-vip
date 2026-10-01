# Incantare — Grupo VIP Black Antecipada (Joinville)

Landing estática (HTML/CSS/JS puro) para Meta Ads → Grupo VIP no WhatsApp. Sem build: a Vercel publica a raiz como está.

## Onde trocar os links
`js/app.js`, linhas 4–5 (únicos lugares):
```js
const VIP_WHATSAPP_URL = "https://chat.whatsapp.com/IPG0XB9kHQcCrYDNCIuFmL"; // mesmo grupo da LP VIP anterior
const AGENCY_WHATSAPP_URL = "https://wa.me/5541998362692?text=...";          // assinatura Adriano Marketing
```
Link com placeholder: o clique registra o evento mas não navega (aviso no console).

## Tracking
- GTM **`GTM-KT5CN4GV`** (script no `<head>` + noscript logo após `<body>`), também nas páginas legais.
- GA4 `G-BV46SKRELF` e Meta Pixel `1851466205395230` **não** ficam no código: são configurados dentro do GTM.
- O Pixel `1851466205395230` ("PIXEL GRUPO VIP") é o mesmo da LP VIP anterior. Ele é dedicado a grupos VIP para concentrar o aprendizado em quem entra nos grupos.

| Evento (dataLayer) | Quando | Campos |
|---|---|---|
| `landing_page_view` | 1x por carregamento | city, state, page_type, campaign_type, clinic, source_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, gclid |
| `vip_whatsapp_click` | qualquer CTA VIP, 150 ms antes de abrir o grupo | button_location (`hero` / `carousel` / `final_cta` / `sticky_mobile`), button_text, destination=`whatsapp_group` + todos os campos acima |
| `agency_footer_click` | link da assinatura da agência | source_page, clinic, city (NÃO é conversão da clínica) |

UTMs/fbclid/gclid ficam em `sessionStorage` (`incantare_black_vip_attribution`). Valor vazio/"undefined" na URL nunca sobrescreve um valor já salvo; campos ausentes vão como `""`.

## Configuração do GTM-KT5CN4GV

**Atalho:** importe `gtm/GTM-KT5CN4GV-import.json` (Admin → Importar contêiner → Mesclar). Ele cria tudo o que está listado abaixo.

Em 1/out/2026 a versão publicada deste container **ainda não tinha nenhuma tag**. Criar:

**Variáveis (Variável da camada de dados):** button_location, button_text, destination, city, state, page_type, campaign_type, clinic, source_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term.

**Acionadores (Evento personalizado):** `landing_page_view`, `vip_whatsapp_click`. Não criar nenhum para `agency_footer_click` que leve a Lead/Contact/VipGroupClick.

**Tags:**
1. *Google Tag* `G-BV46SKRELF`, em All Pages.
2. *GA4 Event* `landing_page_view`, no acionador `landing_page_view`, com os campos da página + UTMs.
3. *GA4 Event* `vip_whatsapp_click`, no acionador `vip_whatsapp_click`, com button_location, button_text, destination, city, state, page_type, campaign_type, clinic, source_page e as utm_* (sem fbclid/gclid/PII). Marcar como evento-chave no GA4.
4. *HTML personalizado* Meta Pixel base `fbq('init','1851466205395230'); fbq('track','PageView');`, em All Pages (uma vez por página).
5. *HTML personalizado* conversão, no acionador `vip_whatsapp_click`, **uma única conversão por clique**:
   ```html
   <script>typeof fbq==="function"&&fbq("track","Lead",{content_name:"Grupo VIP Black Antecipada",content_category:"grupo_vip_whatsapp",button_location:{{button_location}},clinic:"incantare",city:"joinville"});</script>
   ```
   Defina a sequência da tag para disparar depois da tag base do Pixel.

Depois: Visualizar (Tag Assistant), clicar nos 4 CTAs, conferir no Events Manager (Testar eventos) e Publicar.

## Arquivos
```
index.html          landing (hero, carrossel, CTA final, rodapé, assinatura)
css/style.css       estilos mobile first
js/app.js           configuração + tracking + carrossel + sticky
assets/             logo branco, 3 artes em WebP (1080 + 640px), og-image, favicons, fontes woff2
privacidade.html    termos.html    vercel.json
```

## Pendências
- Domínio: https://grupovipblack-incantarejoinville.adrianomarketing.com (metatag `facebook-domain-verification` no `<head>`).

# Incantare — Grupo VIP Black Antecipada (Joinville)

Landing estática (HTML/CSS/JS puro) para Meta Ads → Grupo VIP no WhatsApp. Sem build: a Vercel publica a raiz como está.

## Onde trocar os links
`js/app.js`, linhas 4–5 (são os únicos lugares):
```js
const VIP_WHATSAPP_URL = "COLOCAR_LINK_DO_GRUPO_AQUI";       // todos os CTAs do Grupo VIP
const AGENCY_WHATSAPP_URL = "COLOCAR_WHATSAPP_ADRIANO_AQUI"; // assinatura Adriano Marketing
```
Enquanto estiver com o placeholder, o clique registra o evento mas não navega (aviso no console).

## Tracking
- GTM `GTM-PNSMTRVH` (script no `<head>` + noscript logo após `<body>`), também nas páginas legais.
- GA4 `G-BV46SKRELF` e Meta Pixel `762018213673538` **não** são instalados no código: ficam dentro do GTM.

| Evento (dataLayer) | Quando | Campos |
|---|---|---|
| `landing_page_view` | 1x por carregamento | city, state, page_type, campaign_type, clinic, source_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, gclid |
| `vip_whatsapp_click` | qualquer CTA VIP, 150 ms antes de abrir o grupo | button_location (`hero` / `carousel` / `final_cta` / `sticky_mobile`), button_text, destination=`whatsapp_group` + todos os campos acima |
| `agency_footer_click` | link da assinatura da agência | source_page, clinic, city (NÃO é conversão da clínica) |

UTMs/fbclid/gclid ficam em `sessionStorage` (`incantare_black_vip_attribution`); um valor vazio/"undefined" na URL nunca sobrescreve um valor já salvo; campos ausentes vão como `""`.

## Configuração necessária no GTM-PNSMTRVH (ainda NÃO existe lá)
Auditoria do container publicado (1/out/2026): o GTM-PNSMTRVH é hoje o container da landing de **lábios**
(eventos `quiz_start` / `whatsapp_contact` → Pixel `Lead` / `Contact`). Ele não tem trigger para
`landing_page_view` nem para `vip_whatsapp_click`. A landing VIP antiga usa **outro** container
(`GTM-NGXFP667`, GA4 `G-G8PGQ8CQEE`, Pixel `1851466205395230`), em que `vip_whatsapp_click` dispara
`fbq('trackCustom','VipGroupClick',…)` + `fbq('track','Lead')`.

Para criar no GTM-PNSMTRVH:
1. Variáveis da camada de dados: button_location, button_text, destination, state, campaign_type, utm_source, utm_medium, utm_campaign, utm_content, utm_term (city, clinic, source_page e page_type já existem).
2. Triggers de evento personalizado: `landing_page_view`, `vip_whatsapp_click`.
3. GA4 — evento `landing_page_view` e evento `vip_whatsapp_click` (com os parâmetros da tabela; sem fbclid/gclid/PII).
4. Meta Pixel — no `vip_whatsapp_click`, **uma** conversão seguindo o padrão VIP anterior. Atenção: o Lead desse Pixel já é usado pela landing de lábios.
5. Não criar nenhuma tag para `agency_footer_click` que dispare Lead/Contact/VipGroupClick.

## Arquivos
```
index.html          landing (hero, carrossel, CTA final, rodapé, assinatura)
css/style.css       estilos mobile first
js/app.js           configuração + tracking + carrossel + sticky
assets/             logo branco, 3 artes em WebP (1080 + 640px), og-image, favicons, fontes woff2
privacidade.html    termos.html    vercel.json
```

## Pendências
- Colar os dois links em `js/app.js`.
- Quando o subdomínio em adrianomarketing.com estiver definido: `og:image` absoluto, `og:url` e `canonical` no `index.html`.

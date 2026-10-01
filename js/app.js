/* ============================================================
   CONFIGURAÇÃO — troque os links SOMENTE aqui
   ============================================================ */
const VIP_WHATSAPP_URL = "https://chat.whatsapp.com/IPG0XB9kHQcCrYDNCIuFmL";      // link do Grupo VIP (chat.whatsapp.com/...)
const AGENCY_WHATSAPP_URL = "https://wa.me/5541998362692?text=" + encodeURIComponent("Olá! Vi a página do Grupo VIP da Incantare e quero uma estrutura assim para a minha clínica."); // WhatsApp da Adriano Marketing (wa.me/...)

/* ============================================================
   Incantare Joinville — Grupo VIP Black Antecipada
   Tracking (dataLayer → GTM-KT5CN4GV → GA4 / Meta Pixel)
   ------------------------------------------------------------
   landing_page_view   -> 1x por carregamento real da página
   vip_whatsapp_click  -> todo CTA [data-vip-cta], ANTES de abrir o grupo
   agency_footer_click -> link da assinatura da agência (evento isolado)
   Sem PII: a página não tem formulário e não envia nome/telefone/e-mail.
   ============================================================ */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  var REDIRECT_DELAY_MS = 150;
  var STORAGE_KEY = "incantare_black_vip_attribution";
  var ATTRIBUTION_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
  var PAGE_CONTEXT = {
    city: "joinville",
    state: "sc",
    page_type: "vip_landing_page",
    campaign_type: "black_antecipada",
    clinic: "incantare",
    source_page: "grupo-vip-black-incantare-joinville"
  };

  /* ---------- Atribuição (UTMs + fbclid + gclid) ---------- */
  var memoryStore = {}; // fallback se sessionStorage estiver bloqueado

  function readStore() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) || {} : memoryStore;
    } catch (e) {
      return memoryStore;
    }
  }

  function writeStore(data) {
    memoryStore = data;
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* modo privado */ }
  }

  function isValidValue(v) {
    return typeof v === "string" && v.trim() !== "" && v !== "undefined" && v !== "null";
  }

  // Lê a URL e grava na sessão. Valor novo válido substitui; ausente/vazio NUNCA apaga o que já existe.
  function captureAttribution() {
    var stored = readStore();
    var qs;
    try { qs = new URLSearchParams(window.location.search); } catch (e) { return stored; }
    ATTRIBUTION_PARAMS.forEach(function (key) {
      var value = qs.get(key);
      if (isValidValue(value)) stored[key] = value.trim();
    });
    writeStore(stored);
    return stored;
  }

  // Sempre devolve as 7 chaves; ausentes vão como "" (nunca "undefined").
  function getAttribution() {
    var stored = readStore();
    var out = {};
    ATTRIBUTION_PARAMS.forEach(function (key) {
      out[key] = isValidValue(stored[key]) ? stored[key] : "";
    });
    return out;
  }

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }

  function isConfigured(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url);
  }

  /* ---------- Evento 1: landing_page_view (uma vez) ---------- */
  captureAttribution();
  if (!window.__incantareLpvSent) {
    window.__incantareLpvSent = true;
    window.dataLayer.push(assign({ event: "landing_page_view" }, PAGE_CONTEXT, getAttribution()));
  }

  /* ---------- Evento 2: vip_whatsapp_click ---------- */
  function trackVipClick(location, text) {
    window.dataLayer.push(assign({
      event: "vip_whatsapp_click",
      button_location: location,
      button_text: text,
      destination: "whatsapp_group"
    }, PAGE_CONTEXT, getAttribution()));
  }

  var navigating = false;

  function openAfterTracking(url) {
    if (!isConfigured(url)) {
      console.warn("[Incantare] Link do WhatsApp ainda não configurado em js/app.js");
      return;
    }
    navigating = true;
    setTimeout(function () {
      window.location.href = url;
      setTimeout(function () { navigating = false; }, 1500);
    }, REDIRECT_DELAY_MS);
  }

  function onVipClick(e) {
    if (e.type === "auxclick" && e.button !== 1) return; // botão direito: só abre o menu
    // Ctrl/⌘/botão do meio: deixa o navegador abrir em nova aba, mas registra o evento
    var newTab = e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
    var el = e.currentTarget;
    if (!newTab) e.preventDefault();
    if (navigating) return; // evita evento duplicado em toque duplo
    trackVipClick(el.getAttribute("data-vip-cta") || "unknown", el.getAttribute("data-text") || el.textContent.trim());
    if (!newTab) openAfterTracking(VIP_WHATSAPP_URL);
  }

  /* ---------- Evento da agência (isolado, nunca vira conversão da clínica) ---------- */
  function onAgencyClick(e) {
    if (e.type === "auxclick" && e.button !== 1) return;
    var newTab = e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
    if (!newTab) e.preventDefault();
    if (navigating) return;
    window.dataLayer.push({
      event: "agency_footer_click",
      source_page: PAGE_CONTEXT.source_page,
      clinic: PAGE_CONTEXT.clinic,
      city: PAGE_CONTEXT.city
    });
    if (!newTab) openAfterTracking(AGENCY_WHATSAPP_URL);
  }

  function bindLinks() {
    var vip = document.querySelectorAll("[data-vip-cta]");
    for (var i = 0; i < vip.length; i++) {
      if (isConfigured(VIP_WHATSAPP_URL)) vip[i].href = VIP_WHATSAPP_URL; // href real p/ acessibilidade/pressão longa
      vip[i].addEventListener("click", onVipClick);
      vip[i].addEventListener("auxclick", onVipClick);
    }
    var agency = document.querySelectorAll("[data-agency-cta]");
    for (var j = 0; j < agency.length; j++) {
      if (isConfigured(AGENCY_WHATSAPP_URL)) agency[j].href = AGENCY_WHATSAPP_URL;
      agency[j].addEventListener("click", onAgencyClick);
      agency[j].addEventListener("auxclick", onAgencyClick);
    }
  }

  /* ---------- Carrossel (scroll-snap nativo, sem biblioteca) ---------- */
  function initCarousel(root) {
    var track = root.querySelector("[data-track]");
    var slides = track.children;
    var dots = root.querySelectorAll("[data-dots] button");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    var current = 0;

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
    }

    function update() {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i === current && dots[i] && dots[i].getAttribute("aria-current") === "true") return;
      current = i;
      for (var d = 0; d < dots.length; d++) dots[d].setAttribute("aria-current", d === i ? "true" : "false");
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });

    for (var d = 0; d < dots.length; d++) {
      (function (idx) { dots[idx].addEventListener("click", function () { goTo(idx); }); })(d);
    }
    prev.addEventListener("click", function () { goTo(current - 1); });
    next.addEventListener("click", function () { goTo(current + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    });
    current = -1;
    update();
  }

  /* ---------- CTA fixo mobile ---------- */
  // Aparece depois que o CTA do hero sai da tela; some enquanto o botão do CTA final
  // está visível (evita dois botões iguais empilhados) e nunca aparece no desktop.
  function initSticky() {
    var bar = document.getElementById("sticky");
    var heroCta = document.querySelector('[data-vip-cta="hero"]');
    var finalCta = document.querySelector('[data-vip-cta="final_cta"]');
    if (!bar || !heroCta || !("IntersectionObserver" in window)) return;
    var link = bar.querySelector("a");
    var mq = window.matchMedia("(max-width: 767px)");
    var heroVisible = true;
    var finalVisible = false;
    var shown = false;

    function render() {
      var show = mq.matches && !heroVisible && !finalVisible && window.scrollY > 120;
      if (show === shown) return;
      shown = show;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      link.tabIndex = show ? 0 : -1;
      document.body.classList.toggle("has-sticky", mq.matches);
    }

    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting; render();
    }).observe(heroCta);
    if (finalCta) {
      new IntersectionObserver(function (entries) {
        finalVisible = entries[0].isIntersecting; render();
      }).observe(finalCta);
    }
    if (mq.addEventListener) mq.addEventListener("change", render); else mq.addListener(render);
    document.body.classList.toggle("has-sticky", mq.matches);
    render();
  }

  function init() {
    bindLinks();
    var carousel = document.querySelector("[data-carousel]");
    if (carousel) initCarousel(carousel);
    initSticky();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Debug no console: incantareTracking.getAttribution()
  window.incantareTracking = { getAttribution: getAttribution };
})();

/* =====================================================================
   Vibe Coding Manual — Lógica SPA
   --------------------------------------------------------------------------
   - Ruteo por hash (deep-linking) + navegación por botones .nav-link
   - Toggle de tema claro/oscuro persistente (localStorage + prefers-color-scheme)
   - Sidebar colapsable en móvil + overlay
   - Buscador con highlight de coincidencias y estado "sin resultados"
   - Copiado de prompts al portapapeles con toast + feedback visual
   ===================================================================== */

(() => {
  "use strict";

  /* ----------------------- Selectores cacheados ----------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const navLinks = $$(".nav-link");
  const sections = $$("section.section");
  const content = $("#content");
  const searchInput = $("#search-input");
  const themeToggle = $("#theme-toggle");
  const menuToggle = $("#menu-toggle");
  const sidebar = $("#sidebar");
  const overlay = $("#overlay");
  const toast = $("#toast");
  const toastMsg = $("#toast-message");
  const copyButtons = $$(".copy-btn");

  /* ----------------------- Ruteo SPA ---------------------------------- */
  /**
   * Activa la sección correspondiente al id recibido y resalta el botón
   * de navegación activo. Soporta deep-linking vía `#seccion`.
   * @param {string} sectionId - id de la sección (sin prefijo "section-")
   */
  function showSection(sectionId) {
    const id = sectionId || "inicio";
    const target = $(`#section-${id}`);
    if (!target) {
      // Fallback: si no existe, mostrar inicio.
      showSection("inicio");
      return;
    }

    sections.forEach((s) => s.classList.remove("active"));
    target.classList.add("active");

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === id);
      link.setAttribute("aria-current", link.dataset.section === id ? "page" : "false");
    });

    // Limpia resaltado de búsqueda al cambiar de sección.
    clearSearchHighlights();
    if (searchInput) searchInput.value = "";
    hideNoResults();

    // Cierra el sidebar en móvil al navegar.
    if (window.matchMedia("(max-width: 768px)").matches) closeSidebar();

    // Lleva el contenido al inicio para mejor UX.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Inicializa el deep-linking leyendo `location.hash`. */
  function initRouter() {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const section = link.dataset.section;
        // Actualiza el hash para permitir deep-linking (sin recarga).
        history.pushState(null, "", `#${section}`);
        showSection(section);
      });
    });

    window.addEventListener("popstate", () => {
      const hash = (location.hash || "#inicio").slice(1);
      showSection(hash);
    });

    // Carga inicial.
    const initialHash = (location.hash || "#inicio").slice(1);
    showSection(initialHash);
  }

  /* ----------------------- Tema claro/oscuro -------------------------- */
  const THEME_KEY = "vibe-theme";

  /** Aplica el tema y actualiza el atributo data-theme en <html>. */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      /* Storage bloqueado: no persistente pero funcional en sesión. */
    }
  }

  /** Devuelve el tema inicial preferido (guardado o del sistema). */
  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (_) { /*noop*/ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function initTheme() {
    applyTheme(getInitialTheme());
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }
  }

  /* ----------------------- Sidebar móvil + overlay ------------------- */
  function openSidebar() {
    sidebar?.classList.add("open");
    overlay?.classList.add("show");
    menuToggle?.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  function initSidebar() {
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        if (sidebar?.classList.contains("open")) closeSidebar();
        else openSidebar();
      });
    }
    overlay?.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  /* ----------------------- Copiado de prompts ------------------------ */
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      /* fallback abajo */
    }
    // Fallback para entornos no seguros (http) o navegadores antiguos.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function initCopyButtons() {
    copyButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const promptText = btn.dataset.prompt || "";
        const ok = await copyToClipboard(promptText);
        if (ok) {
          btn.classList.add("copied");
          const original = btn.textContent;
          btn.textContent = "¡Copiado!";
          showToast("Prompt copiado al portapapeles");
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.textContent = original;
          }, 1500);
        } else {
          showToast("No se pudo copiar. Selecciona el texto manualmente.");
        }
      });
    });
  }

  /* ----------------------- Buscador con highlight -------------------- */
  const HIGHLIGHT_NODE = "mark";
  const HIGHLIGHT_CLASS = "search-hit";
  const NO_RESULTS_ID = "search-no-results";

  // Elementos textualmente buscables ( headings, p, li, dd, dt, blockquote ).
  const SEARCH_SELECTOR = "h1, h2, h3, h4, p, li, dt, dd, blockquote";

  /** Crea un banner de "sin resultados" reutilizable. */
  function ensureNoResultsElement() {
    let el = document.getElementById(NO_RESULTS_ID);
    if (!el) {
      el = document.createElement("p");
      el.id = NO_RESULTS_ID;
      el.className = "no-results";
      el.textContent = "Sin resultados. Prueba con otro término.";
      content?.prepend(el);
    }
    return el;
  }

  function showNoResults() {
    ensureNoResultsElement().classList.add("show");
  }
  function hideNoResults() {
    document.getElementById(NO_RESULTS_ID)?.classList.remove("show");
  }

  /**
   * Resalta subcadenas dentro de los nodos de texto de un elemento.
   * Recorre recursivamente los childNodes sin romper listeners ni estructura.
   */
  function highlightInElement(el, regex) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // Evita resaltar dentro de <mark> o <script>/<style>.
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeName.toLowerCase();
        if (tag === HIGHLIGHT_NODE || tag === "script" || tag === "style") {
          return NodeFilter.FILTER_REJECT;
        }
        return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes = [];
    let current;
    while ((current = walker.nextNode())) textNodes.push(current);

    textNodes.forEach((node) => {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let last = 0;
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const idx = match.index;
        if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)));
        const mark = document.createElement(HIGHLIGHT_NODE);
        mark.className = HIGHLIGHT_CLASS;
        mark.textContent = match[0];
        frag.appendChild(mark);
        last = idx + match[0].length;
        if (match[0].length === 0) regex.lastIndex++; // evita bucle en match vacío
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      if (frag.childNodes.length) node.parentNode.replaceChild(frag, node);
    });
  }

  /** Resalta en TODAS las secciones (no solo en la visible). */
  function applySearchHighlights(query) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      clearSearchHighlights();
      hideNoResults();
      return;
    }
    clearSearchHighlights();
    // Escapa caracteres regex del query.
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");

    let hits = 0;
    sections.forEach((s) => {
      const targets = $$(SEARCH_SELECTOR, s);
      targets.forEach((t) => {
        const before = t.textContent || "";
        highlightInElement(t, regex);
        if ((t.textContent || "") !== before) hits++;
      });
    });

    if (hits === 0) showNoResults();
    else hideNoResults();
  }

  /** Elimina todos los <mark.search-hit> restaurando el texto original. */
  function clearSearchHighlights() {
    const marks = $$(`mark.${HIGHLIGHT_CLASS}`);
    marks.forEach((m) => {
      const text = m.textContent || "";
      const textNode = document.createTextNode(text);
      m.parentNode?.replaceChild(textNode, m);
    });
    // Normaliza nodos de texto adyacentes generados al des-resaltar.
    if (content) content.normalize();
  }

  /**
   * Salta a la primera sección visible que contenga un resaltado.
   * Útil para que el usuario vea directamente sus resultados.
   */
  function jumpToFirstHit() {
    const first = $(`mark.${HIGHLIGHT_CLASS}`);
    if (!first) return;
    let section = first.closest("section.section");
    if (!section) return;
    const sid = section.id?.replace("section-", "");
    if (sid) showSection(sid);
    // Resalta la tarjeta contenedora con un pulso.
    const card = first.closest(".card");
    if (card) {
      card.classList.add("locate-highlight");
      setTimeout(() => card.classList.remove("locate-highlight"), 1200);
    }
    requestAnimationFrame(() => first.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  /** Inicializa el buscador con debounce. */
  function initSearch() {
    if (!searchInput) return;
    let timer = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      const query = e.target.value;
      timer = setTimeout(() => {
        applySearchHighlights(query);
        if (query.trim()) jumpToFirstHit();
      }, 220);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        clearSearchHighlights();
        hideNoResults();
      }
    });
  }

  /* ----------------------- Atajos de teclado ------------------------- */
  function initShortcuts() {
    document.addEventListener("keydown", (e) => {
      // "/" enfoca el buscador (excepto cuando ya se escribe en un input).
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInput?.focus();
      }
      // "Alt+T" alterna el tema.
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        themeToggle?.click();
      }
    });
  }

  /* ----------------------- Inicialización ---------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSidebar();
    initRouter();
    initCopyButtons();
    initSearch();
    initShortcuts();
  });
})();

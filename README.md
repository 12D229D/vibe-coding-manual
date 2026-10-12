# Vibe Coding Manual (HTML5)

Manual de referencia y guía técnica sobre la metodología **Vibe Coding** — el paradigma
de desarrollo de software asistido por Inteligencia Artificial y agentes interactivos,
construido como una Single Page Application (SPA) en HTML5 semántico, CSS3 moderno y
JavaScript ES6+.

## ✨ Características

- **SPA con 10 secciones**: Inicio, Filosofía, Flujo de Trabajo, Patrones de Prompting,
  Ecosistema de Herramientas, Arquitectura Rápida, Mejores Prácticas, Anti-patrones,
  Prompts de Ejemplo y Glosario.
- **Navegación con deep-linking**: cada sección se mapea a un hash URL (`#filosofia`,
  `#prompts`…) para compartir enlaces directos y mantener el botón de retroceso del
  navegador.
- **Buscador en vivo**: resalta coincidencias en todo el manual con `<mark>` accesible,
  salta a la primera sección con resultado y muestra un estado de "sin resultados".
- **Copiado de prompts**: cada botón "Copiar prompt" envía el texto al portapapeles y
  muestra un toast de confirmación. Funciona con `navigator.clipboard` y con fallback
  `execCommand` para entornos no seguros (HTTP).
- **Tema claro/oscuro persistente**: se memoriza en `localStorage` y respeta la preferencia
  del sistema operativo (`prefers-color-scheme`).
- **Sidebar colapsable en móvil** con `overlay` desenfocado y soporte de `Esc`.
- **Diseño premium** con paleta HSL personalizada, glassmorphism en la topbar, degradados
  sutiles, sombras suaves, fuentes *Inter* y *Outfit* de Google Fonts y microinteracciones.
- **Accesibilidad**: zonas semánticas, foco visible, `aria-label`/`aria-current` y
  atajos de teclado (`/` para buscar, `Alt+T` para alternar tema).

## 🗂 Estructura

```
vibe-coding-manual-html5/
├── index.html      # SPA principal con las 10 secciones
├── css/
│   └── style.css   # Sistema de diseño HSL, temas y componentes
├── js/
│   └── app.js      # Ruteo SPA, buscador, copiado de prompts, tema persistente
├── README.md       # Este documento
└── plan.md         # Bitácora y plan de desarrollo
```

## 🚀 Cómo ejecutar

Al ser un sitio estático, cualquier servidor HTTP funciona. Opciones recomendadas:

### Python (sin dependencias)
```bash
cd vibe-coding-manual-html5
python -m http.server 8000
# Abrir http://localhost:8000
```

### Node con `serve`
```bash
cd vibe-coding-manual-html5
npx serve -l 8000
```

### Live Server (VS Code)
Abre la carpeta en VS Code y ejecuta la extensión *Live Server* sobre `index.html`.

> **Nota:** también puedes abrir `index.html` directamente con doble clic, pero el
> buscador y el copiado de prompts funcionan mejor bajo un origen con `http://`.

## ⌨️ Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `/` | Enfocar el buscador |
| `Esc` | Limpiar búsqueda / cerrar sidebar móvil |
| `Alt` + `T` | Alternar tema claro/oscuro |

## 🧩 Contenido cubierto

1. **Inicio** — Qué es Vibe Coding y sus 4 principios fundamentales.
2. **Filosofía** — El cambio de mentalidad hacia "director técnico".
3. **Flujo de Trabajo** — El ciclo **VIBE** (Visionar → Iterar → Build → Evaluar) y
   prompting declarativo con ejemplos comparativos.
4. **Patrones de Prompting** — Chain of Thought, Few-shot, ReAct, Persona y
   Refactorización Asistida, cada uno con un prompt copiable.
5. **Ecosistema** — Herramientas de agentes, orquestación/contexto e infraestructura
   para prototipos.
6. **Arquitectura Rápida** — Stack mínimo viable, modularidad asistida y checklist para
   pasar de prototipo a producción.
7. **Mejores Prácticas** — Comunicación con agentes, control de versiones, seguridad y
   métricas de sesión.
8. **Anti-patrones** — *Prompt Vague*, *Aceptación Ciega*, *Contexto Zombie*,
   *Feature Creep Asistido* y *Deuda Técnica Invisible*, con correcciones.
9. **Prompts de Ejemplo** — Plantillas listas para copiar: inicialización, feature
   nueva, debugging, refactorización y documentación.
10. **Glosario** — Definiciones de Vibe Coding, agente de IA, CoT, Few-shot, ReAct, MCP,
    Repomix, Prompt Declarativo, etc.

## 🔐 Privacidad

El manual es 100% client-side: no realiza envíos a servidores externos. El tema elegido
se guarda en `localStorage`; el buscador y el copiado de prompts operan sin red.

## 📄 Licencia

Proyecto bajo licencia MIT. Documentación mantenida por IGD con asistencia de IA.

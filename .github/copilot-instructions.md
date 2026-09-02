# Instrucciones para GitHub Copilot — Proyecto Lexy

Este proyecto usa el sistema de diseño Lexy en modelo **registry**: los componentes
viven acá dentro, se traen con `npx create-lexy add` y se editan con libertad. Ya
existe un sistema; no improvises uno propio.

## Empieza por AGENTS.md

**Abre [AGENTS.md](../AGENTS.md) antes de generar o modificar interfaces.** Es el
documento canónico: quién es Lexy, la distinción cliente/CRM, el modelo de
componentes, el prototipo funcional, qué abrir según la tarea y los principios que
no se rompen.

Este archivo no repite ese contenido a propósito. Una regla que vive en dos lugares
termina desactualizada en uno de los dos, y nadie se entera hasta que hace daño.

## Cómo se enruta el trabajo

Copilot no carga skills automáticamente, así que ábrelas tú: en `.claude/skills/`
hay una carpeta por skill y cada `SKILL.md` declara al comienzo cuándo aplica y
cómo trabajar. Léelas y sigue la que corresponda a la intención de la persona.

La frontera: **diseño decide _qué_ construir; lo técnico lo _ejecuta_.** Ante
intención ambigua, pregunta antes de actuar.

## Lo mínimo que evita daño

- **Un proyecto que se ve vacío no significa que no haya sistema de diseño.** El
  catálogo completo está a un `npx create-lexy add` de distancia. Descubre con
  `view --list`, instala y compón antes de escribir HTML/CSS propio.
- **Determina siempre si la interfaz es para cliente o para equipo (CRM).** La
  filosofía cambia por completo. Si no está claro, pregunta.
- El import local sale de `componentImportPattern` en `ai/lexy-ai-manifest.json`;
  no inventes rutas.

Todo lo demás —accesibilidad, jerarquía, UX writing, patrones de código— está
desarrollado en AGENTS.md y en las pautas que ese archivo indexa.

> El contexto de IA (`AGENTS.md`, `ai/`, `CLAUDE.md`, `.claude/`,
> `.github/copilot-instructions.md`) es removible antes de producción, igual que la
> capa de prototipo. Ver [ai/PRODUCTION-CLEANUP.md](../ai/PRODUCTION-CLEANUP.md).

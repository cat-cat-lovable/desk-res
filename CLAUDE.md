# CLAUDE.md — Proyecto Lexy

Proyecto del sistema de diseño Lexy en modelo **registry**: los componentes viven
acá dentro, se traen con el CLI `create-lexy` y se editan con libertad.

## Lee AGENTS.md

**Todo el contexto está en [AGENTS.md](AGENTS.md)** — quién es Lexy, la distinción
cliente/CRM, el modelo de componentes, el prototipo funcional, el ruteo de skills,
qué abrir según la tarea y los principios que no se rompen.

Este archivo no repite nada de eso a propósito: cuando la misma regla vive en dos
lugares, uno de los dos queda desactualizado y nadie se entera.

## Cómo se trabaja acá

El flujo lo definen las **skills de `.claude/skills/`**, que se cargan solas. Cada
una declara en su descripción cuándo aplica; si tu herramienta no las carga,
ábrelas y síguelas como guía de proceso.

La frontera entre ellas: **diseño decide _qué_ construir; lo técnico lo _ejecuta_.**
Ante intención ambigua, pregunta antes de actuar.

## Antes de la primera tarea

Lee [ai/PROJECT-CONTEXT.md](ai/PROJECT-CONTEXT.md) —el brief vivo del proyecto— y
`.lexy`, que tiene la arquitectura y las rutas reales. Mantén el brief al día:
cuando el diseñador tome una decisión de alcance, audiencia o referencia,
regístrala ahí en una línea.

> El contexto de IA (`AGENTS.md`, `CLAUDE.md`, `ai/`, `.claude/`,
> `.github/copilot-instructions.md`) es removible antes de producción, igual que la
> capa de prototipo. Ver [ai/PRODUCTION-CLEANUP.md](ai/PRODUCTION-CLEANUP.md).

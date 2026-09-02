---
name: lexy-mock-data
description: |
  Generación y mantenimiento de data mock para prototipos Lexy con fixtures, mock-store persistente y ports de lectura/escritura. Usar cuando la persona pida llenar pantallas con datos realistas, agregar casos de prueba, recorrer el estado vacío, usar ejemplos chilenos o hacer visible el efecto de un evento publicado.
---

# lexy-mock-data — Data mock y runtime persistente

Tu trabajo es mantener datos sintéticos útiles para diseñar y probar una
experiencia Lexy. La IA actúa en autoría: genera y modifica archivos explícitos
del repo. El navegador no llama a un LLM.

## Cómo hablar (regla principal)

Todo lo que hace esta skill —contrato, fixtures, ports, mock-store, metadata—
es maquinaria. **La persona que diseña no tiene por qué verla.** Hablá del
contenido y del comportamiento, no de los archivos:

- "Llené la bandeja con 8 casos, uno con el plazo vencido", no "agregué
  fixtures a la entidad caso".
- "Al cerrar el caso queda cerrado y la lista se actualiza sola", no "el
  publish declara writes y el adapter fusiona por id".
- "Le agregué el nombre del cliente, que la pantalla necesitaba", no "declaré
  cliente.nombre en el contrato".

Hacé el trabajo completo igual: el contrato se actualiza, la metadata se
declara, `check:prototype` queda en verde. Lo que cambia es qué se cuenta.

**Andá tan profundo como la persona quiera.** Si pregunta cómo funciona o pide
ver el contrato, mostrale todo sin simplificar. Ocultarlo no es el objetivo; no
imponerlo, sí.

**Y cuando expongas, enseñá.** Empezá por lo que vio pasar en su pantalla y
recién después explicá el mecanismo; el nombre técnico va al final, como
etiqueta, no al principio como requisito. Usá el caso que están construyendo, no
un ejemplo abstracto. Cerrá ofreciendo mostrar más, no mandando a revisar algo.
Desarrollo en AGENTS.md, «Cuando expliques, enseña».

**Sacá el tema solo cuando su respuesta cambie el trabajo:** un dato que nadie
sabe de dónde sale, un supuesto que alguien tendrá que confirmar, o una decisión
de producto disfrazada de detalle técnico. En lenguaje de producto, no de
esquema.

## Orden obligatorio

1. Lee `ai/PROJECT-CONTEXT.md`.
2. Lee `.lexy` y `ai/lexy-ai-manifest.json`.
3. Lee el contrato de datos (`prototype.dataContractPath`).
4. Lee los ports (`prototype.portsPath`) y sus adapters mock.
5. Lee los fixtures (`prototype.fixturesPath`).
6. Lee el mock-store (`prototype.mockStorePath`).
7. Modifica solo lo necesario.
8. Ejecuta `pnpm check:prototype`.
9. Ejecuta `pnpm build` si cambiaste ports o su integración.

## Reglas

- No uses datos reales, dumps, screenshots productivos ni payloads de clientes.
- No inventes campos: si la UI necesita un dato nuevo, primero declaralo en el
  contrato de datos.
- Las lecturas remotas usan `read.load`. Las escrituras usan `write.publish`.
- Las interacciones locales no pasan por los ports.
- Los fixtures deben ser pocos, explícitos, deterministas y revisables en PR.
- No uses `Math.random()`, `Date.now()`, `new Date()` al declarar fixtures ni llamadas HTTP.
- Usa contexto chileno por defecto: `es-CL`, RUT con `K` mayúscula, teléfonos `+56`,
  fechas ISO en storage, CLP como entero y correos `example.com`.
- Incrementa `datasetVersion` cuando cambie el dataset persistible.
- Declara `reads` y `writes` en el call site para que el adapter mock y el panel
  entiendan qué participa: **entidades y campos** en ambos lados. Los campos van
  como `entidad.campo` en camelCase, el mismo deletreo del
  contrato (`reads: { entities: ["caso"], fields: ["caso.estado"] }`).
- Declara solo los campos que la pantalla usa de verdad: esa lista es lo que
  Desarrollo tendrá que conectar, no un inventario de la entidad completa.
- El adapter mock decide crear o actualizar por el `id` del payload: si trae el
  de un registro existente lo **actualiza** fusionando solo los campos que
  vienen; si no, **crea** uno nuevo. El receipt lo refleja (`200` vs `201`).
  Un evento de actualización carga el `id` y los campos que cambian, no la
  entidad entera.
- El **borrado no está cubierto** por el adapter genérico: necesita una
  convención propia. Si un flujo lo requiere, resuélvelo dentro de la capa de
  adapter, nunca dentro del componente.
- El adapter mock **no falla nunca**. El estado vacío sí se recorre de verdad
  (parámetros que no coincidan devuelven una lista vacía por el camino real),
  pero el error, los permisos y la latencia dependen de una respuesta externa
  que el prototipo no tiene. Si la persona pide "ver qué pasa si falla":
  diseñen juntos la pantalla de error como vista, y di con franqueza que
  ejercitarla es parte de la integración.
- El adapter de producción conserva la misma interfaz y reemplaza el acceso al
  mock-store por GET/publicación al backend.

## Qué entregar

Un resumen corto, **en lenguaje de producto**:

- qué contenido quedó disponible y qué situaciones cubre ("hay 8 casos, uno
  vencido y uno sin abogado asignado");
- qué se puede recorrer ahora que antes no ("ya se ve qué pasa al cerrar un
  caso", "la bandeja vacía se puede revisar");
- qué quedó como supuesto que alguien tendrá que confirmar.

Los detalles técnicos —qué archivos tocaste, qué comandos corriste— van solo si
la persona los pide, o si algo quedó en rojo y necesita saberlo.

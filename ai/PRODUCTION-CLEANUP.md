# Desmontar lo que no va a producción

Un proyecto Lexy nace con dos capas que sirven para diseñar y no para operar: la **capa de
prototipo** (datos mock, ports y panel del Designer) y la **capa de IA** (pautas, skills y
contexto para agentes). Ambas son removibles y ninguna es necesaria para ejecutar la aplicación.

> **Antes de empezar:** desmontar no es lo mismo que desplegar. Un prototipo desplegado —un
> build en Vercel para que el equipo lo recorra— **sigue siendo un prototipo**: conserva sus
> datos mock y su panel, y funciona. Este documento es para cuando Desarrollo toma el proyecto
> y lo convierte en producto.

---

## 1. Apagar el prototipo sin borrarlo (reversible)

Primer paso al conectar el backend. Una sola bandera:

```bash
VITE_LEXY_PROTOTYPE=false pnpm build
```

Qué cambia:

- `read` / `write` pasan de los adapters mock a `src/prototype/ports/production.ts`.
- El panel del Designer deja de montarse.

Los stubs de producción **lanzan error a propósito** hasta que se implementen:

```
[lexy] productionRead.load("casosDelAbogado") sin implementar: conéctalo al GET de tu API.
```

Ese error es la lista de trabajo: cada `loadId` y cada `eventId` que aparezca es una consulta o
una escritura que hay que conectar. El contrato de datos
(`src/prototype/data-contract/prototype-data-contract.ts`) dice de qué entidades y campos habla
cada uno, y con qué referencia real del backend (`source.reference`, en snake_case).

Mientras esta bandera exista, volver atrás es quitarla: útil para alternar entre prototipo y
integración durante el desarrollo.

**La bandera cambia el comportamiento, no vacía el bundle.** El panel sí desaparece del build,
pero el mock-store y sus fixtures siguen empaquetados: `mock-store.ts` crea su instancia al
importarse, así que el bundler no puede descartarlo aunque nadie lo use. Son unos pocos KB de
datos sintéticos, inofensivos pero inútiles en producción. Sacarlos de verdad es el paso 2.

---

## 2. Desmontar la capa de prototipo (definitivo)

Cuando todas las cargas y eventos estén conectados y ya no haya nada que prototipar.

**Antes de borrar**, mueve la implementación real fuera de `src/prototype/`: lo que hoy vive en
`ports/production.ts` pertenece a la capa de servicios del proyecto (`src/services/` o
`src/shared/services/`, según la arquitectura declarada en `.lexy`).

```bash
# 1. Encuentra qué pantallas consumen los ports
rg "from .*prototype/ports" src/

# 2. Cambia esos imports a tu capa de servicios real.

# 3. Recién entonces, borra la capa completa
rm -rf src/prototype

# 4. Quita los scripts que la validaban
#    en package.json: check:data-contract, check:prototype
#    y la referencia a check:prototype dentro del script `build`

# 5. Quita el paso del contrato en la CI
#    .github/workflows/ci.yml → línea `pnpm check:data-contract`

# 6. Verifica que no quede nada colgando
rg "prototype/|mock-store|designer-panel|fixtures|PrototypeDesignerPanel|VITE_LEXY_PROTOTYPE" src/ package.json .github/
```

Se van con la carpeta: el contrato de datos, el mock-store y sus fixtures, los ports (mock y
producción), el panel del Designer y su store de actividad.

**Vale la pena conservar el contrato de datos** aunque se borre el resto: es la única
descripción escrita de qué datos sostienen la experiencia, de dónde salen y qué quedó pendiente
de validar con TI. Muévelo a documentación en vez de borrarlo.

`.lexy` mantiene el bloque `prototype` con las rutas; puedes vaciarlo o dejarlo como registro de
lo que hubo.

---

## 3. Retirar la capa de IA

Contexto de trabajo para agentes y documentación interna. Independiente de lo anterior: se puede
retirar antes, después o nunca.

```bash
rm -rf AGENTS.md CLAUDE.md .claude .github/copilot-instructions.md ai
```

Luego revisa que no queden referencias:

```bash
rg "AGENTS.md|CLAUDE.md|.claude/|copilot-instructions|ai/|lexy-ai-manifest|IMPLEMENTATION-PROTOCOL|TECHNICAL-USAGE|PRODUCTION-CLEANUP|PROJECT-CONTEXT|lexy-dev|lexy-design|lexy-mock-data|diseno-cliente|diseno-crm-lexy|sistema-visual|recetas-layout|patrones-de-codigo|buenas-practicas|arquitectura-informacion-ux|ux-writing|calidad-industria"
```

Si el proyecto usa esta documentación en CI, prompts o scripts internos, elimina primero esas
referencias y después borra la carpeta.

---

## Lo que NO se desmonta

Los componentes instalados en la ruta de `.lexy` (`components`) son código del proyecto, no del
sistema: se quedan. Lo mismo el theme (`src/lexy-theme.css`), las fuentes de `public/fonts/` y el
helper `cn`. Esa es la idea del modelo registry — lo que se instaló es tuyo.

Después de desmontar, `pnpm build` y `pnpm lint` deben seguir en verde.

# Sistema visual Lexy — valores y densidad

Esta pauta da los **valores concretos** (espaciado, densidad, tipografía, color de
estado, motion) que el tema no documenta solo. Es complemento técnico de
[diseno-cliente.md](diseno-cliente.md) y [diseno-crm-lexy.md](diseno-crm-lexy.md): la filosofía dice *por qué*; esto dice
*con qué números*. Para reglas de oficio y composición usa [buenas-practicas.md](buenas-practicas.md).

El tema sigue la convención **shadcn/Tailwind**: usa los tokens semánticos
(`bg-primary`, `text-muted-foreground`, `border-border`) y deja que el CSS resuelva
los colores. Lo que sigue cubre lo que **no** es estándar y las decisiones de
densidad inspiradas en Fluent, Material y Apple HIG, aterrizadas a Geist Sans y al tema Lexy.

---

## 1. Tokens no estándar (no inventes equivalentes crudos)

shadcn base solo trae `primary`, `secondary`, `destructive`, `muted`, `accent`. El
tema Lexy agrega tokens de estado. **Úsalos siempre; no uses colores crudos de
Tailwind como `bg-green-500` o `text-red-600` para estado.**

| Estado | Token | Texto/icono | Fondo sutil | Borde sutil |
|---|---|---|---|---|
| Éxito | `success` | `text-success-strong` | `bg-success/10` | `border-success/30` |
| Alerta | `warning` | `text-warning-strong` | `bg-warning/10` | `border-warning/30` |
| Error | `destructive` | `text-destructive` | `bg-destructive/10` | `border-destructive/20` |
| Información | `info` | `text-info` | `bg-info/10` | `border-info/20` |
| Marca | `primary` | `text-primary` | `bg-primary/10` | `border-primary/20` |

Reglas:

- **Patrón de superficie de estado:** para texto sobre fondo claro usa el paso
  `-strong` de éxito/alerta; acompáñalo de fondo a `/10` y borde a `/30`.
  `Tag` aplica este patrón. Los dots y rellenos usan el token base vívido.
- `accent` (`bg-accent` / `text-accent-foreground`) es el tinte sutil del primary;
  úsalo para selección, hover de items y estados activos discretos, no para CTA.
- El color **nunca** es el único signo de estado: acompáñalo con texto o icono
  (ver [buenas-practicas.md](buenas-practicas.md)).

## 2. Familia y pesos tipográficos (Geist)

**Geist es la familia tipográfica del producto.** Geist Sans cubre toda la interfaz
y Geist Mono queda reservada para código, tokens e identificadores técnicos. Ambas
son variables y autoalojadas. No agregues otra familia para crear jerarquía: cambia
de rol tipográfico, tamaño o peso dentro de Geist.

El tema usa sus pesos funcionales (`medium: 500`, `semibold: 600`, `bold: 700`).
**Usa las clases de utilidad, no valores numéricos:**

- `font-normal` (400) — cuerpo, captions.
- `font-medium` (500) — labels, items de navegación, énfasis suave.
- `font-semibold` (600) — títulos de sección, headers de tabla, botones.
- `font-bold` (700) — display editorial y énfasis excepcional fuera de la jerarquía de producto.

Los títulos de producto no se construyen combinando peso y tamaño a mano: los roles
`type-*` ya asignan el peso correcto. `type-page-title`, por ejemplo, usa 600.

No uses pesos arbitrarios ni `font-extrabold`: rompen la rampa calibrada para Geist.

## 3. Rampa tipográfica (roles)

La API de producto usa clases de **rol**, no combinaciones manuales de `text-*`,
`leading-*`, `tracking-*` y `font-*`:

| Clase | px / line-height | Rol |
|---|---|---|
| `type-meta` | 12 / 16 | Caption, metadatos, ayuda |
| `type-supporting` | 14 / 20 | Ayuda y texto secundario |
| `type-action-label` | 14 / 20 | Botones, tabs y labels de acción |
| `type-data` | 14 / 20 | Montos, plazos, RUT y fechas (tabular) |
| `type-body` | 16 / 24 | Cuerpo por defecto y lectura |
| `type-item-title` / `type-section-title` | 16 / 24 | Ítem o encabezado de sección |
| `type-subsection-title` | 22 / 28 | Subtítulo de documento |
| `type-dialog-title` | 24 / 32 | Título de diálogo |
| `type-page-title` | 32 / 40 | Título de página |

- **CRM:** usa `type-body` y `type-supporting`; títulos de vista en
  `type-subsection-title` o `type-page-title` según la jerarquía. La expresividad
  display no pertenece a herramientas internas.
- **Cliente:** título de pantalla `type-page-title`, cuerpo `type-body`, ayuda
  `type-supporting`.
- Un solo `h1` por página. No saltes niveles de heading para conseguir un tamaño.

## 4. Espaciado — grid de 8 pt (contrato híbrido)

Base de 8 px (con medios pasos de 4 px), convención compartida por Fluent, Material
y Apple HIG. Usa la escala de Tailwind, que ya es múltiplo de 4:

- Micro (dentro de un control): `gap-1` (4) · `gap-2` (8).
- Entre elementos relacionados: `gap-3` (12) · `gap-4` (16).
- Entre grupos / secciones: `gap-6` (24) · `gap-8` (32).
- Separación de bloques mayores: `gap-12` (48) · `gap-16` (64).

Reglas del contrato (las mismas que cumplen los componentes de la librería):

- **Grilla de 4 px para todo espaciado entre elementos**: gaps, `space-*`,
  márgenes y paddings de superficie. Evita valores arbitrarios (`p-[13px]`,
  `mt-[7px]`); si necesitas algo intermedio, redondea al paso de 4 más cercano.
  La escala de Tailwind v4 es dinámica: `w-70` (280 px) o `max-h-75` (300 px)
  son válidos y preferibles a `w-[280px]`.
- **Medio-pasos de 2 px solo DENTRO de un control**: padding fino de items de
  menú (`py-1.5`), iconos pequeños (`size-3.5`) y offsets de alineación. Nunca
  para separar hermanos o secciones.
- **Nudge óptico de 2 px (`m*-0.5`)**: permitido solo como compensación
  deliberada de baseline u óptica (icono junto a texto, asterisco de label).
- **Caja compuesta simétrica**: en un componente o bloque con header/contenido/
  footer, el espacio sobre el primer slot debe igualar el espacio bajo el
  último, todos los slots comparten el mismo riel horizontal (`px`), y los gaps
  entre slots son uniformes o decrecen con jerarquía clara. Cumplir la grilla
  valor a valor no basta si la unidad queda asimétrica.

## 5. Densidad — cliente vs CRM (el ajuste que más cambia el resultado)

La misma jerarquía, dos densidades. No las mezcles.

### Cliente (aire = calma)

- Contenedor de contenido: `max-w-xl` (formularios) a `max-w-2xl` (lectura).
- Padding de sección: `p-6` a `p-8`. Padding de página: `px-4` móvil, `px-6`+ desktop.
- Separación entre campos de formulario: `gap-5` / `space-y-5`.
- Separación entre secciones: `gap-8` a `gap-12`.
- Altura de inputs: `h-10`. El botón usa 36 px por defecto y 40 px en `size="lg"`;
  en flujos de cliente prefiere `lg` cuando la acción principal necesita más presencia.
- Una idea principal por pantalla; deja respirar.

### CRM (densidad jerarquizada = velocidad)

- Contenedor: ancho completo del área de trabajo (`w-full`), sin `max-w` estrecho.
- Padding de superficie: `p-4` (paneles), `px-4 py-3` (toolbars).
- Separación entre campos: `gap-3` / `space-y-3`.
- Filas de tabla: `h-10` cómoda, `h-9` compacta; celdas `px-3 py-2`.
- Densidad alta solo si está jerarquizada (alineación, peso, agrupación). Densidad
  sin jerarquía es ruido, no eficiencia.
- Prefiere edición en línea y acciones por fila sobre navegar a otra pantalla.

## 6. Superficie, bordes y radios

- **Contención: espacio → superficie → línea.** Agrupa primero por proximidad. Si
  hace falta un límite explícito, usa `bg-surface-container rounded-lg` con aire
  interior. Reserva el hairline para separar ítems dentro de una misma superficie
  cuando el espacio no baste; no cortes cada sección del documento con una línea.
- **Elevación semántica.** La sombra solo aparece cuando algo realmente flota.
  Cards y paneles estáticos usan superficie, tono y borde, sin sombra por defecto.
  Usa `shadow-raised` para elevación cercana y `shadow-overlay` para dropdowns,
  popovers, toasts, Dialog y Sheet. No inventes escalones con `shadow-sm/md/lg`.
- **Radio por oficio.** La escala intermedia es 2–4px para detalles mini, 6px
  para interacción rectangular, 8px para flotantes compactas, 10px para cards,
  14px para overlays y 20px para media o paneles hero. Usa `rounded-control` (inputs), `rounded-button` (botones
  de cualquier variante o tamaño), `rounded-menu-item`, `rounded-nav-item`,
  `rounded-lg` (cards), `rounded-xl` (Dialog y Sheet) y `rounded-2xl` (media o
  paneles hero). `rounded-sm` queda para detalle mini.
- **Una geometría para todos los botones.** Primary, destructive, secondary,
  outline, ghost y los botones solo-icono comparten `rounded-button` (6px), también
  en tamaño `lg`. La jerarquía cambia color, borde y contenido, no la silueta.
  `rounded-full` queda para avatares, dots, toggles y conteos cuya forma circular
  expresa su función.
- **Jerarquía por superficie:** `background` (canvas) < `surface-container`
  (zona de agrupación) < `card` (contenido) < `popover` (flotante). No pongas card
  sobre card sobre card; aplana.

## 7. Iconografía (lucide-react)

- Tamaño por defecto en botones y junto a texto: `size-4` (16 px) — el registry ya
  lo aplica con `[&_svg]:size-4`. Iconos sueltos de acción: `size-4`/`size-5`.
- El icono **acompaña**, no es la única explicación: botón solo-icono requiere
  `aria-label`. Estado por icono requiere también texto.
- Estilo consistente: trazo lineal de lucide, no mezcles con emoji (Lexy no usa emoji).
- No decores cada sección con un icono. Un icono se gana su lugar si ayuda a
  reconocer o actuar más rápido.

## 8. Motion

Inspirado en Material/Apple: el movimiento orienta, no entretiene.

- **Duraciones por distancia:** `--duration-instant` (80 ms) para hover,
  `--duration-fast` (120 ms) para presión, `--duration-normal` (180 ms) para
  cambios de estado y `--duration-overlay` (220 ms) para capas.
- **Easing:** `--ease-enter` para entradas, `--ease-standard` para cambios y
  `--ease-exit` para salidas.
- Anima `opacity` y `transform`, no `width`/`height`/`top` (evita reflow y jank).
- **Respeta `prefers-reduced-motion`:** envuelve animaciones no esenciales y
  ofrece una versión sin desplazamiento. Nunca dependas del movimiento para
  comunicar (un cambio de estado debe leerse también detenido).
- En CRM el movimiento es mínimo: feedback inmediato sobre animación elaborada.

---

## Checklist visual antes de entregar

1. ¿Usaste tokens de estado (`success`/`warning`/`info`) y no colores crudos?
2. ¿El estado se comunica con texto o icono además del color?
3. ¿Pesos vía clases (`font-medium`/`font-semibold`), sin valores numéricos?
4. ¿Espaciado en múltiplos de 4/8, sin valores arbitrarios?
5. ¿Las cajas compuestas son simétricas (espacio tope = base, riel `px` único entre header/contenido/footer, gaps uniformes)?
6. ¿La densidad corresponde al mundo (aire en cliente, compacto en CRM)?
7. ¿Un solo `h1` y headings sin saltos por tamaño?
8. ¿La contención sigue espacio → superficie → línea y la sombra aparece solo si algo flota?
9. ¿Motion corto, sobre opacity/transform y con `prefers-reduced-motion`?

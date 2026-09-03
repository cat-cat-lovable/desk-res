# Contexto de este proyecto

> **Para agentes de IA:** lee este archivo al comenzar cada sesión de diseño y
> mantenlo al día. Es la memoria del proyecto: captura una sola vez lo que el
> diseñador ya decidió, para no volver a preguntarlo en cada sesión.
>
> - Si una sección dice _Por definir_, **pregunta** lo que necesites en la
>   primera tarea que lo requiera y **escribe aquí la respuesta**.
> - Cuando el diseñador tome una decisión de alcance, audiencia o referencia
>   («esto es para clientes», «usa este Figma», «sin login por ahora»),
>   **regístrala aquí** en una línea.
> - Mantén el archivo corto (una pantalla). Esto no es documentación: es el
>   brief vivo del proyecto.
>
> Lo técnico no va aquí: `architecture`, `world`, `addons` y rutas viven en
> `.lexy` (fuente de verdad técnica, no la dupliques).

## Qué estamos construyendo

Desk ReS: herramienta interna con la que el equipo de Lexy gestiona la
reevaluación de servicio de un cliente en curso (mantener servicio, derivar a
otro servicio interno, o dar de baja con/sin reembolso). Coordina capitán de
origen, capitán receptor, encargada de reembolso y cliente sobre un caso que
cambia de rumbo.

## Para quién es

100% equipo interno / CRM (abogados y capitanas del Desk ReS). El cliente es
un dato del caso (nombre, correo, teléfono) y recibe correos automáticos en
algunos eventos, pero no interactúa con la app. `world: crm` en `.lexy`
confirma que no hay parte cliente en este proyecto.

## Pantallas y flujos clave

- Login (mock, sin auth real): correo + contraseña no vacíos → entra.
- App principal (CRM): header sticky, sidebar flotante de filtros, tabs
  "En evaluación" / "Resueltos", lista de `CasoCard` expandibles.
- Flujo de negocio con 3 subflujos entrelazados (Derivación, Mal Vendido,
  Baja) que se cruzan entre sí — ver detalle completo en
  `readme-logica-res.md` (documento de lógica de negocio, en la raíz del
  proyecto, transferido desde el repo origen).

## Datos principales

- `Caso`: identidad, cliente, abogados/capitanes, servicio, motivo,
  cobro anterior/acreedor (precargado desde caja post-venta), reembolso,
  derivación (acta de 16 campos), gestión y cierre.
- Catálogos: motivos de reevaluación/baja, resultados, servicios, etapas por
  servicio, capitanes.
- Detalle completo del modelo, enumerados, plazos y eventos: ver
  `readme-logica-res.md` §4–§7 — es la fuente de verdad de la lógica de
  negocio para este build, se usa en vez de duplicarla acá.
- Supuestos pendientes de validar con TI: auth real, scrapeo de caja
  post-venta, API de Apio para nuevo cobro, correos/Slack automáticos,
  persistencia (ver `readme-logica-res.md` §10).

## Referencias

- `readme-logica-res.md` (raíz del proyecto) — documento de lógica de negocio
  completo del Desk ReS, transferido desde el repo origen
  `github.com/cat-cat-lovable/reevaluacioncasos`. Manda sobre composiciones
  genéricas para este build: modelo de datos, subflujos, eventos, reglas de
  transición y estructura de interfaz (sin estilos).

## Decisiones y restricciones

- Proyecto generado con `create-lexy`, `world: crm`.
- 2026-08-20: se arranca el build completo del Desk ReS a partir de
  `readme-logica-res.md`, combinando su lógica de negocio con el Lexy Design
  System (registry `@lexydesign/registry`).
- No instalar `react-router-dom`, `BrowserRouter`, ni crear `src/App.tsx` /
  `src/pages` — router fijo es TanStack Router (regla del proyecto, ver
  `CLAUDE.md` §11).
- No reintroducir "Encargada de depósito" en la lista de capitanes.
- Campo editable del operador se llama "Detalle ReS", distinto de la
  "Descripción desde caja ventas" (precargada, inmutable).
- Estado inicial de caso no incluye "Registrado" (se quitó para reducir
  ruido).
- 2026-08-20: build completo del Desk ReS construido y verificado en vista
  previa (sin errores de consola, sin errores de tipos ni de lint): contrato
  de datos + fixtures (10 casos), Login mock, shell de App, `CasoCard`
  completo, y los 8 diálogos de gestión (AgregarCaso, IniciarEvaluacion,
  DecisionCierre, RecepcionDerivacion, NuevoCobro, ConfirmarReembolsoBaja,
  EditarCaso, EliminarCaso) conectados a `write.publish`/mock-store con
  recarga automática de la lista tras cada gestión.
- Simplificación de alcance conocida: el acta de derivación de 16 campos
  (`ActaDerivacion`) se muestra en `CasoCard` cuando existe en los datos,
  pero ningún diálogo de este build la captura todavía — el readme original
  la menciona como parte del flujo pero no aparece en el listado de 8
  diálogos ni en sus campos documentados. Si el equipo la necesita como
  paso editable, es la siguiente pieza a diseñar (probablemente dentro de
  `RecepcionDerivacionDialog` o como paso propio).
- "Eliminar caso" usa el mock-store directo (no `write.publish`) porque el
  contrato de ports hoy solo soporta crear/fundir por id, no borrar; un
  backend real necesitaría su propio endpoint de borrado.
- 2026-08-24: se vaciaron los 10 casos de ejemplo de `fixtures.ts` por pedido
  del diseñador — las pestañas "En evaluación" y "Resueltos" arrancan vacías
  para recorrer ese estado. Los casos de referencia siguen documentados en
  `readme-logica-res.md` §9 si hace falta repoblar.
- Botones accionables (`Button` variant `default`): reposo movido al tono que
  antes era el estado "presionado" (`--color-cta` = `#313396`), a pedido del
  diseñador. Solo afecta al componente `Button`; el resto de usos de la marca
  (links, tags, selección) sigue en el índigo original `--color-primary`.
- 2026-08-25: `CasoCard` — el contenido desplegado (todo lo que aparece al
  expandir un caso: campos, subsecciones, gestiones) va dentro de un panel con
  fondo `secondary` suave (`bg-secondary`), separado del encabezado por el
  hairline existente. Los recuadros internos (Información post-venta, Cobro
  anterior, Resolución de cierre) no se tocaron todavía — el diseñador pidió
  el fondo a nivel de todo el desplegable primero, no recuadro por recuadro;
  eso queda pendiente de una próxima pasada si hace falta.
- 2026-08-25: `AccordionTrigger` (componente base) suma el prop `iconPosition`
  (`"end"` default, `"start"` para chevron pegado al título a la izquierda) —
  ajuste local del registry, no rompe los otros usos existentes. Se usa en el
  desplegable "Información post-venta" de `CasoCard` a pedido del diseñador.
- 2026-08-25: `CasoCard` — "Abogado vendedor" (`caso.abogadoVendedor`, ya
  declarado visible en el contrato) ahora se muestra en la grilla superior
  siempre visible, junto a Servicio / Abogado a cargo / Servicio destino;
  antes solo aparecía escondido dentro del Acta de derivación.
- 2026-08-25: `CasoCard` — se quitó la sección "Datos de reembolso" de la
  tarjeta (había estado ahí solo un rato, movida arriba del desplegable de
  Información post-venta, y el diseñador decidió sacarla del todo). Esos
  datos (monto, cuotas, cuenta bancaria) ya se capturan y muestran en
  `DecisionCierreDialog`; la tarjeta ya no los duplica.
- 2026-08-25: `CasoCard` — el botón de "editar" (lápiz) del pie se reemplazó
  por "eliminar" (basurero), que ahora es siempre visible (antes solo
  aparecía cuando no había acción principal). El botón de acción principal
  ("Resolver", etc.) ya no tiene un fallback duplicado de basurero. Decisión
  explícita del diseñador, confirmada: la tarjeta pierde la entrada a editar
  un caso. Como consecuencia, `EditarCasoDialog` quedó sin ningún punto de
  entrada en la app — se sacó su cableado de `DeskResDesk.tsx` (import,
  handler, tipo de diálogo y el `<EditarCasoDialog>` en el árbol), pero el
  archivo del diálogo (`src/features/dialogs/EditarCasoDialog.tsx`) no se
  borró, por si se quiere reactivar editar desde otro lugar más adelante.
  El pie de la tarjeta también se afinó: separador más suave
  (`bg-border-subtle` en vez de `bg-border`) y botones más chicos/compactos
  (`--control-height-sm` en el ícono de eliminar), a pedido del diseñador.
- 2026-08-25: `DeskResDesk` — el fondo general de la pantalla (el contenedor
  raíz) pasó de `bg-background` (blanco plano, igual al de las tarjetas) a
  `bg-sidebar-hover` (lavado sutil de marca, `color-mix` con `--color-primary`
  al 5%). Las tarjetas siguen en blanco (`bg-background` de `Card`), así que
  ahora flotan con contraste sobre el lienzo en vez de fundirse con él. Token
  distinto del `bg-secondary` que ya usa el panel interno de cada tarjeta —
  tres planos de profundidad: lienzo (sidebar-hover) < tarjeta (blanco) <
  panel desplegado (secondary).
- 2026-08-25: Botones accionables (`Button` variant `default`, tokens
  `--color-cta` / `-hover` / `-active`) pasan del índigo (`#313396`) al navy
  de marca (`--color-brand-navy`, `#0b013c`), a pedido del diseñador. Hover y
  active se generan con `color-mix` sobre negro (85%/65%) para mantener el
  mismo matiz y solo oscurecer al presionar (DEC-009). Cambio en
  `src/lexy-theme.css`; no toca `Button.tsx` ni otros usos del índigo
  (`--color-primary` sigue igual en links, tags, selección).
- 2026-08-25: `Tabs` (componente base) — la pestaña activa pasa de
  `bg-primary-active` (índigo) a `bg-cta` (navy), para que coincida con los
  botones accionables. Solo se tocó `Tabs.tsx`; `--color-primary-active` no
  se redefinió porque no se usa en ningún otro lugar del proyecto.
- 2026-08-25: `CasoCard` — "Plazo {fecha}" en el encabezado pasa de texto
  plano a píldora (`Tag tone="gray" shape="rounded" size="sm"`), a pedido del
  diseñador. Se sacó el separador "·" con "Receptor {capitán}" (ya no hace
  falta, la píldora separa visualmente); "Receptor" se queda como texto
  plano al lado.
- 2026-08-25: `DecisionCierreDialog` — el paso "¿Procede el reembolso?" (y en
  general el radio de `resultado`, compartido entre reembolso/reevaluación/
  acreedor) pasa de lista simple (radio + texto) a tarjetas seleccionables:
  cada opción es una caja con borde, título en negrita y una frase de
  consecuencia debajo en el tono correspondiente (verde éxito / rojo baja /
  gris neutro), a pedido del diseñador con referencia visual. La opción
  seleccionada resalta el borde. Las descripciones son fijas por
  `tipoCaso` + valor de `resultado` (función `resultadoInfo`), porque "No
  procede" significa algo distinto en reembolso que en acreedor. Los otros
  radios simples del diálogo (¿cliente acepta?, ¿corresponde reembolso?) no
  se tocaron — la referencia solo pedía este paso.
- 2026-08-25: `CasoCard` — "Información post-venta" se separó del acordeón
  compartido con "Detalle de la derivación"/"Acta de derivación" y pasó a ser
  su propio acordeón, ahora primero en el contenido desplegado de la
  tarjeta (antes de la grilla Servicio/Abogado/Servicio destino). Sigue
  siendo desplegable (chevron a la izquierda, sin cambios). "Detalle de la
  derivación" y "Acta de derivación" se quedaron juntas en su propio
  acordeón, en el lugar donde antes estaba el grupo combinado (después de la
  grilla).
- 2026-08-25: `ConfirmarReembolsoBajaDialog` ("Confirmar depósito") — rediseño
  a pedido del diseñador. Ahora arriba de todo se ve "Datos para transferir"
  (titular, banco, tipo y número de cuenta, monto a transferir y cuotas —
  datos ya capturados antes en el flujo, de solo lectura), seguido del resumen
  de cobro anterior. El campo de comprobante dejó de ser un texto de
  referencia y pasa a ser un adjunto real (mismo patrón visual que "Agregar
  caso": botón con recuadro punteado, lista de archivos con opción de
  quitar), obligatorio para poder confirmar. Al confirmar, el o los archivos
  se agregan a `caso.documentos` (se fusionan con los que ya tenía el caso,
  no los reemplazan) y quedan visibles después en "Documentos adjuntos" de la
  tarjeta.
  Se extrajo `archivoADocumento` (antes duplicado en `AgregarCasoDialog`) a
  `src/shared/lib/utils/documentos.ts`, compartido entre ambos diálogos.
  Contrato de datos actualizado (`usedIn` de la entidad `documento` y sus
  campos) y validado con `pnpm check:data-contract`.
- 2026-08-25: Todos los diálogos de gestión (Agregar caso, Iniciar
  evaluación, Decisión de cierre, Recepción de derivación, Nuevo cobro,
  Confirmar depósito) abren con sus campos ya rellenados con datos de
  prueba realistas, a pedido del diseñador, para poder recorrer el flujo
  completo sin tipear cada campo a mano. Las decisiones que definen la rama
  del flujo (qué `resultado`, aceptar/rechazar, etc.) se dejaron sin
  preseleccionar a propósito — siguen siendo un clic consciente, es lo que se
  está probando — pero todo lo demás (justificaciones, motivos, datos de
  cuenta bancaria, montos, cuotas, notas, comprobante) ya viene cargado, así
  que apenas se elige la rama el diálogo queda listo para confirmar.
  Valores compartidos en `src/shared/lib/utils/datosPrueba.ts` (cuenta
  bancaria de prueba, monto/cuotas de prueba, generador de comprobante de
  prueba); `ConfirmarReembolsoBajaDialog` ya abre con un comprobante
  adjunto de prueba (se puede quitar y reemplazar por uno real). Estos
  valores son solo defaults editables de formulario — no tocan fixtures ni
  el mock-store por sí solos.
- 2026-08-25: `ConfirmarReembolsoBajaDialog` — "Datos para transferir" pasó
  de sección fija a desplegable (mismo patrón de acordeón que "Información
  post-venta": chevron a la izquierda), a pedido del diseñador. Abre
  expandido por defecto (`defaultValue`) porque es la información principal
  para hacer el depósito, pero se puede plegar.
- 2026-08-26: `accionPrincipal` (`caso-helpers.ts`) — modificación de
  contrato ya no pasa por "Iniciar evaluación": el botón principal de la
  tarjeta va directo a "Resolver" en estado "por evaluar", igual que
  reembolso. Decisión explícita del diseñador.
- 2026-08-26: Modificación de contrato ya no pregunta "¿procede o no
  procede?" en `DecisionCierreDialog` — se asume que siempre procede.
  "Resolver" en la tarjeta abre directo `NuevoCobroDialog` (kind
  `"nuevo-cobro"` en `accionPrincipal`). Se sacaron de `DecisionCierreDialog`
  las ramas de opciones/descripción/guardado específicas de modificación de
  contrato (ya no son alcanzables); `NuevoCobroDialog` ahora graba
  `requiereNuevoCobro: true` en cada guardado para que el botón siga
  ofreciendo "Definir nuevo cobro" mientras el nuevo cobro queda a medio
  definir. Decisión explícita del diseñador.
- 2026-08-26: Nuevo diálogo `GenerarNuevoCobroDialog`, específico para
  modificación de contrato con motivo "Agregar nuevo acreedor" (kind
  `"generar-nuevo-cobro"` en `accionPrincipal`, reemplaza a `NuevoCobroDialog`
  solo para este motivo). Confirma nombre del acreedor, monto nuevo contrato
  y valor cuota (editables, precargados desde `caso.acreedor`) y el botón
  "Generar nuevo cobro" deja `nuevoCobro.estado = "esperando-cliente"` de
  una vez, sin el selector manual de estados de `NuevoCobroDialog`. El caso
  queda en "En evaluación" sin acción principal en la tarjeta — el paso a
  "Resuelto" ocurre en Apio cuando el cliente acepta el cobro, no hay
  simulación de esa aceptación dentro de la app. El motivo "Por derivación de
  servicio" no tiene esta excepción y sigue usando `NuevoCobroDialog`.
  Decisión explícita del diseñador.
- 2026-08-26: `CasoCard` — se probó y se descartó una píldora de estado en el
  pie de la tarjeta (para que se supiera en qué paso del flujo estaba el
  caso sin abrir el desplegable). El diseñador la sacó: esa información ya
  está en el contenido desplegado de la tarjeta y no debe repetirse. No
  reintroducir esta idea sin resolver antes esa duplicación.
- 2026-08-26: `CasoCard` — dentro del desplegable, el campo "Estado" de la
  sección "Nuevo cobro" (`caso.nuevoCobro.estado`) pasó de texto plano (el
  valor técnico del enum, ej. "esperando-cliente") a una Tag con etiqueta
  legible y tono semántico (`ESTADO_NUEVO_COBRO_INFO` en `caso-helpers.ts`:
  gris para pendiente/no aplica, marca para definido/confirmado, ámbar para
  esperando cliente, éxito para aceptado por el cliente). A pedido del
  diseñador de que la información de estado en la tarjeta sea más atractiva
  de ver, sin repetir la que ya estaba (ver punto anterior). Queda pendiente
  si el diseñador quiere extender este mismo tratamiento a otros campos de
  la tarjeta.
- 2026-08-26: Primer subflujo construido de "Reevaluación de servicio":
  **revisión de mal vendido**, para reevaluación con motivo "Posible mal
  vendido". Diálogo dedicado (`RevisionMalVendidoDialog`, kind
  `"revisar-mal-vendido"` en `accionPrincipal`) — no pasa por
  `DecisionCierreDialog` ni sus 3 opciones genéricas. La capitana de ventas
  responde "¿Corresponde mal vendido?" (sí/no, cada una con justificación
  obligatoria) y, si sí corresponde, además elige un **camino sugerido** de
  solo lectura (`CAMINOS_MAL_VENDIDO`: Mantener sin cambios / Modificar
  estrategia en origen / Derivar a otro servicio / Dar de baja) para orientar
  al capitán que ingresó el caso — no ejecuta ni pre-selecciona nada, es una
  nota. También tiene documentos adjuntos (opcional, mismo patrón que
  `AgregarCasoDialog`). **Tanto "sí" como "no" corresponde cierran el caso
  ahí mismo** (`estadoProceso = "resuelto"`) — no hay paso posterior dentro
  de la app; el capitán ve la justificación y el camino sugerido en la
  tarjeta resuelta ("Resolución de cierre" en `CasoCard`) y actúa por fuera
  de este flujo. (Iteración del mismo día: la primera versión embebía esto
  como paso previo dentro de `DecisionCierreDialog` y volvía al flujo normal
  en vez de cerrar — el diseñador pidió corregirlo a diálogo propio +
  cierre directo.) 3 campos nuevos en `Caso` (`malVendidoCorresponde`,
  `malVendidoJustificacion`, `malVendidoCaminoSugerido`), declarados en el
  contrato de datos como `generatedByUsability` + `pendingTi` (dato
  propuesto por usabilidad, TI debe confirmar si ya existe en el CRM de
  ventas). El readme de lógica de negocio ya documentaba (antes de este
  prototipo) un router de 5 caminos con auto-cierre y ramificación real para
  este mismo subflujo (§6 "🟥 Mal Vendido — eventos"); el diseñador pidió
  explícitamente la versión acotada de solo sugerencia + cierre simple, no
  ese router — queda anotado en el readme como posible evolución futura, no
  como lo construido. "Cambio de servicio" y "Posible baja" (los otros 2
  motivos de reevaluación) siguen sin subflujo propio — usan las 3 opciones
  genéricas de `DecisionCierreDialog`.
- 2026-08-26: El diseñador pidió, de paso, que la opción de adjuntar
  documentos "siempre se mantenga" y esté disponible "en todas las modales"
  — se implementó puntualmente en `RevisionMalVendidoDialog` (pedido
  explícito para ese diálogo). Extender el patrón de adjuntar documentos
  (ya existente en `AgregarCasoDialog` y `ConfirmarReembolsoBajaDialog`) al
  resto de diálogos de gestión sigue pendiente — no se tocó ningún otro
  diálogo todavía.
- 2026-08-26: Se retiró el paso "Iniciar evaluación" para **todos** los tipos
  de caso (antes solo se había sacado para reembolso y modificación de
  contrato) — decisión explícita del diseñador. `accionPrincipal`
  (`caso-helpers.ts`) ya no tiene ninguna rama que devuelva "Iniciar
  evaluación": todo caso en "por evaluar" va directo a "Resolver" (o al kind
  correspondiente para modificación de contrato). Se sacó el cableado de
  `IniciarEvaluacionDialog` de `DeskResDesk.tsx` (import, tipo de diálogo,
  componente en el árbol) y el kind `"iniciar-evaluacion"` del tipo
  `AccionPrincipal`; el archivo del diálogo no se borró — mismo criterio que
  `EditarCasoDialog` — por si se quiere reactivar más adelante.
- 2026-08-26: Segundo subflujo de "Reevaluación de servicio": **posible
  baja**, para reevaluación con motivo "Posible baja". A diferencia de mal
  vendido, **sí conserva el botón "Resolver"** en la tarjeta — abre el
  `DecisionCierreDialog` genérico (Se mantiene / Derivación / Dar de baja),
  igual que "Cambio de servicio", sin ninguna rama especial en
  `accionPrincipal`. Lo único distinto: `AgregarCasoDialog`, al elegir
  motivo "Posible baja", despliega **Tipo de baja** (reutiliza `motivoBaja` /
  `MOTIVOS_BAJA`, mismas 4 opciones que ya existían en "Dar de baja" de
  `DecisionCierreDialog`) y al confirmar la creación deja
  `capitanACargo = "Líder de operaciones"` (capitán nuevo, agregado a
  `CAPITANES`) de una vez, marcando que ya está en su conocimiento —
  independiente de que "Resolver" siga disponible. Documentos adjuntos usa
  el campo que `AgregarCasoDialog` ya tenía para todos los tipos de caso, no
  se agregó uno aparte. Sección informativa en `CasoCard` ("Posible baja —
  pendiente líder de operaciones") con tipo de baja y a cargo de quién,
  visible mientras el caso no esté resuelto (no reemplaza el botón).
  (Iteración del mismo día: se probó primero con un diálogo dedicado
  `RevisionPosibleBajaDialog` + botón "Elevar a líder de operaciones" que
  dejaba la tarjeta sin ninguna acción — el diseñador corrigió que "Resolver"
  debe seguir apareciendo igual que en cualquier otro caso; ese archivo se
  borró del todo, nunca llegó a usarse.) Este subflujo **no está diseñado
  completo a propósito**: el diseñador todavía no tiene la definición de la
  líder de operaciones sobre qué hace con cada tipo de baja — es posible que
  "Resolver" deba cambiar de comportamiento más adelante una vez que la
  traiga. **No construir ese siguiente paso** sin que el diseñador lo
  confirme primero — lo pidió explícitamente ("por ahora déjalo así porque
  necesito la data de la líder"). "Cambio de servicio" sigue siendo el único
  motivo de reevaluación sin ninguna captura extra propia.
- 2026-08-26: Se agregaron 3 campos más al formulario de "Posible baja" en
  `AgregarCasoDialog` (junto a "Tipo de baja", que ya existía): **Origen**
  (`ORIGENES_POSIBLE_BAJA`: Ventas / Cobranza / Cuotas impagas / Ops /
  Voluntaria, obligatorio), **Motivo** (`MOTIVOS_POSIBLE_BAJA`: 11 opciones
  granulares — 1°/2/3/4 cuota(s) impaga(s), No colaboración, Insatisfacción
  con el servicio, Problemas económicos, Mal vendido, Inviable, Venta
  arrepentida, Inubicable —, obligatorio, complementa a "Tipo de baja" sin
  reemplazarlo) y **Comentarios** (texto libre, opcional). 3 campos nuevos en
  `Caso` (`origenPosibleBaja`, `motivoPosibleBaja`, `comentariosPosibleBaja`),
  declarados en el contrato de datos como `generatedByUsability` +
  `pendingTi`, mismo criterio que el resto de campos de este subflujo. Se
  muestran también en la sección "Posible baja — pendiente líder de
  operaciones" de `CasoCard`. El pedido textual usaba "1° cuota impaga, no
  colaboración... 2 cuotas impagas, 3 cuotas impagas, inubicable, 4 cuotas
  impagas" en orden disperso — se reordenaron las variantes de cuotas
  impagas consecutivas (1°→4) en la lista para que se lean mejor en el
  selector; el conjunto de opciones es el mismo, solo cambió el orden.
- 2026-08-26: El diseñador pidió sacar **"Tipo de baja"** (`MOTIVOS_BAJA`)
  del formulario de creación de "Posible baja" — con "Origen" y "Motivo" ya
  alcanza para la clasificación temprana. "Tipo de baja" no se borró del
  modelo: sigue existiendo donde estaba antes de este subflujo, en "Dar de
  baja" dentro de `DecisionCierreDialog` (independiente de "Posible baja").
  La sección "Posible baja — pendiente líder de operaciones" en `CasoCard`
  ahora se activa con `caso.origenPosibleBaja` en vez de `caso.motivoBaja`
  (que ya no se captura en la creación). `capitanACargo = "Líder de
  operaciones"` se sigue poniendo igual al crear el caso.
- 2026-08-26: Dentro de "Dar de baja" (en `DecisionCierreDialog`, para
  reevaluación con motivo "Cambio de servicio" y para reembolso/derivación
  cuando aplica), el diseñador pidió agregar un paso previo: **¿Se aprueba
  la baja?**, con 3 tarjetas — Se aprueba / Se rechaza / Falta información —
  y **comentario obligatorio** en las tres (campo nuevo `comentarioBaja`,
  reutilizado por las tres, con la pregunta del comentario cambiando según
  la opción). "Se aprueba" sigue con el flujo de siempre (motivo de baja +
  reembolso). "Se rechaza" cierra el caso con `resultado = "Se mantiene"`.
  "Falta información" **no cierra el caso** — sigue en "En evaluación" con
  "Resolver" disponible, y `CasoCard` muestra una sección "Falta
  información para decidir la baja" con el comentario mientras siga sin
  resolver (se distingue de otros casos activos por
  `!resuelto && comentarioBaja && !resultado`, ya que "se aprueba"/"se
  rechaza" siempre dejan `resultado` seteado).
- 2026-08-26: Reevaluación con motivo "Posible baja" — el diseñador pidió
  sacar el paso intermedio de elegir entre Se mantiene/Derivación/Dar de
  baja: "Resolver" ahora abre directo un diálogo dedicado nuevo,
  `RevisionPosibleBajaDialog` (kind `"revisar-posible-baja"` en
  `accionPrincipal`, evaluado siempre que el caso no esté resuelto —
  también después de "Falta información", para volver al mismo diálogo).
  Reutiliza exactamente la misma decisión de 3 opciones que "Dar de baja"
  en `DecisionCierreDialog` (mismo campo `comentarioBaja`), pero sin pasar
  por el selector genérico de resultado — tiene sentido porque el caso ya
  nació como una posible baja. `DecisionCierreDialog` ya no se toca para
  "Posible baja"; sigue intacto para "Cambio de servicio" y reembolso.
  (Dos iteraciones el mismo día antes de llegar a esto: primero "Resolver"
  abría `DecisionCierreDialog` normal con el paso "Se aprueba/rechaza"
  recién visible dentro de "Dar de baja" — el diseñador probó ese camino y
  pidió sacar el paso intermedio.)
- 2026-08-26: Dentro de `RevisionPosibleBajaDialog`, "Se aprueba baja" se
  simplificó — ya no pide **Motivo de baja** (redundante: "Motivo" ya se
  capturó al crear el caso, `motivoPosibleBaja`) ni **¿Corresponde
  reembolso?** (se sacó la opción completa, con sus campos de cuenta). Ahora
  "Se aprueba" es solo el comentario obligatorio → cierra directo con
  `resultado = "Dar de baja"`, sin la rama de `pendienteConfirmacion:
  "reembolso-baja"` que sí sigue existiendo en el "Dar de baja" genérico de
  `DecisionCierreDialog` (para "Cambio de servicio"). El diseñador confirmó
  que, tal como ya estaba, "Falta información" deja el caso en "En
  evaluación" y que al volver a resolverlo se repite esta misma decisión de
  3 opciones — no hubo que tocar nada ahí, `accionPrincipal` ya lo hacía
  bien desde que se agregó el diálogo dedicado.
- 2026-08-26: `RevisionPosibleBajaDialog` ahora muestra, arriba de las 3
  opciones, un recuadro de solo lectura con "Información solicitada por la
  líder de operaciones" cuando el caso quedó en "Falta información" la vez
  anterior (`caso.comentarioBaja` presente y `caso.resultado` todavía sin
  definir — mismo criterio que ya usaba `CasoCard` para su sección
  equivalente). El diseñador lo pidió para que el capitán vea qué le
  pidieron antes de completar la información y volver a resolver. Es
  puramente de contexto: no precarga el comentario nuevo, la Textarea de
  esta vuelta sigue empezando con el texto de prueba de siempre.
- 2026-08-26: Se sacó de `CasoCard` la sección "Falta información para
  decidir la baja" (mostraba `caso.comentarioBaja` en la tarjeta) — el
  diseñador pidió no repetirlo ahí ahora que el mismo comentario ya se
  muestra dentro de `RevisionPosibleBajaDialog` al volver a abrir
  "Resolver". Ese comentario vive solo en el diálogo.
- 2026-08-26: "Posible baja" pasó de un único diálogo a **dos turnos que se
  alternan** — el diseñador explicó el flujo completo: capitán registra el
  caso → líder de operaciones decide (aprobar/rechazar/falta información) →
  si falta información, el capitán la completa **en un paso separado, sin
  ver ni decidir las 3 opciones** → vuelve a la líder para que decida.
  Campo nuevo `turnoPosibleBaja` (`"lider-operaciones" | "capitan"`) en
  `Caso`, que `accionPrincipal` usa para elegir el diálogo: turno líder →
  "Resolver" abre `RevisionPosibleBajaDialog` (como antes, 3 opciones);
  turno capitán → botón con label distinto, **"Completar información"**,
  abre el diálogo nuevo `CompletarInformacionBajaDialog` (le muestra
  `comentarioBaja` de solo lectura y pide una respuesta obligatoria en el
  campo nuevo `respuestaBaja`; al guardar devuelve el turno a la líder, el
  caso sigue en "En evaluación"). Cuando el turno vuelve a la líder con una
  respuesta pendiente, `RevisionPosibleBajaDialog` muestra el pedido
  original y la respuesta del capitán juntos, antes de repetir la
  decisión — puede volver a pedir "Falta información" si no alcanza, el
  ciclo se repite. Ninguno de los dos comentarios (pedido/respuesta) se
  muestra en `CasoCard` — siguen la misma regla que se pidió antes, viven
  solo en los diálogos.
- 2026-08-26: En `RevisionPosibleBajaDialog`, el bloque "Pediste" /
  "Respondió el capitán" pasó a etiquetarse **"Lo solicitado"** /
  **"Respuesta"**, y quedó dentro de un acordeón plegable ("Solicitud y
  respuesta", abierto por defecto — mismo patrón que "Datos para
  transferir" en `ConfirmarReembolsoBajaDialog`) porque el texto puede ser
  largo.
- 2026-08-26: Tercer subflujo de "Reevaluación de servicio": **derivación**
  (motivo "Cambio de servicio", ya venía sin subflujo propio). Al crear el
  caso, `AgregarCasoDialog` ahora pide **"Posible servicio de derivación"**
  (`servicioDestino`, reutiliza `SERVICIOS_DERIVACION` que ya existía),
  obligatorio para este motivo. "Resolver" abre un diálogo dedicado nuevo,
  `RevisionDerivacionDialog` (kind `"revisar-derivacion"` en
  `accionPrincipal`) — no pasa por `DecisionCierreDialog`. El capitán
  registra si el cliente **aprueba o rechaza** la derivación: "rechaza"
  cierra el caso directo como baja (`resultado = "Dar de baja"`); "aprueba"
  despliega el **Acta de derivación** completa (16 campos, según la
  referencia que trajo el diseñador — cliente/correo/servicio origen/abogado
  vendedor de solo lectura, servicio destino editable, acreedores, monto
  adeudado, situación tributaria, demanda/prenda/hipotecario/pensión de
  alimentos/sociedades como checkboxes, bienes, otros datos importantes,
  resumen, compromisos, fecha pago primera cuota) y al guardar dejar el caso
  en "En evaluación" con `pasoDerivacion = "recepcion"` — de ahí en
  adelante sigue el flujo de recepción **que ya existía antes de este
  cambio** (`RecepcionDerivacionDialog`, sin tocar): el capitán receptor
  aprueba o rechaza recibir el caso y, si aprueba, solo **marca** si hace
  falta un nuevo cobro (`requiereNuevoCobro`) — generar ese cobro de verdad
  es trabajo futuro ("eso luego"), no de este cambio.
  Tipo nuevo `ActaDerivacion` en `caso.ts` (reemplaza el placeholder que ya
  existía solo para mostrar, nunca capturar). Situación tributaria quedó
  como texto libre (no un select fijo) porque el diseñador no confirmó la
  taxonomía todavía; los 5 campos sí/no del acta se guardan como el mismo
  patrón `"Sí" | ""` que ya usa el resto del modelo, para no romper el
  contrato de datos. Campos nuevos declarados en el contrato como
  `generatedByUsability` + `pendingTi`, mismo criterio que el resto de este
  proyecto; `pnpm check:prototype` corrido y en verde.
  **Nota de código sin usar:** con los 3 motivos de reevaluación (Mal
  vendido, Posible baja, Cambio de servicio) ahora enrutados cada uno a su
  propio diálogo dedicado, las ramas de reevaluación dentro de
  `DecisionCierreDialog` (Se mantiene / Derivación / Dar de baja, incluida
  la decisión de 3 opciones que tenía adentro) quedaron sin ningún punto de
  entrada — no se borraron (cambio grande, no era lo pedido esta vez), es
  candidato claro para una limpieza futura si el diseñador lo pide. El resto
  de `DecisionCierreDialog` sigue en uso (reembolso).
- 2026-08-27: `RevisionDerivacionDialog` — el acta de derivación ahora
  también captura **"Compromisos y próximos pasos"** y **"Fecha acordada
  con el cliente para el pago de la 1° cuota"** (`compromisos` y
  `fechaPagoPrimeraCuota`, ya existían en el tipo `ActaDerivacion` desde
  antes pero el diálogo no los pedía — quedaron sin capturar hasta este
  pedido explícito del diseñador). Además se agregó el checkbox **"Requiere
  un nuevo cobro en Apio"** al final del acta. El diseñador confirmó
  (pregunta directa, ver decisión abajo) que esta marca **reemplaza** la que
  antes vivía en `RecepcionDerivacionDialog`: ahora se decide al completar
  el acta (capitán que deriva), no al recibir el caso (capitán receptor).
  Se sacó el checkbox de `RecepcionDerivacionDialog`, que ahora solo
  muestra un aviso de solo lectura con lo que dice el acta y usa
  `caso.requiereNuevoCobro` para su propia lógica de guardado (antes tenía
  su propio estado local). Contrato de datos: `requiereNuevoCobro` pasó a
  `editable: true` (ya era editable en la práctica, la metadata estaba
  desactualizada); los campos de `ActaDerivacion` (incluyendo
  `fechaPagoPrimeraCuota`) también pasaron de `editable: false` +
  `usedIn: ["Tarjeta de caso — Acta de derivación"]` a `editable: true` +
  `usedIn: usedInDesk`, para reflejar que ya se capturan en
  `RevisionDerivacionDialog` y no son solo de exhibición (quedaron así de
  la simplificación de alcance original del 2026-08-20, antes de que el
  acta tuviera diálogo propio). `pnpm check:prototype` en verde.
- 2026-08-28: Simplificación del flujo de derivación, a pedido explícito del
  diseñador. `RevisionDerivacionDialog` ya no pregunta primero "¿el cliente
  aprueba o rechaza?": "Resolver" va directo al Acta de derivación completa
  (se sacó el radio de decisión, el `Guardar` de siempre escribe el acta).
  `RecepcionDerivacionDialog` ahora muestra el Acta de derivación completa
  de solo lectura arriba de todo (componente nuevo `ActaDerivacionSummary`
  en `src/features/`, mismo patrón que `CobroAnteriorSummary`), para que el
  capitán receptor decida en base a ella. Si el receptor **rechaza**, ya no
  reabre el caso como Mal Vendido automáticamente con un motivo libre:
  ahora elige entre **"Derivación a otro equipo"** / **"Dar de baja"** /
  **"Otro"** (`MOTIVOS_RECHAZO_RECEPCION`, tarjetas seleccionables, mismo
  patrón que `RevisionMalVendidoDialog`) con justificación obligatoria
  (`rechazoRecepcionJustificacion`), y **las 3 opciones cierran el caso**
  — confirmado explícitamente por el diseñador vía pregunta directa (misma
  decisión que "Mal vendido": cerrar con nota, no ejecutar el camino
  automáticamente). Campos nuevos en `Caso`: `rechazoRecepcionMotivo`,
  `rechazoRecepcionJustificacion` (`generatedByUsability` + `pendingTi`).
- 2026-08-28: **ID Defensoría** — nuevo campo `Cliente.idDefensoria`
  (obligatorio, mismo nivel que nombre/correo/teléfono), a pedido del
  diseñador para que se vea "en todas las tarjetas debajo del correo". Se
  muestra en el encabezado de `CasoCard` (siempre visible, no dentro del
  desplegable) y se captura en `AgregarCasoDialog` como placeholder
  precargado (`[ID Defensoría]`), mismo patrón que nombre/servicio/etapa/
  abogados — dato que en producción vendría del scrapeo de caja post-venta,
  hoy no implementado.
- 2026-08-28: **Campos de "Agregar nuevo acreedor"** — a pedido del
  diseñador, "Valor cuota" se separó en dos campos: **"Número de cuotas"**
  (nuevo) y **"Valor primera cuota"** (antes "Valor cuota"). Cambio en el
  tipo `Acreedor` (`valorCuota` → `valorPrimeraCuota`, más el campo nuevo
  `cuotas`), reflejado en `AgregarCasoDialog` (creación de "Agregar nuevo
  acreedor"), `GenerarNuevoCobroDialog` (resolución) y `CasoCard` (sección
  "Acreedor"). "Monto nuevo contrato" no cambió. `pnpm check:prototype` en
  verde para los 4 cambios de esta entrada.
- 2026-08-28: El Acta de derivación se movió de "Resolver" a la **creación**
  del caso. Antes: crear caso con motivo "Cambio de servicio" → "Resolver"
  abría `RevisionDerivacionDialog` para llenar el acta → capitán receptor
  decidía. Ahora, a pedido explícito del diseñador ("al momento de agregar
  el nuevo caso como derivación... rellenar el acta de derivación"):
  `AgregarCasoDialog`, al elegir motivo "Cambio de servicio", despliega de
  una vez el Acta de derivación completa (mismos campos que tenía
  `RevisionDerivacionDialog`, sin repetir Cliente/Correo/Servicio
  origen/Abogado vendedor porque ya se capturan arriba, en el paso
  compartido de todos los tipos de caso). Al confirmar "Crear caso", el
  caso nace directo en `estadoProceso = "en-evaluacion"` con
  `pasoDerivacion = "recepcion"` (salta "por evaluar" — único tipo de caso
  que lo hace) y `resultado = "Derivación a otro servicio"` ya seteado.
  "Resolver" para este motivo ahora abre **únicamente**
  `RecepcionDerivacionDialog` (aprobar/rechazar recepción, ver entrada de
  arriba) — no hay ningún paso de revisión entre crear el caso y la
  recepción. Consecuencia: `RevisionDerivacionDialog` quedó sin ningún
  punto de entrada (se sacó su cableado de `DeskResDesk.tsx` y el kind
  `"revisar-derivacion"` de `AccionPrincipal`); el archivo no se borró
  pero, a diferencia de `IniciarEvaluacionDialog`/`EditarCasoDialog`, ya no
  es un buen candidato para reactivar (su contenido se duplicó dentro de
  `AgregarCasoDialog`) — es más bien candidato a borrar en una próxima
  pasada si se pide. `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en
  verde; validado con script sintético de `accionPrincipal`.
- 2026-08-28: El diseñador pidió sacar el Acta de derivación completa de
  `RecepcionDerivacionDialog` (se había agregado la sesión anterior): "esta
  solo debe verse en la tarjeta desplegable, no en el modal — que la modal
  sea solo para la acción de aprobar o rechazar". Se sacó
  `ActaDerivacionSummary` del modal y se borró el archivo (componente
  nuevo de la sesión anterior, sin otros usos — no aplica el criterio de
  "guardar por si se reactiva"). El acta completa sigue viéndose igual en
  el desplegable de `CasoCard` (nunca se tocó ahí).
- 2026-08-28: Nuevo contexto para generar el cobro por derivación. A
  pedido del diseñador, cuando se solicita "nuevo cobro" en un caso
  derivado, esa info debe quedar disponible para quien genere el cobro
  después. Se agregaron 4 campos a `ActaDerivacion` (capturados en el acta,
  al crear el caso): `circunstancia` (`CIRCUNSTANCIAS_CAMBIO_SERVICIO`:
  Voluntario / Negligencia de nuestra parte), `queSeHizoEnOrigen`,
  `estrategia`, `tacticas` (los 3 últimos texto libre — no se armó un
  catálogo de tácticas por servicio, taxonomía sin confirmar). El resto de
  lo pedido ya existía: cuánto se cobró/pagó del cobro activo =
  `caso.cobroAnterior` (ya capturado); monto deuda a contratar/acreedor/
  fecha pago primera cuota = campos del acta que ya existían; motivo del
  cambio de servicio = el campo `resumen` del acta, ya existente.
  `NuevoCobroDialog` ahora muestra, cuando `caso.actaDerivacion` existe, un
  bloque nuevo `ContextoDerivacionSummary` (junto al `CobroAnteriorSummary`
  que ya mostraba) con todo lo anterior más **cuántas veces ha sido
  derivado el cliente** ("Primera derivación" / "Derivación N.º X") —
  esto último es **calculado**, no un campo: cuenta cuántos casos del
  mismo `cliente.correo` tienen `actaDerivacion`, para eso `NuevoCobroDialog`
  ahora recibe la lista completa de `casos` como prop (antes solo recibía
  el caso individual). Contrato de datos actualizado (4 campos nuevos +
  descripción de la entidad `actaDerivacion` corregida para reflejar que
  se captura al crear el caso, no al confirmar el acta después);
  `pnpm check:prototype` en verde. Validado con script sintético del
  cálculo de veces derivado.
- 2026-08-28: Se sacó "Capitán receptor" de `RecepcionDerivacionDialog` a
  pedido del diseñador — al aceptar la recepción ya no se elige un capitán
  de una lista. Se quitó el campo `capitanReceptor` del modelo (`Caso`),
  del contrato de datos, y el chip "Receptor {capitán}" que `CasoCard`
  mostraba en el encabezado (ese chip en la práctica nunca se activaba: su
  condición dependía de `tipoCaso === "derivacion"`, un valor que el
  código nunca asigna — la derivación real vive en `tipoCaso:
  "reevaluacion"` con `motivo: "Cambio de servicio"`). `capitanACargo` ya
  no se actualiza al aceptar la recepción. `tsc`/`eslint`/`prettier`/
  `pnpm check:prototype` en verde.
- 2026-08-28: `RecepcionDerivacionDialog` — al rechazar, el diseñador
  aclaró que "Indicar opción" (antes "¿Qué corresponde hacer con el
  caso?", `rechazoRecepcionMotivo`) **no es una decisión definitiva, es
  una sugerencia** de cómo seguir con el caso. Se cambió la UI de tarjetas
  seleccionables a un `Select` simple (mismo patrón que "Camino sugerido"
  de `RevisionMalVendidoDialog`, misma leyenda aclaratoria) y se sacó la
  lógica que hacía que "Dar de baja" seteara `resultado = "Dar de baja"`
  — ahora `resultado` siempre queda sin definir al rechazar, en los 3
  casos. El caso se sigue cerrando igual; solo cambió que la opción
  elegida ya no tiene ningún efecto sobre el `resultado` del caso, es
  puramente informativa (igual que el "camino sugerido" de Mal Vendido).
  En `CasoCard`, el valor pasó de mostrarse en la grilla de "Resolución de
  cierre" a una línea de texto aparte ("Opción sugerida al rechazar la
  recepción: ..."), mismo estilo que "Camino sugerido para el capitán".
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde.
- 2026-08-29: Dos ajustes al acta de derivación (motivo "Cambio de
  servicio"), a pedido del diseñador:
  - Se sacó **"Circunstancia del cambio de servicio"** (Voluntario /
    Negligencia de nuestra parte), agregada el día anterior — se borró del
    todo: el campo `circunstancia` de `ActaDerivacion`, el tipo
    `CircunstanciaCambioServicio` y la constante
    `CIRCUNSTANCIAS_CAMBIO_SERVICIO` (`caso.ts`), el `Select` en
    `AgregarCasoDialog`, su entrada en el contrato de datos, y su
    exhibición en `CasoCard`/`ContextoDerivacionSummary`.
  - **Estrategia** y **Tácticas** dejaron de ser texto libre editable:
    ahora se scrapean como información predeterminada, igual que Servicio
    actual/Etapa en Streak/Abogado a cargo/Abogado vendedor — campos
    deshabilitados con placeholder entre corchetes
    (`ESTRATEGIA_PLACEHOLDER`, `TACTICAS_PLACEHOLDER`), el mismo valor en
    todos los casos (hoy no existe ese scraper; en producción vendría de
    ahí, mismo criterio que el resto de los campos "post-venta"). El
    contrato de datos las sacó del bloque genérico de campos editables del
    acta y les dio entrada propia con `editable: false` + `NOTE_SCRAPER`,
    mismo tratamiento que `descripcionVentas`.
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde.
- 2026-08-29: Reposición de Estrategia/Tácticas en `AgregarCasoDialog` — el
  diseñador pidió que aparezcan arriba, junto al resto de los datos
  scrapeados (Servicio actual/Etapa/Abogado a cargo/Abogado vendedor),
  antes de "Descripción del caso", en vez de más abajo dentro de la
  sección "Relato" del acta. Solo cambió el orden visual (siguen siendo
  `ESTRATEGIA_PLACEHOLDER`/`TACTICAS_PLACEHOLDER`, condicionadas a
  `esCambioServicio`, sin cambios de datos ni de contrato).
- 2026-08-29: Mismo día, el diseñador pidió ir más lejos: que Estrategia y
  Tácticas scrapeadas aparezcan **en todos los casos que se agreguen**, no
  solo en "Cambio de servicio". Se sacaron de `ActaDerivacion` y pasaron a
  ser campos de nivel `Caso` (`estrategia?`, `tacticas?`, junto a
  `descripcionVentas`) — se muestran y se guardan sin condición de tipo de
  caso o motivo, mismo patrón que el resto de los datos "post-venta"
  scrapeados. Placeholders actualizados a texto genérico (`"[estrategia
  sugerida]"` / `"[tácticas sugeridas]"`, antes mencionaban "servicio
  destino"). En `CasoCard` se movieron de la sección "Acta de derivación"
  a "Información post-venta" (visible para cualquier caso, junto a
  "Descripción del caso"). `ContextoDerivacionSummary` (usado en
  `NuevoCobroDialog` para el contexto de nuevo cobro por derivación) ahora
  recibe `estrategia`/`tacticas` como props aparte en vez de leerlas de
  `acta`, ya que el acta dejó de tenerlas. Contrato de datos: las 2
  entradas se movieron de la entidad `actaDerivacion` a la entidad `caso`
  (junto a `descripcionVentas`), mismo `editable: false` + `NOTE_SCRAPER`.
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde.
- 2026-08-29 (mismo día): dos ajustes más al acta de derivación, a pedido
  del diseñador:
  - Se sacó **"Qué se hizo por el cliente en el servicio de origen"**
    (texto libre, agregada el día anterior) — sin campo de reemplazo.
  - Se agregó **"Derivaciones realizadas"**: radio "Ninguna" (default
    explícito pedido por el diseñador) / "Ha sido derivado antes". Al
    elegir la segunda opción se piden **Servicio de la derivación
    anterior** (`SERVICIOS_DERIVACION`) y **Motivo de la derivación
    anterior** (texto libre), ambos obligatorios en ese caso. Campos
    nuevos en `ActaDerivacion`: `huboDerivacionAnterior` (boolean),
    `derivacionAnteriorServicio` (`ServicioDerivacion`, opcional),
    `derivacionAnteriorMotivo` (string, opcional). Se muestra en
    `CasoCard` (dentro de "Acta de derivación": "Derivaciones realizadas"
    con el servicio, más una línea aparte con el motivo cuando aplica) y
    en `ContextoDerivacionSummary`/`NuevoCobroDialog` (mismo criterio,
    como contexto para quien genera el nuevo cobro). Es un dato distinto
    de "cuántas veces ya fue derivado" que ya se calculaba en
    `NuevoCobroDialog` contando casos con `actaDerivacion` del mismo
    correo — ese conteo es automático y solo ve derivaciones dentro de
    este Desk; "Derivaciones realizadas" es lo que el capitán declara a
    mano sobre el historial *antes* de este caso. Contrato de datos
    actualizado (`huboDerivacionAnterior` y `derivacionAnteriorServicio`
    con entrada propia; `derivacionAnteriorMotivo` en el bloque genérico
    de campos de texto del acta; se sacó `queSeHizoEnOrigen`).
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde.
- 2026-08-29: Dos ajustes a `NuevoCobroDialog` (definir nuevo cobro por
  derivación), a pedido del diseñador:
  - "Fecha pago primera cuota" en `ContextoDerivacionSummary` dejó de
    ocultarse cuando el campo del acta viene vacío (era opcional, así que
    en la práctica casi nunca se mostraba) — ahora siempre aparece, con
    "—" como valor cuando no se definió.
  - Se agregó el bloque "Descripción del caso (post-venta)"
    (`caso.descripcionVentas`) arriba de todo en el diálogo, mismo estilo
    que en `CasoCard`, para que quien fija el monto del nuevo cobro no
    tenga que salir de la modal a revisarlo.
- 2026-08-29 (mismo día, corrección): el diseñador pidió sacar el bloque
  de "Descripción del caso" recién agregado — no era lo que quería — y en
  su lugar mostrar la **data real de "Cobro anterior"**. Al investigar, la
  causa raíz era que `CobroAnteriorSummary` (que ya estaba en
  `NuevoCobroDialog` y en `RecepcionDerivacionDialog`) siempre salía vacía
  porque **`caso.cobroAnterior` nunca se guardaba en ningún lado** — el
  acordeón "Cobro anterior (post-venta)" de `AgregarCasoDialog` era solo
  un mockup visual con placeholders entre corchetes, nunca conectado a
  ningún estado real. Se corrigió de raíz, no solo en este diálogo: se
  agregó `COBRO_ANTERIOR_PRUEBA` a `datosPrueba.ts` (datos de prueba
  realistas, mismo criterio que `MONTO_NUEVO_CONTRATO_PRUEBA` y afines) y
  `AgregarCasoDialog` ahora guarda `cobroAnterior: COBRO_ANTERIOR_PRUEBA`
  para **todos** los tipos de caso, sin condición, igual que
  `descripcionVentas`/`estrategia`/`tacticas`. El acordeón de esa misma
  pantalla se actualizó para mostrar esos mismos valores formateados en
  vez de placeholders entre corchetes, para que lo que se ve al crear el
  caso coincida con lo que aparece después en
  `CasoCard`/`NuevoCobroDialog`/`RecepcionDerivacionDialog`. Efecto
  colateral esperado y correcto: "Cobro anterior (post-venta)" ahora
  también se ve con datos reales en esos otros dos diálogos, que ya lo
  mostraban pero silenciosamente no tenían nada que mostrar.
  Adicionalmente se sacó el selector **"Estado"** de `NuevoCobroDialog`
  (el diseñador lo pidió aparte, mismo mensaje). La progresión de estados
  (`pendiente → definido → confirmado → esperando-cliente →
  aceptado-cliente`, `siguienteEstado`) sigue existiendo tal cual estaba,
  pero ahora avanza sola cada vez que se abre el diálogo — el usuario ya
  no la elige de una lista, solo ve los campos del paso correspondiente
  (Valor/Cuotas, Confirmado por) y confirma. `ESTADO_LABEL` y el import de
  `Select` quedaron sin uso en ese archivo y se borraron.
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde.
- 2026-08-29 (horas después, mismo día): dos correcciones más al flujo de
  "Cambio de servicio", a pedido del diseñador:
  - `RecepcionDerivacionDialog` (aceptar/rechazar recepción) **ya no
    muestra el cobro anterior de post-venta** — esa modal es solo para la
    acción de aprobar/rechazar. Se sacó `<CobroAnteriorSummary>` de ahí
    (el dato sigue visible en `CasoCard`).
  - En `NuevoCobroDialog`, "Cobro anterior (post-venta)" pasó de mostrarse
    fijo a mostrarse en un **desplegable** (acordeón), mismo patrón visual
    que el acordeón homónimo de `AgregarCasoDialog`. Para lograrlo sin
    duplicar el título, `CobroAnteriorSummary` (`src/features/`) ganó un
    prop opcional `hideTitle` — cuando es `true`, devuelve solo la grilla
    de datos, sin el `<h3>` ni el recuadro propio, para que el
    `AccordionTrigger` haga de título.
  - Además, la sesión anterior había sacado el *selector* de "Estado" pero
    mantenido el avance automático interno paso a paso
    (`pendiente → definido → …`). El diseñador aclaró el comportamiento
    real que quiere: al presionar "Definir nuevo cobro" el caso debe
    quedar directamente **a la espera de que el cliente acepte el cobro en
    Apio**, y solo cuando lo acepte (fuera de la app) el caso pasa a
    "Resueltos". Se simplificó `NuevoCobroDialog` a un solo paso: define
    Valor/Cuotas una vez y al confirmar escribe
    `nuevoCobro.estado = "esperando-cliente"` directo (se borraron
    `ESTADOS_ORDENADOS`/`siguienteEstado`/el campo "Confirmado por" —
    pertenecía al paso "confirmado" que ya no existe). Para que el caso
    efectivamente quede **sin acción principal** mientras espera, el
    chequeo `accionPrincipal` de `caso-helpers.ts` que antes solo aplicaba
    a "Agregar nuevo acreedor" (`esNuevoAcreedor && nuevoCobro.estado !==
    "pendiente"`) se generalizó a cualquier caso con
    `nuevoCobro?.estado === "esperando-cliente"` — ahora los 3 caminos que
    generan un nuevo cobro (nuevo acreedor, "Por derivación de servicio",
    derivación con nuevo cobro) se comportan igual: un solo paso, después
    sin acción hasta que Apio confirme. Validado con script sintético de
    `accionPrincipal` para los 3 casos (definir pendiente → acción visible;
    esperando-cliente → sin acción, para derivación y para nuevo acreedor).
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde.
- 2026-08-29: Pasada de diseño visual en `CasoCard` (`src/features/`), a
  pedido del diseñador ("que se vea más ordenado y cohesivo, sobretodo
  tamaño de letras y color"):
  - **Radio de la tarjeta:** `rounded-xl` (12px) en el `<Card>` de cada
    caso — un paso por sobre el radio estándar de card del sistema (10px,
    `rounded-lg`), decisión local y consciente para esta tarjeta puntual,
    no un cambio al componente `Card` compartido. Las cajas estáticas
    internas (recuadros de info, envoltorios de acordeón) que usaban
    `rounded-control` (6px, reservado para controles interactivos como
    inputs) pasaron a `rounded-lg` (10px) — corrección de uso más que
    estética, ya no son controles.
  - **ID Defensoría** pasó de su propia línea a la misma línea que el
    correo, separados por "·".
  - **"Información post-venta"** quedó como su propio acordeón con
    superficie `bg-background` (blanco) dentro del panel `bg-secondary`
    de la tarjeta — jerarquía de superficie explícita (canvas < panel <
    caja post-venta) en vez de mezclarse con el resto de los datos.
  - **Lavanda para todo el desplegable** (corregido el mismo día, ver nota
    de abajo — versión final, no la que sigue): se usó el token de marca
    ya existente `--color-brand-lavender` (`#9d90fc`, definido en
    `lexy-theme.css` como "lavanda de marca · superficies expresivas",
    nunca antes consumido en el producto) — `bg-brand-lavender/10` +
    `border-brand-lavender/25` en cada acordeón completo (post-venta,
    detalle de la derivación, acta de derivación), trigger incluido, no
    solo el contenido interno.
  - **Densidad de los desplegables** ("Acta de derivación" y afines):
    gaps de `gap-3`/`space-y-3` a `gap-2`/`space-y-2`, triggers de
    `py-4` (default del componente) a `py-3`, para que se sientan menos
    "toscos".
  - **Jerarquía tipográfica de `Campo`** (el par label/valor que se repite
    en toda la tarjeta): el label pasó de `type-meta text-muted-foreground`
    (12px, apagado) a `type-supporting font-semibold text-foreground`
    (14px, semibold, tinta plena) — ahora es más grande y prominente que
    el valor. El valor pasó de `type-body` (16px) a `type-meta` (12px,
    `text-muted-foreground`) — jerarquía invertida a pedido explícito del
    diseñador (label > valor), aplicada de una sola vez porque `Campo` es
    compartido por toda la tarjeta (grilla superior "Servicio"/"Abogado a
    cargo", todos los desplegables y todas las secciones de cierre).
  - **No se agregó sombra** a la tarjeta: la pauta de sistema visual
    reserva la elevación (`shadow-raised`/`shadow-overlay`) para
    superficies que realmente flotan (popovers, diálogos) — una card
    estática de lista se queda en superficie + tono + borde. El efecto
    "menos plano" se resuelve con radio, color y tipografía, no con
    sombra.
  `tsc`/`eslint`/`prettier`/`pnpm check:prototype` en verde. Confirmado
  que las clases de Tailwind del token `brand-lavender` compilan
  correctamente (`curl` al CSS servido por el dev server).
- 2026-08-29 (mismo día, correcciones sobre la pasada de diseño anterior):
  - **Orden:** la grilla "Servicio / Abogado a cargo / Abogado vendedor /
    Servicio destino" pasó a ir **arriba** de "Información post-venta"
    (antes iba después).
  - **Iconos de acordeón siempre a la izquierda:** los 3 desplegables de
    la tarjeta (post-venta, detalle de la derivación, acta de derivación)
    ahora usan `iconPosition="start"` — antes solo "Información
    post-venta" lo tenía, los otros dos usaban el default (chevron a la
    derecha).
  - **Lavanda en todo el desplegable, no solo adentro:** el diseñador
    corrigió que el color debía cubrir el acordeón completo (trigger +
    contenido), no aparecer recién al abrir. Se sacó el `<div>` interno
    con `bg-brand-lavender/10` y se aplicó directo al `<Accordion>`
    contenedor (`rounded-lg border-brand-lavender/25 bg-brand-lavender/10
    px-3`), así que ahora el lavanda se ve también con el acordeón
    cerrado.
  `tsc`/`eslint`/`prettier` en verde.
- 2026-08-29: **Login** (`src/features/Login.tsx`) — título cambiado de
  "Ingresa al Desk ReS" a **"Desk ReS"** (en `text-brand-navy`, centrado
  con el resto del `CardHeader`), descripción cambiada a "Ingresa con tu
  acceso interno para reevaluación de servicio."
- 2026-08-29: **Rotación de fondos** en `DeskResDesk`/`CasoCard`, a pedido
  del diseñador ("el color que tiene el fondo de todo el desarrollo
  déjalo en las tarjetas de los casos y el gris que está en la tarjeta
  déjalo como fondo de todo el desarrollo"): el lavado sutil de marca
  `bg-sidebar-hover` (el que tenía el canvas desde el 2026-08-25) pasó de
  ser el fondo de `DeskResDesk` a ser el fondo de la `Card` de cada caso;
  el gris `bg-secondary` (el que tenía el panel desplegado dentro de la
  tarjeta) pasó a ser el fondo de `DeskResDesk`. El panel interno de la
  tarjeta, que se quedó sin su gris, pasó a `bg-background` (blanco) — la
  tercera pieza de la rotación, para que seguir habiendo tres planos de
  profundidad distintos (canvas gris < tarjeta lavado de marca < panel
  desplegado blanco), solo que invertidos respecto al orden anterior
  (antes: canvas lavado de marca < tarjeta blanca < panel desplegado
  gris).
- 2026-08-29 (minutos después, corrección): el diseñador aclaró que la
  tarjeta (`Card`) debía quedar **blanca** (`bg-background`, vuelta al
  default del componente) y que el panel desplegado interno debía llevar
  el lavado de marca `bg-sidebar-hover` que había quedado en la tarjeta —
  no `bg-background` como quedó en la rotación anterior. Resultado final:
  canvas gris (`bg-secondary`, sin cambios) < tarjeta blanca
  (`bg-background`, el default de `Card`, sin override) < panel
  desplegado con lavado de marca (`bg-sidebar-hover`).
- 2026-08-29: **Login** (`src/features/Login.tsx`) — se agregó el
  isotipo/wordmark de Lexy (`Logo` de `src/shared/components/base/`,
  `layout="vertical"`, `h-12`) centrado arriba de la card, y el fondo de
  la pantalla pasó de `bg-background` (blanco plano) a `bg-secondary`
  (el mismo gris que ahora usa `DeskResDesk` como canvas), para que el
  login no se sienta plano ni desconectado del resto de la app.
- 2026-08-29: Cuarta pasada de diseño visual (`CasoCard`/`DeskResDesk`), a
  pedido del diseñador, con imagen de referencia para el patrón de campos:
  - **Botón de filtros:** dejó de ser `fixed left-4` (pegado al borde del
    navegador, independiente del ancho de la lista) y pasó a vivir dentro
    de un contenedor con el mismo `max-w-[1060px] mx-auto px-4 md:px-6
    lg:px-8` que usa `<main>` — así su borde izquierdo cae siempre en el
    mismo punto que el borde izquierdo real de las tarjetas, en cualquier
    ancho de pantalla. El wrapper externo es `pointer-events-none` (ocupa
    todo el ancho) y el interno (con el padding real) es
    `pointer-events-auto`, para no bloquear clics fuera del botón.
  - **Empty state:** `EmptyDescription` (en `DeskResDesk.tsx`) ganó borde
    punteado + texto en `text-brand-navy` (mismo token del login). Cambió
    el texto del estado "Todavía no hay casos por evaluar" a: "Presiona
    '+ Nuevo caso' para registrar uno nuevo: puede ser una reevaluación de
    servicio (que implica baja, derivación o mal vendido), una solicitud
    de reembolso o la generación de un nuevo cobro." — reemplaza el texto
    anterior, que mencionaba "alta de un nuevo acreedor" en vez de
    "generación de un nuevo cobro".
  - **Patrón "campo en recuadro"** (con imagen de referencia): el
    componente local `Campo` de `CasoCard.tsx` —usado en absolutamente
    todos los desplegables y secciones de la tarjeta— ganó
    `rounded-md border border-border-subtle bg-background px-2.5 py-1.5`.
    Sobre el fondo lavanda de los desplegables (pasada anterior), el
    recuadro blanco de cada campo contrasta y se lee como una ficha
    individual; sobre el cuerpo blanco de la tarjeta (grilla "Servicio"/
    "Abogado a cargo"), el borde solo alcanza para delimitarlo. No se tocó
    la jerarquía tipográfica label/valor decidida en la pasada anterior
    (label más grande que el valor) — la imagen de referencia mostraba lo
    contrario (label chico, valor grande), pero se priorizó no revertir
    una decisión explícita más reciente del diseñador sin que lo pidiera
    de nuevo; si la quiere invertida, es un cambio de una línea.
  - **Píldora de motivo con color:** el `Badge variant="outline"` que
    mostraba `caso.resultado ?? caso.motivo` (al lado de la píldora de
    tipo de caso) se reemplazó por un `Tag` con tono calculado por
    `motivoTone(caso)` (`caso-helpers.ts`, nuevo): "Cambio de servicio" /
    "Derivación a otro servicio" → `info` (azul), "Posible baja" / "Dar de
    baja" → `danger` (rojo), "Posible mal vendido" → `warning`
    (anaranjado), cualquier otro valor (reembolso, modificación de
    contrato) → `gray`, sin distinción pedida ahí. `Tag`
    (`src/shared/components/base/Tag.tsx`) ganó el tono `info` que le
    faltaba (`border-info/20 bg-info/10 text-info`, mismo patrón que
    `success`/`warning`/`danger`, usando el token `--color-info` del tema
    que nunca se había consumido en un tono de `Tag`).
  - **Correo === ID Defensoría:** el correo del cliente en el encabezado
    de la tarjeta bajó de `type-supporting` (14px) a `type-meta` (12px),
    igualando el tamaño que ya tenía "ID Defensoría" en la misma fila.
  - **Pie de la tarjeta:** `CardFooter` ganó `bg-muted/50` (fondo suave,
    antes transparente/blanco). El `Separator` de arriba dejó de ir de
    borde a borde de la tarjeta — ahora vive dentro de un
    `<div className="px-(--card-inset)">`, así queda con el mismo margen
    lateral que el resto del contenido en vez de tocar las esquinas.
  `tsc`/`eslint`/`prettier` en verde; confirmado con `curl` al CSS
  servido que los tonos `info`/`brand-navy` nuevos compilan.
- 2026-08-29: Quinta pasada de diseño, con captura de pantalla de la
  tarjeta como referencia y correcciones sobre la pasada anterior:
  - **"Campo en recuadro" también en las modales** que muestran cobro
    anterior: `CobroAnteriorSummary` (`src/features/`) tenía su propio
    `Campo` local sin recuadro — ahora usa el mismo tratamiento que
    `CasoCard` (`rounded-md border border-border-subtle bg-background
    px-2.5 py-1.5`, mismos tamaños de label/valor). Afecta a
    `NuevoCobroDialog` y `ConfirmarReembolsoBajaDialog` (los dos diálogos
    activos que lo usan); también a `EditarCasoDialog`/
    `IniciarEvaluacionDialog`, que están sin cablear pero comparten el
    componente.
  - **Corrección de líneas divisorias** — el diseñador aclaró que era al
    revés de como había quedado: la línea de **arriba** (entre el
    encabezado y el desplegable) es la que debe llevar espaciado a los
    costados (antes era `border-t` en `CardContent`, de borde a borde;
    ahora es un `<Separator>` propio envuelto en
    `px-(--card-inset)`), y la línea de **abajo** (antes del pie) vuelve a
    ir de borde a borde (se sacó el wrapper con padding que se le había
    agregado en la pasada anterior).
  - **Grilla "Servicio/Abogado a cargo/Abogado vendedor/Servicio destino"
    centrada:** pasó de `grid` (que dejaba espacio muerto a la derecha
    cuando faltaba algún campo) a `flex flex-wrap justify-center gap-3`
    con cada campo envuelto en `w-full sm:w-56`, así los recuadros quedan
    centrados como grupo sea cual sea la cantidad de campos con valor
    ("Servicio destino" solo aparece si el caso lo tiene).
  - **Se invirtieron los colores entre el panel general y los
    desplegables internos:** el panel que envuelve todo el contenido
    desplegado de la tarjeta pasó de `bg-sidebar-hover` a
    `bg-brand-lavender/10` (el que antes tenían los acordeones
    individuales); los acordeones "Información post-venta" y "Detalle de
    la derivación"/"Acta de derivación" pasaron de
    `border-brand-lavender/25 bg-brand-lavender/10` a `border-border-subtle
    bg-sidebar-hover` (el que antes tenía el panel general). Resultado:
    el color más vívido (lavanda de marca) ahora está en el contenedor
    grande, y el más sutil (lavado `sidebar-hover`) en los acordeones
    anidados, para que no compitan visualmente con los recuadros blancos
    de cada campo.
  - **`EliminarCasoDialog`** ("Eliminar caso") ya no muestra
    `CobroAnteriorSummary` — se sacó esa información, la modal queda solo
    con la confirmación ("¿Está seguro de eliminar el caso?", vía la
    `description` de `AppDialog`) y el botón destructivo.
  `tsc`/`eslint`/`prettier` en verde.

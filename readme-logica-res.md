# Gestor de Casos ReS — Lógica de negocio

Documento de referencia con la lógica del Desk de Reevaluación de Servicio (ReS),
sin descripciones de pantallas ni estilos. Pensado para transferir el contexto de
negocio y reglas a cualquier entorno de desarrollo.

---

## 1. Qué es

Desk ReS es la herramienta **interna** con la que el equipo de Lexy gestiona la
**reevaluación de servicio** de un cliente en curso: decidir si un caso debe
_mantenerse en su servicio actual_, _derivarse a otro servicio interno_ (con o sin
nuevo cobro), o _darse de baja_ (con o sin reembolso).

Resuelve la coordinación entre varios actores (capitán de origen, capitán
receptor, encargada de reembolso, cliente) alrededor de un caso que cambia de
rumbo, asegurando que cada paso quede registrado con responsable y plazo.

## 2. Para quién es

100% **equipo interno / CRM**: abogados y capitanas de Lexy que trabajan en el
Desk ReS. El **cliente** existe como dato del caso (nombre, correo, teléfono) y
recibe correos automáticos en algunos eventos, pero **no interactúa con la app**.

## 3. Estado actual

- **Auth mock**: cualquier email/clave no vacío entra. No hay backend de auth real.
- **Datos en memoria**: `MOCK_CASOS = []` (vacío por defecto); `CASOS_EJEMPLO`
  son 10 casos de referencia. Sin persistencia ni backend todavía.
- **Sin integraciones reales**: el scrapeo de caja post-venta, la API de Apio
  (nuevo cobro) y los correos/Slack automáticos están modelados pero no implementados.

---

## 4. Modelo de datos (`src/data/mockCasos.ts`)

### `Caso`

| Grupo      | Campos                                                                                                                                                                      | Uso lógico                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Identidad  | `id`, `tipoCaso`, `estadoProceso`                                                                                                                                           | tab, filtros, badge               |
| Cliente    | `cliente.{nombre,correo,telefono,idDefensoria}`                                                                                                                             | dato del caso                     |
| Abogados   | `abogadoTramitador`, `abogadoVendedor`, `capitanOrigen`, `capitanReceptor`, `capitanACargo`                                                                                 | responsable de gestión            |
| Servicio   | `servicio`, `servicioDestino`, `etapaStreak`                                                                                                                                | derivación, filtros               |
| Motivo     | `motivo`, `motivoBaja`, `motivoReembolso`                                                                                                                                   | enrutamiento de flujo             |
| Post-venta | `cobroAnterior.{montoTotal, cuotas, montoPrimeraCuota, fechaInicio, cuotasPagadas, cuotasMorosas, pagoPrimeraCuota}`, `acreedor.{...}`                                      | info precargada del CRM de ventas |
| Reembolso  | `montoReembolso`, `cuotasReembolso`, `cuenta{Titular,Banco,Tipo,Numero}`, `reembolsoConfirmacionBaja`                                                                       | flujo de baja con reembolso       |
| Derivación | `actaDerivacion` (16 campos), `pasoDerivacion`, `evaluacionCliente`, `recepcionDerivacion`, `antecedentesDerivacion`, `nuevoCobro`, `requiereNuevoCobro`, `casosVinculados` | flujo de derivación               |
| Gestión    | `fechaGestion`, `notasEvaluacion`, `descripcionVentas`, `descripcion` (Detalle ReS)                                                                                         | formularios y plazos              |
| Cierre     | `resultado`, `detalleResolucion`, `notaCierre`, `cerrado`, `fechaRegistro`                                                                                                  | cierre de caso                    |

### Tipos y enumerados

- `tipoCaso`: `"reevaluacion" | "reembolso" | "acreedor" | "derivacion"`
- `estadoProceso`: `"por-evaluar" | "en-evaluacion" | "resuelto"`
- `pasoDerivacion`: `"cliente" | "recepcion" | "acta" | "cobro"`
- `evaluacionCliente.estado`: `"pendiente" | "aceptada" | "rechazada"`
- `recepcionDerivacion.estado`: `"pendiente" | "aceptada" | "rechazada"`
- `nuevoCobro.estado`: `"pendiente" | "no-aplica" | "definido" | "confirmado" | "esperando-cliente" | "aceptado-cliente"`
- `pendienteConfirmacion`: `"nuevo-cobro" | "reembolso-baja"` — caso ya resuelto pero sigue en "En evaluación" esperando confirmación.

### Sub-objetos

- **`ActaDerivacion`**: abogado vendedor, acreedores, monto deuda, situación
  tributaria, demandas, bienes, prendas, hipotecario, pensión alimentos,
  sociedades, resumen, compromisos, fechaPagoPrimeraCuota.
- **`NuevoCobro`**: estado, aplica, motivoNoAplica, valor, cuotas,
  observaciones, confirmadoPor, fechas.
- **`Documento`**: nombre, tipo (pdf/word/imagen), url.

### Catálogos

- `MOTIVOS_REEVALUACION`: "Posible mal vendido", "Cambio de servicio", "Posible baja".
- `MOTIVOS_BAJA`: "Baja voluntaria", "Baja por no pago", "Baja por no colaborar",
  "Baja por derivación no aceptada o no completada".
- `RESULTADOS_REEVALUACION`: "Se mantiene", "Derivación a otro servicio", "Dar de baja".
- `RESULTADOS_REEMBOLSO`: "Procede", "No procede".
- `RESULTADOS_ACREEDOR`: "Procede (nuevo cobro)", "No procede".
- `SERVICIOS`: "Renegociación", "Liquidación", "Litigios/PP".
- `SERVICIOS_DERIVACION`: "Renegociación", "Litigios", "Liquidación".
- `ETAPAS_POR_SERVICIO`: mapa servicio → lista de etapas.
- `CAPITANES`: Capi Ventas, Capi RN, Capi LV, Capi LT/PP, Encargada reembolso,
  Encargada nuevo cobro, Encargada transferencia.

---

## 5. Plazos sugeridos y capitanes (`src/utils/plazos.ts`)

`tipoGestionDeCaso(caso)` infiere el tipo de gestión desde el caso:

| `tipoCaso` + `motivo`                     | Tipo de gestión |
| ----------------------------------------- | --------------- |
| `reembolso`                               | `reembolso`     |
| `acreedor`                                | `acreedor`      |
| `derivacion`                              | `derivacion`    |
| `reevaluacion` + "Posible mal vendido"    | `mal-vendido`   |
| `reevaluacion` + "Cambio de servicio"     | `derivacion`    |
| `reevaluacion` + "Posible baja" / "Baja…" | `baja`          |

Luego:

- `fechaSugerida(tipo)` → suma **días hábiles** (excluye sábado/domingo) al
  extremo superior del rango, formato `YYYY-MM-DD`.
- `textoPlazoSugerido(tipo)` → `"Sugerido: N a M días hábiles para resolver"`.
- `capitanPredeterminado(tipo)` → primer candidato existente en `CAPITANES`.

### Mapa de plazos

| Tipo gestión | Días hábiles (min–max) |
| ------------ | ---------------------- |
| derivacion   | 5–7                    |
| baja         | 3–3                    |
| acreedor     | 3–5                    |
| mal-vendido  | 3–5                    |
| reembolso    | 2–5                    |

### Capitanes predeterminados

| Tipo gestión | Capitán               |
| ------------ | --------------------- |
| reembolso    | Encargada reembolso   |
| acreedor     | Encargada nuevo cobro |
| nuevo-cobro  | Capi Ventas           |

`useGestionDefaults(caso, open)` sincroniza capitán + fecha sugerida al abrir el
diálogo o cambiar de caso. Todos los diálogos de gestión lo usan.

---

## 6. Flujo de negocio — ReS (3 subflujos entrelazados)

Los subflujos **no son independientes**: se cruzan.

| Subflujo       | Qué resuelve                              | Cómo termina                                              |
| -------------- | ----------------------------------------- | --------------------------------------------------------- |
| 🟩 Derivación  | Cliente cambia de servicio dentro de Lexy | Cerrado en destino, o → Baja si rechaza                   |
| 🟥 Mal Vendido | El servicio contratado no calza           | Se descarta, se resuelve en origen, o → Derivación / Baja |
| ⬛ Baja        | Cliente sale de Lexy                      | Cierre con o sin reembolso (terminal)                     |

### Cruces entre subflujos

- Mal Vendido → Derivación (`camino_viable = derivacion`)
- Mal Vendido → Baja (`camino_viable = baja`)
- Derivación → Mal Vendido (capitán receptor rechaza recepción)
- Derivación → Baja (cliente rechaza la derivación)
- **Baja no dispara ningún otro subflujo** (punto final).

### 🟩 Derivación — eventos

1. `Derivacion.Caso.ReevaluacionDetectada_V1` — alta (etiqueta "Cambio de Servicio").
2. `Derivacion.Cliente.EvaluacionAceptada_V1` — cliente acepta evaluar.
3. `Derivacion.Cliente.DerivacionRechazada_V1` — cliente rechaza → **publica** `Baja.Caso.ReevaluacionDetectada_V1`.
4. `Derivacion.Caso.RecepcionAceptada_V1` — receptor acepta → espera acta.
5. `Derivacion.Caso.RecepcionRechazada_V1` — receptor rechaza → **publica** `MalVendido.Caso.ReevaluacionDetectada_V1`.
6. `Derivacion.Acta.Confirmada_V1` — origen confirma acta; router `nuevo_cobro`: false → 8 · true → 7.
7. `Derivacion.Cobro.Aceptado_V1` — cliente acepta cobro en Apio.
8. `Derivacion.Caso.Finalizada_V1` — caso "Resuelto" (cierre feliz).

> **Nota (2026-08-26, actualizada 2026-08-28):** el orden implementado en
> `AgregarCasoDialog` + `RecepcionDerivacionDialog` (ver "Revisión de
> derivación" más abajo) difiere de los eventos 4-6 de arriba: acá el
> **acta se completa al crear el caso** (el capitán que deriva la llena de
> una vez, dentro de "+ Nuevo caso" — no hay ningún paso ni pregunta
> posterior a la creación) y **después** el capitán receptor decide, viendo
> el acta completa, si acepta o rechaza recibir el caso — no al revés. Así
> lo pidió el diseñador explícitamente. Tampoco es cierto ya que "recepción
> rechazada reabre como Mal Vendido": desde el 2026-08-28 el rechazo del
> receptor **cierra el caso** con una de 3 categorías (Derivación a otro
> equipo / Dar de baja / Otro) + justificación, para que el capitán de
> origen retome el caso por fuera de la app. Recepción aceptada + nuevo cobro
> sigue igual, a `NuevoCobroDialog`.

### 🟥 Mal Vendido — eventos

1. `MalVendido.Caso.ReevaluacionDetectada_V1`
2. `MalVendido.Caso.CaminoDefinido_V1` — router por `camino_viable`:
   - `no_corresponde_mal_vendido` → cierre "Descartado"
   - `mantener_sin_cambios` → cierre "Mantenido sin cambios"
   - `modificacion_estrategia_en_origen` → cierre "Resuelto en origen"
   - `derivacion` → **publica** `Derivacion.Caso.ReevaluacionDetectada_V1`
   - `baja` → **publica** `Baja.Caso.ReevaluacionDetectada_V1`

> **Nota (2026-08-26):** lo implementado en `RevisionMalVendidoDialog` (ver
> "Revisión de mal vendido" más abajo, dentro de "Lógica de cada acción") es
> una versión **acotada** de este router, a pedido explícito del diseñador:
> captura sí/no corresponde + justificación + (si corresponde) un camino
> sugerido de solo lectura, y **cierra el caso ahí mismo** en ambos casos —a
> diferencia del router de arriba, no publica eventos hacia Derivación o
> Baja ni distingue "Descartado" / "Mantenido sin cambios" / "Resuelto en
> origen" como cierres separados. El camino sugerido es una nota para que el
> capitán que ingresó el caso actúe por fuera de este flujo; no hay un paso
> posterior dentro de la app. Este router de 5 caminos con auto-cierre y
> ramificación real queda como posible evolución futura, no como lo que hoy
> hace la app.

### ⬛ Baja — eventos

1. `Baja.Caso.ReevaluacionDetectada_V1` — router `posible_reembolso`: true → 2 · false → 6.
2. `Baja.Reembolso.EvaluacionSolicitada_V1`
3. `Baja.Reembolso.Evaluado_V1` — router `corresponde_reembolso`: false → 6 · true → 4.
4. `Baja.Reembolso.DepositoSolicitado_V1` — se aprueba monto + cuotas; espera depósito.
5. `Baja.Reembolso.DepositadoConfirmado_V1` — cierre con reembolso.
6. `Baja.SinReembolso.Confirmado_V1` — cierre sin reembolso.

### Reglas de transición de estado

Cada escritura del usuario corresponde a un evento y cambia el estado del caso:

- `estadoProceso` define tab y acciones disponibles.
- `pasoDerivacion` define qué acción sigue en la tarjeta de derivación.
- `evaluacionCliente.estado`: si `"rechazada"` → abre flujo de Baja.
- `recepcionDerivacion.estado`: si `"rechazada"` → abre Mal Vendido.
- `nuevoCobro.estado` avanza: `pendiente → definido → confirmado → esperando-cliente → aceptado-cliente`.
- `pendienteConfirmacion` deja el caso en "En evaluación" aunque esté resuelto,
  hasta que se confirme el nuevo cobro o el reembolso.

Si una acción falla, el caso debe quedar en su estado anterior (no parcial). Hoy
no hay manejo de error/rollback porque es mock.

---

## 7. Lógica de cada acción

### Crear caso (`AgregarCasoDialog`)

1. Captura datos del cliente, abogado, servicio.
2. Info de caja post-venta (`cobroAnterior`, `acreedor`) se ingresa manualmente
   (en producción vendría de un scraper del CRM de ventas).
3. `tipoGestionDeCaso(caso)` infiere el tipo → pre-carga capitán y fecha
   sugeridos vía `useGestionDefaults`.
4. El campo editable del operador se llama **"Detalle ReS"** (no confundir con
   la "Descripción desde caja ventas", que es precargada e inmutable).
5. Placeholder: "indica detalles relevantes del caso para su análisis o estudio".
6. El estado inicial no incluye un estado "Registrado" (se quitó para reducir ruido).
7. Reevaluación con motivo "Posible baja": se despliegan además **Origen**,
   **Motivo** y **Comentarios** — ver "Posible baja: origen y motivo
   capturados desde la creación" más abajo. Es la única excepción; el resto
   de motivos no agrega campos acá.

### Iniciar evaluación — paso retirado (2026-08-26)

Existió como paso intermedio (`IniciarEvaluacionDialog`, movía el caso a
`estadoProceso = "en-evaluacion"`, pre-cargaba capitán/fecha y permitía notas
de evaluación) pero **ya no se usa para ningún tipo de caso**: todos van
directo de "por evaluar" a "Resolver" desde que se crean (`accionPrincipal`
en `caso-helpers.ts` ya no tiene ninguna rama que devuelva "Iniciar
evaluación"). Decisión explícita del diseñador. El archivo del diálogo
(`src/features/dialogs/IniciarEvaluacionDialog.tsx`) no se borró —igual que
`EditarCasoDialog`— por si se quiere reactivar más adelante, pero se sacó su
cableado de `DeskResDesk.tsx` (import, tipo de diálogo y el componente en el
árbol).

1. Modificación de contrato tampoco pasa por `DecisionCierreDialog`: siempre
   procede, así que "Resolver" abre directo `NuevoCobroDialog` (sin preguntar
   "¿procede o no procede?"). Tampoco pasa ningún motivo de reevaluación:
   "Posible mal vendido" ("Revisión de mal vendido" más abajo) y "Posible
   baja" ("Revisión de posible baja" más abajo) tienen diálogo propio;
   "Cambio de servicio" ("Revisión de derivación" más abajo) va incluso más
   atrás, al Acta de derivación dentro de `AgregarCasoDialog` — para este
   motivo "Resolver" ya no abre ningún diálogo de revisión, solo
   `RecepcionDerivacionDialog` (aprobar/rechazar recepción).
   `DecisionCierreDialog` ya solo decide cierre de reembolso — sus ramas
   de reevaluación quedaron sin punto de entrada (ver la nota en "Decisión
   de cierre" más abajo).
2. Excepción dentro de modificación de contrato — motivo **"Agregar nuevo
   acreedor"**: "Resolver" abre `GenerarNuevoCobroDialog` en vez de
   `NuevoCobroDialog`. Confirma (editables) nombre del acreedor, monto nuevo
   contrato, **número de cuotas** y **valor primera cuota** (2026-08-28:
   antes era un único campo "Valor cuota"; el diseñador pidió separar
   cantidad de cuotas y valor de la primera — `Acreedor.valorCuota` pasó a
   `Acreedor.valorPrimeraCuota` y se agregó `Acreedor.cuotas`), y el botón
   "Generar nuevo cobro" simula la creación del cobro en Apio:
   `nuevoCobro.estado` pasa directo a
   `"esperando-cliente"`, el caso queda en `estadoProceso = "en-evaluacion"`
   (pestaña "En evaluación") y la tarjeta se queda **sin acción principal** —
   no hay paso de confirmación manual en la app. El paso a "Resuelto" lo hace
   Apio cuando el cliente acepta el cobro, fuera de este prototipo. El motivo
   "Otros" (2026-09-04, antes "Por derivación de servicio" — el diseñador
   pidió que las únicas opciones del selector sean "Agregar nuevo acreedor"
   u "Otros") no tiene esta excepción: sigue el flujo genérico de
   `NuevoCobroDialog`.

### Revisión de mal vendido (`RevisionMalVendidoDialog`)

Reevaluación con motivo "Posible mal vendido": "Resolver" abre este diálogo
dedicado en vez de `DecisionCierreDialog` — no pasa por sus 3 opciones
genéricas (versión acotada del router de 5 caminos de la sección
"🟥 Mal Vendido — eventos" más abajo, ver nota ahí). La capitana de ventas
responde:

- **¿Corresponde mal vendido?** "Sí corresponde" / "No corresponde", cada una
  con **justificación obligatoria** (por qué sí / por qué no).
- Si **sí corresponde**, además elige un **camino sugerido**
  (`CAMINOS_MAL_VENDIDO`: Mantener sin cambios / Modificar estrategia en
  origen / Derivar a otro servicio / Dar de baja) — es **solo una sugerencia
  informativa** para el capitán que ingresó el caso, no ejecuta nada por sí
  sola.
- Documentos adjuntos (opcional, mismo patrón que `AgregarCasoDialog`): botón
  con recuadro punteado + lista con opción de quitar. Se fusionan con los
  documentos que ya tuviera el caso.
- **En ambos casos (sí/no corresponde) el caso se cierra ahí mismo**
  (`estadoProceso = "resuelto"`) — no hay paso posterior dentro de la app. El
  capitán que ingresó el caso ve la justificación y (si corresponde) el
  camino sugerido en la tarjeta resuelta, y actúa por fuera de este flujo.
- Guardado: `malVendidoCorresponde`, `malVendidoJustificacion`,
  `malVendidoCaminoSugerido` (solo si corresponde), `documentos` en el caso.

### Posible baja: origen y motivo capturados desde la creación (2026-08-26)

Al crear el caso (`AgregarCasoDialog`), elegir motivo "Posible baja"
despliega tres campos, dos obligatorios:

- **Origen** (`ORIGENES_POSIBLE_BAJA`: Ventas / Cobranza / Cuotas impagas /
  Ops / Voluntaria) — qué área o canal detecta la posible baja.
- **Motivo** (`MOTIVOS_POSIBLE_BAJA`: 1°/2/3/4 cuota(s) impaga(s), No
  colaboración, Insatisfacción con el servicio, Problemas económicos, Mal
  vendido, Inviable, Venta arrepentida, Inubicable) — razón puntual de la
  posible baja.
- **Comentarios** (texto libre, opcional) — contexto adicional para la
  líder de operaciones.

Al confirmar la creación: guarda `origenPosibleBaja`, `motivoPosibleBaja`,
`comentariosPosibleBaja` y pone `capitanACargo = "Líder de operaciones"`
(nuevo capitán en `CAPITANES`) de una vez. Documentos adjuntos usa el mismo
campo (opcional) que ya tiene `AgregarCasoDialog` para cualquier tipo de
caso, no hay uno aparte. La tarjeta muestra una sección "Posible baja —
pendiente líder de operaciones" (con origen, motivo, capitán a cargo y los
comentarios si hay) mientras el caso no esté resuelto.

### Revisión de posible baja: dos turnos que se alternan (2026-08-26)

Reevaluación con motivo "Posible baja": "Resolver" **no** pasa por las 3
opciones genéricas de `DecisionCierreDialog` (Se mantiene / Derivación /
Dar de baja) — como el caso ya nació como una posible baja, el flujo es
propio y se alterna entre dos turnos hasta que la líder de operaciones lo
resuelve. `accionPrincipal` decide cuál según `caso.turnoPosibleBaja`:

- **Turno de la líder de operaciones** (`turnoPosibleBaja` sin definir, o
  `"lider-operaciones"`) — botón **"Resolver"**, abre
  `RevisionPosibleBajaDialog` con 3 opciones, cada una con **comentario
  obligatorio** cuya pregunta cambia según la opción:
  - **Se aprueba baja** ("¿Por qué se aprueba la baja?") — solo el
    comentario, sin volver a pedir motivo de baja (ya se capturó "Motivo"
    al crear el caso) ni preguntar por reembolso. Cierra el caso directo
    con `resultado = "Dar de baja"`.
  - **Se rechaza baja** ("¿Por qué no se da de baja al cliente?") — cierra
    el caso directo con `resultado = "Se mantiene"`.
  - **Falta información** ("¿Qué información falta por completar?") — **no
    cierra el caso**: guarda el pedido en `comentarioBaja`, limpia
    `respuestaBaja` (si había una de una vuelta anterior) y pasa el turno
    al capitán (`turnoPosibleBaja = "capitan"`).
- **Turno del capitán** (`turnoPosibleBaja = "capitan"`) — botón
  **"Completar información"** (no dice "Resolver": no es su turno de
  decidir), abre `CompletarInformacionBajaDialog`. Muestra de solo lectura
  lo que pidió la líder (`caso.comentarioBaja`) y pide una respuesta
  obligatoria. Al guardar: escribe `respuestaBaja`, devuelve el turno a la
  líder (`turnoPosibleBaja = "lider-operaciones"`) y el caso sigue en "En
  evaluación" — no se cierra.

Cuando el turno vuelve a la líder con una respuesta pendiente
(`caso.respuestaBaja` presente y `caso.resultado` todavía sin definir),
`RevisionPosibleBajaDialog` muestra arriba de todo un acordeón **"Solicitud
y respuesta"** (abierto por defecto, plegable — puede ser mucho texto):
**"Lo solicitado"** (`comentarioBaja`) y **"Respuesta"** (`respuestaBaja`),
antes de repetir la misma decisión de 3 opciones — puede volver a marcar
"Falta información" si la respuesta no alcanza, y el ciclo se repite.

`detalleResolucion` se guarda además del comentario cuando el caso se
cierra (Se aprueba / Se rechaza), para que se vea en "Resolución de
cierre" de la tarjeta. Ni el pedido de información ni la respuesta del
capitán se muestran en `CasoCard` mientras el caso sigue activo — viven
solo dentro de los diálogos, a pedido del diseñador.

- **Pendiente**: esto todavía es el flujo genérico de aprobar/rechazar
  baja con un solo vaivén de información, no lo que decida específicamente
  la líder de operaciones caso a caso — el diseñador aún no tiene esa
  definición. No construir un flujo más específico sin confirmarlo primero.
- (2026-08-26, iteraciones del mismo día antes de llegar a esto: "Tipo de
  baja" se agregó y se sacó del formulario de creación; "Resolver" pasó de
  abrir `DecisionCierreDialog` normal a abrir un diálogo dedicado de una
  vez; "Se aprueba" perdió el motivo de baja y la pregunta de reembolso;
  y recién al final se separó el turno de la líder del turno del capitán
  en dos diálogos distintos, con `turnoPosibleBaja` para saber a quién le
  toca.)

### Revisión de derivación (`AgregarCasoDialog` + `RecepcionDerivacionDialog`, 2026-08-26, simplificado 2026-08-28, movido a creación 2026-08-28)

Reevaluación con motivo "Cambio de servicio": ya no hay ningún paso de
revisión posterior a la creación — el caso nace directo con el Acta de
derivación completa, y "Resolver" es exclusivamente para que el capitán
del equipo receptor apruebe o rechace la recepción.

- **Al crear el caso** (`AgregarCasoDialog`), elegir motivo "Cambio de
  servicio" despliega de una vez el **Acta de derivación completa** (antes
  vivía en un diálogo aparte, `RevisionDerivacionDialog`, que abría
  "Resolver" después de crear el caso — el diseñador pidió unificarlo en un
  solo paso: "al momento de agregar el nuevo caso como derivación, tengan
  que rellenar el acta de derivación"). **Estrategia y Tácticas ya no son
  parte de esta lista**: se agregaron acá el 2026-08-28 como texto libre,
  pero el 2026-08-29 el diseñador pidió sacarlas del acta y que aparezcan
  como datos scrapeados **para todo tipo de caso**, no solo derivación —
  ahora viven en `Caso.estrategia`/`Caso.tacticas` (campos de nivel caso,
  no de `ActaDerivacion`) y se muestran/capturan arriba, junto con
  Servicio actual/Etapa/Abogados, antes de "Descripción del caso", en
  `AgregarCasoDialog` para **cualquier** tipo de caso (mismos placeholders
  deshabilitados `ESTRATEGIA_PLACEHOLDER`/`TACTICAS_PLACEHOLDER`, no
  editables — hoy no existe ese scraper, en producción vendría de ahí).
  En `CasoCard` se muestran dentro de "Información post-venta", junto a
  "Descripción del caso" (antes estaban dentro de "Acta de derivación").
  Campos del acta propiamente dicha, con el layout de la referencia visual
  que trajo el diseñador:
  - **Servicio destino** (`SERVICIOS_DERIVACION`, obligatorio) —
    Cliente/Correo/Servicio origen/Abogado vendedor ya se capturan una sola
    vez, arriba, en el paso compartido de todos los tipos de caso; no se
    repiten dentro del acta.
  - **Derivaciones realizadas** (2026-08-29, nuevo): radio "Ninguna" /
    "Ha sido derivado antes" (`huboDerivacionAnterior`, por defecto
    "Ninguna" — el diseñador pidió explícitamente ese default). Si se
    marca "Ha sido derivado antes", se piden **Servicio de la derivación
    anterior** (`SERVICIOS_DERIVACION`, obligatorio en ese caso) y
    **Motivo de la derivación anterior** (texto libre, obligatorio en ese
    caso) — de qué servicio venía y por qué se derivó esa vez. Reemplaza a
    "Qué se hizo por el cliente en el servicio de origen" (texto libre
    agregado el 2026-08-28), que el diseñador pidió sacar el 2026-08-29 sin
    reemplazo directo — no quedó ningún campo con ese propósito.
  - *Antecedentes*: Acreedores\* (texto libre), Monto total adeudado,
    Situación tributaria (texto libre — la referencia solo mostraba un
    placeholder "Segunda categoría...", no se inventó una lista cerrada de
    opciones sin confirmar la taxonomía completa con el diseñador), Demanda
    / Prenda / Hipotecario / Pensión de alimentos / Participación en
    sociedades (los 5 como checkbox — se guardan como `"Sí"` o vacío),
    Bienes, Otros datos importantes.
  - *Relato*: Resumen de lo sucedido\* (texto libre — también funciona como
    "motivo del cambio de servicio"), Compromisos y próximos pasos (texto
    libre, opcional) y Fecha acordada con el cliente para el pago de la 1°
    cuota (`DatePicker`, opcional).
  - **"Circunstancia del cambio de servicio"** (Voluntario / Negligencia de
    nuestra parte) se había agregado el 2026-08-28 y se sacó al día
    siguiente a pedido del diseñador — ya no existe en el modelo
    (`CircunstanciaCambioServicio`/`CIRCUNSTANCIAS_CAMBIO_SERVICIO` se
    borraron de `caso.ts`).
  - **Análisis modificación contrato** (checkbox, al final, renombrado
    2026-09-04 — antes "Requiere nuevo cobro"): lo decide el capitán que
    deriva al crear el caso, marcándolo **solo** cuando cree que el caso
    requiere modificación del contrato. Chico, debajo del checkbox, un
    texto aclara ese criterio. Campo del modelo:
    `requiereAnalisisModificacionContrato` (antes `requiereNuevoCobro`).
  - Al confirmar "Crear caso": el caso nace **directo en `estadoProceso =
    "en-evaluacion"` con `pasoDerivacion = "recepcion"`** (no pasa por "por
    evaluar" como el resto de los tipos de caso) — junto con
    `actaDerivacion` completo, `requiereNuevoCobro`, `nuevoCobro`
    (`{estado: "pendiente", aplica: true}` si requiere, `{estado:
    "no-aplica", aplica: false}` si no) y `resultado = "Derivación a otro
    servicio"`. El caso pasa directo al capitán receptor — no hay ninguna
    acción principal intermedia entre crear el caso y la recepción.
- **`RecepcionDerivacionDialog`** (ya existía, reescrito 2026-08-28) es
  ahora el **único** paso de "Resolver" para este motivo. **Es solo para
  la acción de aprobar o rechazar** — no muestra el acta (se probó
  mostrarla completa arriba de todo con `ActaDerivacionSummary`, pero el
  diseñador pidió sacarla de la modal: el acta completa se ve en el
  desplegable de `CasoCard`, la modal no debe repetirla). El capitán
  receptor abre el caso, revisa el acta en la tarjeta, y usa "Resolver"
  solo para registrar la decisión.
  - **Acepta** → si el acta marcó "Análisis modificación contrato", sigue a
    `AnalisisModificacionContratoDialog` (`pasoDerivacion = "cobro"`); si
    no, cierra directo como `"Derivación a otro servicio"`. (2026-08-28: se
    sacó el selector "Capitán receptor" — el diseñador pidió quitarlo.
    `capitanACargo` ya no cambia al aceptar; el campo `capitanReceptor` se
    sacó del todo del modelo, junto con el chip "Receptor {capitán}" que
    mostraba `CasoCard` —ese chip nunca llegó a verse en la práctica,
    porque solo se activaba con `tipoCaso === "derivacion"`, un valor que
    nunca se asigna—.)
  - > **Nota (2026-09-04):** se agregó un paso intermedio entre la
    > recepción y `NuevoCobroDialog`. Antes, aceptar con "Requiere nuevo
    > cobro" marcado saltaba directo a definir el cobro; ahora
    > `AnalisisModificacionContratoDialog` (`src/features/dialogs/`) es el
    > único paso de "Resolver" cuando `pasoDerivacion === "cobro"`: la
    > capitana decide primero si **procede o no** la modificación de
    > contrato (`modificacionContratoProcede: "si" | "no"`).
    > - **Procede** → el mismo diálogo muestra el contexto de la
    >   derivación (`ContextoDerivacionSummary` + `CobroAnteriorSummary`,
    >   igual que antes en `NuevoCobroDialog`) y pide Valor contrato +
    >   Cuotas; al confirmar, `nuevoCobro.estado` salta directo a
    >   `"esperando-cliente"` (mismo criterio que el resto de los flujos de
    >   nuevo cobro) y el caso sigue "En evaluación".
    > - **No procede** → solo pide una justificación obligatoria
    >   (`modificacionContratoJustificacion`); el caso se cierra igual como
    >   `"Derivación a otro servicio"` (sin nuevo cobro) — la derivación en
    >   sí no se revierte, solo queda sin modificación de contrato.
    > `NuevoCobroDialog` deja de ser parte del flujo de derivación: hoy
    > solo lo usa el tipo de caso "Modificación de contrato" (motivo
    > "Otros", ver más abajo). El escrito `requiereNuevoCobro: true` que
    > tenía al confirmar se sacó por no tener ya ningún lector.
  - **Rechaza** (reescrito 2026-08-28): ya no hay un motivo de rechazo libre
    que reabre el caso como Mal Vendido automáticamente. El caso se cierra
    con una **justificación obligatoria** (`rechazoRecepcionJustificacion`)
    y, aparte, **"Indicar opción"** (`rechazoRecepcionMotivo`: "Derivación
    a otro equipo" / "Dar de baja" / "Otro", `MOTIVOS_RECHAZO_RECEPCION`).
    2026-08-28, corregido el mismo día: el diseñador aclaró que esta
    opción **no es una decisión definitiva, es solo una sugerencia** de
    cómo seguir con el caso — se cambió de tarjetas seleccionables a un
    `Select` simple (mismo patrón que "Camino sugerido" de
    `RevisionMalVendidoDialog`, con la misma leyenda aclaratoria abajo), y
    ya **no determina `resultado`** (antes "Dar de baja" seteaba `resultado
    = "Dar de baja"`; ahora `resultado` siempre queda sin definir al
    rechazar). El caso se cierra igual en los 3 casos
    (`estadoProceso = "resuelto"`); la justificación y la opción sugerida
    quedan en la tarjeta resuelta para que el capitán de origen decida y
    ejecute el camino real por fuera de la app.
- **`NuevoCobroDialog`** (2026-08-28): cuando el caso viene de una
  derivación con nuevo cobro requerido (`caso.actaDerivacion` presente),
  muestra un bloque de contexto nuevo, `ContextoDerivacionSummary`
  (`src/features/`, mismo patrón que `CobroAnteriorSummary`, que sigue
  mostrándose arriba con cuánto se cobró y cuánto se ha pagado del cobro
  activo), para que quien genera el cobro tenga todo a la vista al
  crearlo: motivo del cambio de servicio (resumen), derivaciones
  realizadas antes (servicio y motivo de la derivación anterior, cuando
  aplica — 2026-08-29), monto deuda a contratar, acreedor, fecha pago
  primera cuota, y `Caso.estrategia`/`Caso.tacticas` (campos de nivel caso,
  no del acta — precargados por scrapeo desde que se crea el caso, ver
  "Revisión de derivación" arriba) — y **cuántas veces ya fue derivado
  este cliente dentro de este Desk** ("Primera derivación" o "Derivación
  N.º X"), calculado contando cuántos casos existentes del mismo correo
  tienen `actaDerivacion`, no un campo que se tipee a mano (distinto de
  "Derivaciones realizadas" del acta, que es lo que el capitán declara que
  pasó *antes* de que este Desk existiera o registrara el caso).
  2026-08-29: "Fecha pago primera cuota" ya no se oculta cuando el acta la
  dejó vacía (era opcional) — siempre aparece, con "—" si no se definió.
  2026-08-29 (mismo día, corregido): el diseñador pidió sacar el bloque
  "Descripción del caso (post-venta)" que se había agregado un rato antes
  —no era lo que quería— y en su lugar mostrar la **data real de "Cobro
  anterior"** (`CobroAnteriorSummary`, ya estaba en el diálogo pero
  siempre salía vacía: `caso.cobroAnterior` nunca se guardaba en ningún
  lado, era solo un mockup visual en `AgregarCasoDialog`). Se corrigió de
  raíz: `AgregarCasoDialog` ahora guarda `cobroAnterior` con datos de
  prueba realistas (`COBRO_ANTERIOR_PRUEBA` en `datosPrueba.ts`) para
  **todos** los tipos de caso, igual que `descripcionVentas`; el acordeón
  "Cobro anterior (post-venta)" de esa misma pantalla pasó de mostrar
  placeholders entre corchetes a mostrar esos mismos valores de prueba
  formateados, para que lo que se ve al crear el caso coincida con lo que
  después aparece en `CasoCard`/`NuevoCobroDialog`.
  **Corregido horas después, mismo día:** el diseñador pidió que
  `RecepcionDerivacionDialog` (aceptar/rechazar recepción) **no** muestre
  el cobro anterior de post-venta — esa modal es solo para la acción de
  aprobar/rechazar, así que se sacó `CobroAnteriorSummary` de ahí (queda
  solo visible en `CasoCard`). En cambio, en `NuevoCobroDialog` el cobro
  anterior pasó a mostrarse en un **desplegable** (acordeón, igual al
  patrón "Cobro anterior (post-venta)" de `AgregarCasoDialog`) en vez de
  un recuadro fijo — `CobroAnteriorSummary` ganó un prop `hideTitle` para
  poder embeberse dentro del acordeón sin duplicar el título.
  Y se simplificó del todo el selector **"Estado"** que se había sacado de
  la vista horas antes manteniendo el avance automático interno: ahora
  `NuevoCobroDialog` ya no recorre ningún estado intermedio — define
  Valor/Cuotas una sola vez y al confirmar salta directo a
  `nuevoCobro.estado = "esperando-cliente"` (mismo criterio que "Agregar
  nuevo acreedor", `GenerarNuevoCobroDialog`), dejando el caso "En
  evaluación" sin ninguna acción principal hasta que Apio confirme que el
  cliente aceptó (`accionPrincipal` devuelve `null` mientras
  `nuevoCobro.estado === "esperando-cliente"`, chequeo que antes solo
  aplicaba a "Agregar nuevo acreedor" y ahora es general). Se sacó el
  campo "Confirmado por" (pertenecía al paso "confirmado", que ya no
  existe en la práctica) y todo el estado local de
  `ESTADOS_ORDENADOS`/`siguienteEstado` se borró del componente — el tipo
  `EstadoNuevoCobro` conserva `"definido"`/`"confirmado"` por si hace
  falta reactivarlos, pero ya ningún flujo los usa.

**Nota importante — código que quedó sin usar:** con "Posible mal vendido",
"Posible baja" y "Cambio de servicio" con diálogo propio, **ningún motivo
de reevaluación llega ya a `DecisionCierreDialog`** — los 3 son
exhaustivos. Las ramas "Se mantiene" / "Derivación a otro servicio" / "Dar
de baja" de ese diálogo (y su sub-flujo "¿Se aprueba la baja?" de 3
opciones) quedaron sin ningún punto de entrada real; `DecisionCierreDialog`
hoy solo se usa para reembolso (`esProcedeReembolso` y "No procede"). No se
borró ese código todavía —es un cambio grande y no era lo que se pidió esta
vez— pero es candidato claro a limpieza en una próxima pasada.

**Nota (2026-08-28) — `RevisionDerivacionDialog` quedó sin punto de
entrada:** al mover el Acta de derivación a `AgregarCasoDialog` (ver
arriba), el diálogo `RevisionDerivacionDialog` —que antes abría "Resolver"
para completar el acta después de crear el caso— ya no tiene ningún botón
que lo abra; se sacó su cableado de `DeskResDesk.tsx` (import, tipo de
diálogo `"revisar-derivacion"`, componente en el árbol) y el kind
`"revisar-derivacion"` de `AccionPrincipal`. El archivo
(`src/features/dialogs/RevisionDerivacionDialog.tsx`) no se borró, mismo
criterio que `IniciarEvaluacionDialog`/`EditarCasoDialog` — pero a
diferencia de esos dos, acá el contenido completo ya se duplicó dentro de
`AgregarCasoDialog`, así que no es un buen candidato para reactivar más
adelante: es más bien un archivo obsoleto listo para borrar si el
diseñador lo pide en una próxima pasada.

### Decisión de cierre (`DecisionCierreDialog`) — hoy, solo reembolso

Decide el cierre de reembolso ("Procede sin baja" / "Procede con baja" /
"No procede"). Las ramas de reevaluación (Se mantiene / Derivación a otro
servicio / Dar de baja) siguen en el código pero ya no son alcanzables
desde ningún botón de la app — ver la nota arriba. Según el resultado
elegido, se despliega el formulario correspondiente. El bloque "Gestión"
(Capitán + Fecha) aparece **dentro** de cada opción de resolución y se
pre-carga con `useGestionDefaults`.

- **Se mantiene** _(sin punto de entrada)_ → cierre simple.
- **Derivación a otro servicio** _(sin punto de entrada; reemplazado por
  `RevisionDerivacionDialog`, ver arriba)_ → servicio tentativo +
  aceptación del cliente ("Acepta" / "No acepta") + confirmación de
  recepción. No hay paso de confirmación intermedio: al elegir derivación
  se muestra todo inline.
  - Si el cliente acepta → caso avanza a `pasoDerivacion = "recepcion"`.
  - Si el cliente rechaza → abre flujo de Baja.
- **Dar de baja** _(sin punto de entrada para reevaluación; "Posible baja"
  usa `RevisionPosibleBajaDialog` con esta misma decisión de 3 opciones
  desde la creación, ver arriba)_ → primero pregunta **¿Se aprueba la
  baja?** (Se aprueba /
  Se rechaza / Falta información — mismo patrón de 3 tarjetas que
  `RevisionPosibleBajaDialog` usa como diálogo completo, ver arriba), con
  **comentario obligatorio** en las tres (guardado en `comentarioBaja`).
  - **Se aprueba** → sigue con motivo de baja (`MOTIVOS_BAJA`) + ¿reembolso?
    - Con reembolso → pide monto aprobado + cuotas reembolsadas + datos de
      depósito (titular, banco, tipo cuenta, número) + comprobante de
      transferencia.
    - Sin reembolso → cierre directo.
  - **Se rechaza** → cierra directo con `resultado = "Se mantiene"`.
  - **Falta información** → no cierra el caso, sigue en "En evaluación" con
    "Resolver" disponible; la tarjeta muestra el comentario en una sección
    "Falta información para decidir la baja".
- **Reembolso** → monto aprobado + cuotas reembolsadas + comprobante + capitán
  (Encargada reembolso por defecto).

### Recepción de derivación (`RecepcionDerivacionDialog`)

El capitán receptor acepta o rechaza recibir el caso.

- Acepta → espera acta → `Derivacion.Caso.RecepcionAceptada_V1`.
- Rechaza → abre Mal Vendido → `Derivacion.Caso.RecepcionRechazada_V1`.

### Nuevo cobro (`NuevoCobroDialog`)

Si la derivación requiere cobro:

1. Se define monto y cuotas (en producción: se crea en **Apio** vía API).
2. `nuevoCobro.estado` avanza: `pendiente → definido → confirmado → esperando-cliente → aceptado-cliente`.
3. Recién en `aceptado-cliente` el caso se resuelve definitivamente.

> **Nota (2026-08-29):** lo implementado ya no recorre los 5 estados uno por
> uno dentro de la app — el diseñador pidió sacar el selector de "Estado" y
> simplificar. `NuevoCobroDialog` ahora define Valor/Cuotas una sola vez y al
> confirmar salta directo a `nuevoCobro.estado = "esperando-cliente"`
> (mismo criterio que "Agregar nuevo acreedor",
> `GenerarNuevoCobroDialog`) — el caso queda "En evaluación" sin ninguna
> acción principal (`accionPrincipal` devuelve `null` mientras
> `nuevoCobro.estado === "esperando-cliente"`). El paso a `aceptado-cliente`
> y a "Resuelto" lo hace Apio, no esta app — no hay simulación de esa
> aceptación dentro del prototipo. El enum `EstadoNuevoCobro` conserva
> `"definido"`/`"confirmado"` en el tipo por si hace falta reactivarlos,
> pero hoy ningún flujo los usa.

### Confirmar reembolso / baja (`ConfirmarReembolsoBajaDialog` + `IngresarDatosDepositoDialog`)

Cierran el flujo de reembolso:

1. Se aprueba monto + cuotas a reembolsar.
2. Se registran datos de depósito y comprobante de transferencia.
3. `reembolsoConfirmacionBaja.estado` → `"confirmado"`.
4. Caso pasa a `"resuelto"`.

---

## 8. Relaciones entre casos

- Un caso puede **rebotar entre los 3 subflujos** (Derivación ↔ Mal Vendido ↔
  Baja), pero siempre termina en cierre de Derivación (feliz) o de Baja
  (con/sin reembolso).
- `casosVinculados` relaciona el caso ReS con el caso origen/destino en el CRM
  principal. Cada vínculo tiene `{ id, tipo, label }`.

---

## 9. Datos mock y escenarios

`CASOS_EJEMPLO` (10 casos) cubre:

| ID  | Tipo         | Escenario                                                  |
| --- | ------------ | ---------------------------------------------------------- |
| 1   | reevaluación | Mal vendido, en evaluación                                 |
| 1b  | reevaluación | Cambio de servicio, por evaluar                            |
| 2   | reevaluación | Cambio de servicio (Liquidación), en evaluación            |
| 3   | reembolso    | "En discusión", por evaluar                                |
| 4   | reembolso    | $350.000, en evaluación                                    |
| 5   | acreedor     | Nuevo cobro pendiente                                      |
| 6   | reevaluación | Resuelto por derivación                                    |
| 7   | derivación   | Luis Gerardo → Renegociación (caso de referencia completo) |
| 8   | reevaluación | Posible baja (voluntaria)                                  |
| 9   | reembolso    | Daniela San Martín, $150.000, datos de cuenta              |

### Casos límite a representar

- Cliente que rechaza la derivación → abre Baja.
- Receptor que rechaza → abre Mal Vendido.
- Derivación con nuevo cobro vs. sin cobro.
- Reembolso con baja vs. reembolso sin baja.
- Baja sin reembolso.
- Caso ya resuelto pero `pendienteConfirmacion` (sigue en "En evaluación").

### Datos chilenos

- Moneda CLP (`$350.000`, `$150.000`) vía `formatMonto` / `normalizarMonto`.
- Bancos chilenos (`BancoEstado`), `Cuenta RUT`.
- Fechas en español chileno (`"30 jun 2026"`, `"8 de octubre de 2025"`).
- Plazos en días hábiles (excluye fines de semana).

### Campos sensibles (aunque sean sintéticos)

- `cliente.correo`, `cliente.telefono` (datos personales).
- `cuentaNumero`, `cuentaTitular` (datos bancarios).
- `motivoReembolso` / `descripcion` (contexto legal delicado).

---

## 10. Supuestos que TI debe validar

- **Auth real**: hoy es mock. Falta definir proveedor y roles (capitán origen vs
  receptor vs encargada de reembolso).
- **Scrapeo de caja post-venta**: los datos `cobroAnterior` y `acreedor` hoy se
  ingresan manualmente; en producción vendrían de un scraper del CRM de ventas.
- **API de Apio**: el "nuevo cobro" hoy es mock; debe crearse vía API de Apio y
  esperar aceptación del cliente ahí.
- **Correos y Slack**: cada evento del diseño dispara correos/Slack automáticos;
  hoy no existen. Son tareas derivadas del evento, no acciones manuales del Desk.
- **Persistencia**: todo está en memoria (`MOCK_CASOS`). Falta backend (tabla
  `casos` con RLS).

---

## 11. Reglas del proyecto (no romper)

- **No** instalar `react-router-dom`, `BrowserRouter`, ni crear `src/App.tsx`,
  `src/pages`, o layouts tipo Next/Remix. El router es TanStack Router fijo.
- **No** endurecer el tsconfig (se relajó a propósito para matchear el repo fuente).
- **No** reintroducir "Encargada de depósito" en la lista de capitanes (se quitó).
- **No** duplicar la "Descripción desde caja ventas": esa info viene precargada;
  el campo editable del operador se llama **"Detalle ReS"**.
- **No** rellenar `descripcion` con texto automático: placeholder
  "indica detalles relevantes del caso para su análisis o estudio".
- El estado de caso inicial no incluye un estado "Registrado": se quitó para
  reducir ruido.

---

## 12. Estructura de la interfaz (sin estilos)

### Entry point (`src/routes/index.tsx`)

- Estado booleano `autenticado`.
- Si no autenticado → `<Login />`.
- Si autenticado → `<App />`.

### Login (`src/views/Login.tsx`)

- Pantalla centrada con tarjeta.
- Campos: correo + contraseña (lectura vía `FormData` para soportar autocompletado).
- Validación: ambos campos no vacíos → `onLogin()`.
- No hay backend de auth (mock).

### App principal (`src/views/App.tsx`)

Layout vertical:

1. **HeaderBar** (sticky) — isotipo + "Desk ReS". Sin acciones a la derecha.
2. **Botón flotante de filtros** (izquierda, fuera del sidebar) — icono Filter.
   Muestra contador de filtros activos cuando el sidebar está cerrado.
3. **Sidebar flotante de filtros** (180px, izquierda, oculto por defecto) — se
   abre/cierra con el botón flotante. Contiene:
   - Input de búsqueda (correo o nombre del cliente).
   - Filtro por Servicio (Todos / RN / LV / LT-PP).
   - Filtro por Tipo (Todos / Reevaluación / Reembolso / Acreedor / Derivación).
   - Botón "Limpiar" cuando hay filtros activos.
4. **Main** (centrado, max 1060px):
   - **Fila de cabecera**: tabs a la izquierda/centro + botón "+ Nuevo caso" a
     la derecha.
   - **Tabs** (`SlidingTabsList`): "En evaluación" y "Resueltos", con contador
     de casos cada uno. Texto de ayuda debajo del tab activo.
   - **Lista de tarjetas** (`CasoCard`) — una por caso, animación de entrada
     escalonada. Estado vacío con mensaje y CTA cuando no hay casos.

### Tarjeta de caso (`src/components/CasoCard.tsx`)

Estructura de cada tarjeta:

- **Header (siempre visible)**:
  - Chevron (izquierda) para expandir/colapsar.
  - Nombre del cliente + chip de tipo (Reevaluación / Reembolso / Acreedor /
    Derivación) + chip "Resuelto" si corresponde.
  - Correo del cliente.
  - Bloque agrupado: capitán a cargo · plazo de gestión · (capitán receptor si
    es derivación).
  - Chip de motivo/resultado (derecha).
- **Body (colapsable)** — se despliega al clickear el header:
  - Fila de metadatos horizontal: Servicio | Abogado a cargo | Servicio destino.
  - Metadatos secundarios (si hay receptor): Capitán receptor | Abogado receptor.
  - **Detalle ReS** — caja con la descripción editable del operador.
  - **Información caja post-venta** (desplegable) — descripción de ventas +
    grid de métricas del cobro anterior (monto total, cuotas, primera cuota,
    inicio, cuotas pagadas, cuotas morosas, monto alcanzado, transacciones).
  - **Detalle de la derivación** (desplegable, solo derivación sin acta) —
    servicio tentativo, solicitado por, justificación.
  - **Acta de derivación** (desplegable, solo derivación con acta) — grid de
    10 campos (acreedores, deuda, tributaria, bienes, demandas, prendas,
    hipotecario, pensión, sociedades) + resumen + compromisos + otros datos.
  - **Notas de evaluación** (si existen).
  - **Datos de reembolso** (solo reembolso) — grid con monto, cuotas, ingreso
    a estudio, titular, banco, tipo cuenta, número cuenta.
  - **Gestiones realizadas** (si existen).
  - **Acreedor** (si existe) — nombre, monto contrato actual, diferencia.
  - **Documentos adjuntos** — lista de archivos con tipo y link.
  - **Nuevo cobro** (si está definido/confirmado) — estado + valor + cuotas +
    confirmado por.
  - **Transferencia pendiente** (reembolso-baja) — monto, cuotas, datos cuenta.
  - **Resolución de cierre** (resuelto) — resumen con resultado, monto,
    motivo, comprobante según corresponda.
  - **Footer** — botón de acción principal ("Resolver" / "Definir cobro" /
    "Confirmar depósito") o icono de eliminar (resuelto). El botón cambia
    según el estado y subflujo del caso.

### Diálogos (modales)

Cada diálogo es un `AppDialog` controlado por estado en `App.tsx`:

| Componente                     | Cuándo abre                                | Qué captura                                                                                                                |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `AgregarCasoDialog`            | Botón "+ Nuevo caso"                       | Datos del cliente, abogados, servicio, info caja post-venta, Detalle ReS, capitán + fecha sugeridos                        |
| `IniciarEvaluacionDialog`      | Botón en tarjeta (por-evaluar)             | Notas de evaluación, capitán + fecha sugeridos                                                                             |
| `DecisionCierreDialog`         | Botón "Resolver"                           | Resultado de cierre + formulario condicional (derivación/baja/reembolso) + gestión (capitán + fecha) dentro de cada opción |
| `RecepcionDerivacionDialog`    | Botón "Resolver" (derivación en recepción) | Aceptar/rechazar recepción + capitán receptor + motivo rechazo + camino alternativo                                        |
| `NuevoCobroDialog`             | Botón "Definir nuevo cobro"                | Estado del cobro, valor, cuotas, confirmado por                                                                            |
| `ConfirmarReembolsoBajaDialog` | Botón "Confirmar depósito"                 | Monto, cuotas reembolsadas, comprobante de transferencia                                                                   |
| `EditarCasoDialog`             | Acción editar                              | Estado, tipo, Detalle ReS, resumen interno, datos Streak                                                                   |
| `Dialog de eliminar`           | Icono basura (resuelto)                    | Confirmación de eliminación                                                                                                |

### Componentes base (`src/components/base/`)

- `AppDialog` — wrapper de diálogo con título, descripción, botones confirmar/
  cancelar y contenido.
- `HeaderBar` — barra superior con marca.
- `Logo` — isotipo/wordmark.
- Componentes de formulario: `Input`, `Textarea`, `Label`, `Select`, `Button`.
- `Card`, `Badge`, `Tag`, `Spinner`, `Toaster` (sonner), `Empty`.

### Hooks compartidos

- `useGestionDefaults(caso, open)` — pre-carga capitán y fecha sugeridos al
  abrir cualquier diálogo de gestión.
- `use-mobile` — detección de viewport.

### Utilidades

- `src/utils/plazos.ts` — lógica de días hábiles, plazos por tipo de gestión y
  capitán predeterminado.
- `src/utils/format.ts` — formato de montos CLP.

---

## 13. Referencias

- **Mapa de flujo ReS**: `mem://features/flujo-res.md` (los 3 subflujos, eventos
  numerados y cruces).
- **Derivación — eventos**: `mem://features/derivacion-eventos.md` (payload
  analítico de cada evento de Derivación).
- **Repo origen**: `github.com/cat-cat-lovable/reevaluacioncasos` ("gestor-casos"),
  React/Vite SPA portado a TanStack Start.

---

_Documento de lógica de negocio para transferir el contexto a VS Code u otro asistente._

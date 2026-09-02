# Button

Botón de acción. Renderiza un `<button>` nativo; acepta todos sus atributos (`onClick`, `type`, `disabled`, `aria-*`).

## Cuándo usarlo

Para ejecutar una acción: guardar, enviar, confirmar. La variante dice la jerarquía — una sola acción primaria por vista, el resto baja a `secondary`, `outline` o `ghost`. Si el click lleva a otra página, es un enlace con apariencia de botón (`asChild`), no un `<button>`.

## Composición

Una sola pieza (`Button`) con variantes de intención y tamaños; `size="icon"` para una acción solo-icono (siempre con `aria-label`). Con `asChild` viste de botón a un enlace real; `buttonVariants` exporta las clases para casos sin envoltura.

## Geometría de acción

- Todas las variantes y tamaños usan el mismo radio de 6 px. La jerarquía se comunica con color, borde y contenido, no cambiando la silueta.
- `--radius-button` hereda de `--radius-interactive`, la misma base de campos, navegación y opciones de menú. `--radius-button-lg` apunta al mismo valor.
- `icon` conserva la misma geometría que el resto de los botones.
- El glifo usa `--icon-size-inline` (16 px); el área del control se define por `--control-height`, no por el tamaño visual del icono.
- La presión reduce brevemente el control a `97%`; el cambio confirma el gesto sin producir una animación ceremonial.
- El índigo sigue perteneciendo a Lexy. La referencia a Notion está en la contención, la jerarquía y la respuesta, no en copiar su color.
- La altura canónica es compacta: `32px` en `sm`, `36px` en `default` y `40px` en `lg`.

## Loading

Cuando la operación comienza, el botón conserva su posición y geometría, bloquea nuevas activaciones y muestra el progreso dentro del propio control. El resultado puede reemplazarlo cuando ya sea suficiente para explicar lo ocurrido.

```tsx
<Button loading={isSaving} loadingLabel="Guardando…">
  Guardar cambios
</Button>
```

No reemplaces inmediatamente el botón por un spinner separado: eso rompe la continuidad espacial entre intención y respuesta. `loading` no se aplica cuando `asChild` está activo, porque el hijo conserva su propia composición.

## Uso básico

```tsx
<Button onClick={save}>Guardar cambios</Button>
```

## Variantes

```tsx
<Button variant="default">Guardar</Button>          {/* acción primaria */}
<Button variant="secondary">Cancelar</Button>       {/* secundaria */}
<Button variant="outline">Filtrar</Button>          {/* secundaria, menos peso */}
<Button variant="ghost">Ver más</Button>            {/* terciaria, sin fondo */}
<Button variant="link">Olvidé mi contraseña</Button> {/* navegación inline */}
<Button variant="destructive">Eliminar</Button>     {/* borrar o revertir */}
```

## Tamaños

```tsx
<Button size="sm">Compacto</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grande</Button>
<Button size="icon" aria-label="Buscar"><Search /></Button> {/* solo icono */}
```

## asChild — navegación con apariencia de botón

```tsx
<Button asChild variant="outline">
  <Link to="/cuenta">Ir a mi cuenta</Link>
</Button>
```

Con `asChild` el hijo se vuelve el elemento raíz (patrón Slot de Radix): el botón aporta estilos y props, el hijo aporta la semántica (`<a>`, `Link`). Es la vía preferida para enlaces con apariencia de botón; `buttonVariants` queda para casos donde no puedas envolver.

## Reglas

- **Una sola** acción primaria (`default`) por vista o sección: si todo es primario, nada lo es.
- Usa `destructive` solo para acciones que borran o revierten; combínalo con confirmación (`AppDialog`).
- `size="icon"` **requiere** `aria-label`: sin texto visible, es la única etiqueta accesible.
- `variant="link"` es para navegación inline dentro de texto, no para la acción principal de un formulario.
- No juntes muchas acciones de alto peso; baja a `ghost`/`link` las de menor prioridad.

## Cuándo NO usar

- **Navegación entre páginas/rutas** → usa `asChild` con un `<a>`/`Link` real. Un `<button>` no es un enlace.
- **Activar/desactivar un estado** → `Switch` (ajustes) o `Checkbox` (selección en formulario).
- **Elegir entre opciones** → `RadioGroup`, `Select` o `Tabs`, no varios botones.

## Import

```tsx
import { Button } from "@/shared/components/base/Button";
```

## Props

| Prop           | Tipo                                                                          | Default        | Descripción                                                      |
| -------------- | ----------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `variant`      | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"`    | Jerarquía/intención visual.                                      |
| `size`         | `"default" \| "sm" \| "lg" \| "icon"`                                         | `"default"`    | Tamaño. `icon` para una acción solo-icono.                       |
| `asChild`      | `boolean`                                                                     | `false`        | Renderiza el hijo como elemento raíz (Slot).                     |
| `loading`      | `boolean`                                                                     | `false`        | Bloquea nuevas activaciones y muestra progreso dentro del botón. |
| `loadingLabel` | `ReactNode`                                                                   | texto original | Etiqueta que aparece durante `loading`.                          |
| `disabled`     | `boolean`                                                                     | `false`        | Deshabilita e ignora clics.                                      |
| ...resto       | `ButtonHTMLAttributes`                                                        | —              | `onClick`, `type`, `form`, `aria-*`, etc.                        |

`buttonVariants` se exporta: úsalo para dar estilo de botón a un `<a>` real cuando no puedas usar `asChild` — `<a className={buttonVariants({ variant: "outline" })}>`.

## Para IA

1. Define la jerarquía: ¿esta acción es la principal de la vista, una alternativa o algo terciario?
2. Asigna la variante por intención, no por color: primaria=`default`, secundaria=`secondary`/`outline`, terciaria=`ghost`, navegación inline=`link`, irreversible=`destructive`.
3. Mantén una sola acción primaria visible por sección.
4. Si es solo-icono, agrega `aria-label` con el verbo de la acción.
5. Si la acción navega a otra ruta, usa `asChild` con un enlace real en vez de un `<button>`.
6. Para acciones destructivas, envuélvelas en `AppDialog` con la consecuencia explícita.

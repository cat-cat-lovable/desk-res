# Tag

Etiqueta de categoría. Para clasificación.

## Cuándo usarlo

Para clasificar: materia, categoría, etiqueta de un caso. Es taxonomía — si lo que comunicas es un estado del sistema (activo, pendiente), eso es un `Badge`.

## Composición

Una sola pieza (`Tag`) con variantes de color. Convive en filas de tabla y headers de detalle junto a `Badge` y `StatusDot`, cada uno con su papel.

## Uso básico

```tsx
<Tag>Laboral</Tag>
<Tag size="md">Familia</Tag>
<Tag size="lg">Contrato</Tag>
```

## Reglas

- Usa Tag según el propósito descrito.
- No abuses de este componente en contexts donde no aplica.

## Import

```tsx
import { Tag } from "@/shared/components/base/Tag";
```

## Props

| Prop        | Tipo                                                      | Default    | Descripción                                       |
| ----------- | --------------------------------------------------------- | ---------- | ------------------------------------------------- |
| `tone`      | `"gray" \| "brand" \| "success" \| "warning" \| "danger"` | `"gray"`   | Tono visual.                                      |
| `shape`     | `"square" \| "rounded"`                                   | `"square"` | Radio de la etiqueta.                             |
| `size`      | `"sm" \| "md" \| "lg"`                                    | `"sm"`     | Escala altura y tipografía: 12/16, 14/20 o 16/24. |
| `removable` | `boolean`                                                 | `false`    | Muestra el control para quitar la etiqueta.       |
| `onRemove`  | `() => void`                                              | —          | Acción del control para quitar.                   |

## Para IA

1. Identifica el contexto de uso del componente.
2. Importa Tag desde el path correcto.
3. Configura las props según la necesidad.
4. Verifica que el componente se integre correctamente en el layout.
5. Solo usa variantes documentadas.

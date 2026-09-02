# Badge

Etiqueta de estado o categoría, **no interactiva** (`<span>`). Para marcar estados ("Activo", "Pendiente") o clasificar.

## Cuándo usarlo

Para marcar el estado o la clasificación de algo sin acción asociada: “Activo”, “Pendiente”, “Beta”. Es información pura — si al tocarlo pasa algo, es un botón o un filtro, no un badge.

## Composición

Una sola pieza no interactiva (`Badge`, un `<span>`) con variantes de intención.
La presentación `default` es contained y admite un icono antes del texto.
Para conteos numéricos usa `CounterBadge`; para taxonomía, `Tag`.

## Uso básico

```tsx
import { Archive, CircleAlert, CircleCheck } from "lucide-react";

<Badge>
  <CircleCheck aria-hidden="true" />
  Activo
</Badge>
<Badge size="md" variant="destructive">
  <CircleAlert aria-hidden="true" />
  Vencido
</Badge>
<Badge variant="outline">
  <Archive aria-hidden="true" />
  Archivado
</Badge>
```

## Reglas

- El badge siempre lleva texto: no comuniques estado solo por color (accesibilidad).
- El icono es opcional y decorativo; usa `aria-hidden="true"` cuando el texto ya expresa el estado.
- El icono escala automáticamente a 12, 14 o 16 px según `size`.
- Es informativo, no clicable. Si necesitas que haga algo, usa `Button` o `DropdownMenu`.
- Mantén el texto corto (1–2 palabras).
- Para un punto de estado mínimo junto a texto usa `StatusDot`; para contadores numéricos, `CounterBadge`.

## Cuándo NO usar

- **Conteo numérico** (mensajes, ítems) → `CounterBadge`.
- **Indicador de estado tipo punto** junto a una fila → `StatusDot`.
- **Etiqueta removible / chip de filtro** → `Tag` (tiene `removable`).
- **Algo clicable** → `Button`.

## Import

```tsx
import { Badge } from "@/shared/components/base/Badge";
```

## Props

| Prop      | Tipo                                                     | Default     | Descripción                                       |
| --------- | -------------------------------------------------------- | ----------- | ------------------------------------------------- |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | Tono visual.                                      |
| `size`    | `"sm" \| "md" \| "lg"`                                   | `"sm"`      | Escala altura y tipografía: 12/16, 14/20 o 16/24. |
| ...resto  | `span` props                                             | —           | `className`, `aria-*`, etc.                       |

## Para IA

1. ¿Es una etiqueta de estado/categoría estática y corta? Entonces `Badge`.
2. Elige la variante por intención: `destructive` para estados negativos, `secondary`/`outline` para neutros.
3. Si es número, punto de estado o chip removible, usa `CounterBadge`/`StatusDot`/`Tag`.
4. No lo uses como botón.

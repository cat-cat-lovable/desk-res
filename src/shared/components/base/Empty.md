# Empty

Estado vacío para cuando no hay datos, resultados o contenido que mostrar.
Compuesto por sub-componentes que permiten construir distintas variantes.

## Cuándo usarlo

Para el momento en que no hay nada que mostrar: sin resultados, sin datos aún, primer uso. Un buen estado vacío dice qué pasa y qué hacer después — nunca dejes una tabla en blanco sin explicación.

## Composición

Slots: `EmptyMedia` (icono o ilustración), `EmptyHeader` con `EmptyTitle` y `EmptyDescription`, y `EmptyContent` para la acción de salida (normalmente un `Button`).

## Uso básico

```tsx
<Empty>
  <EmptyHeader>
    <EmptyTitle>Sin resultados</EmptyTitle>
    <EmptyDescription>No se encontraron elementos que coincidan con tu búsqueda.</EmptyDescription>
  </EmptyHeader>
</Empty>
```

## Con icono

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Inbox className="h-6 w-6" />
    </EmptyMedia>
    <EmptyTitle>Bandeja vacía</EmptyTitle>
    <EmptyDescription>No tienes mensajes pendientes.</EmptyDescription>
  </EmptyHeader>
</Empty>
```

## Con acción

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Upload className="h-6 w-6" />
    </EmptyMedia>
    <EmptyTitle>Sube tu primer archivo</EmptyTitle>
    <EmptyDescription>Arrastra archivos aquí o haz click para seleccionarlos.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Seleccionar archivos</Button>
  </EmptyContent>
</Empty>
```

## Reglas

- Usa `Empty` cuando no hay datos que mostrar.
- No uses `Empty` para estados de carga → usa `Skeleton` o `Spinner`.
- No uses `Empty` en espacios muy pequeños → usa un mensaje inline.
- Ofrece una acción clara cuando sea posible (crear, buscar, filtrar).
- Usa `variant="icon"` en `EmptyMedia` para dar contexto visual.

## Import

```tsx
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/components/base/Empty"; // o @/components/base/Empty
import { Inbox } from "lucide-react";
```

## Props

### Sub-componentes

| Componente         | Props                                         | Descripción                         |
| ------------------ | --------------------------------------------- | ----------------------------------- |
| `Empty`            | `className?`                                  | Contenedor principal.               |
| `EmptyHeader`      | `className?`                                  | Agrupa título, descripción e icono. |
| `EmptyMedia`       | `variant?: "default" \| "icon"`, `className?` | Icono o media decorativa.           |
| `EmptyTitle`       | `className?`                                  | Título principal.                   |
| `EmptyDescription` | `className?`                                  | Texto explicativo. Soporta enlaces. |
| `EmptyContent`     | `className?`                                  | Área para botones o acciones.       |

## Para IA

1. Identifica si la pantalla o sección está vacía por falta de datos.
2. Si es un estado vacío → usa `Empty`.
3. Crea `EmptyHeader` con `EmptyTitle` y `EmptyDescription`.
4. Agrega `EmptyMedia` con `variant="icon"` si un icono aporta contexto.
5. Agrega `EmptyContent` con botones o links cuando haya una acción posible.
6. No uses `Empty` para estados de carga.
7. Asegúrate de que el mensaje sea útil y no genérico.

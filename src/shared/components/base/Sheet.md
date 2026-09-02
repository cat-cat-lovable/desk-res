# Sheet

Panel lateral deslizante. Alternativa a `Dialog` para contenido secundario que
requiere más espacio o contexto persistente.

## Cuándo usarlo

Para tareas secundarias que no ameritan salir de la página: un detalle rápido, un formulario de creación, filtros avanzados. Se desliza desde un borde y mantiene visible el contexto de fondo.

## Composición

Composición Radix: `SheetTrigger` abre `SheetContent` (lado configurable), con `SheetHeader` (`SheetTitle`, `SheetDescription`), cuerpo libre y `SheetFooter`; `SheetClose` cierra.

## Uso básico

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Abrir panel</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Configuración</SheetTitle>
      <SheetDescription>Ajusta las preferencias de tu cuenta.</SheetDescription>
    </SheetHeader>
    <div className="py-4">{/* formulario */}</div>
    <SheetFooter>
      <SheetClose asChild>
        <Button variant="ghost">Cerrar</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## Reglas

- Usa `Sheet` para contenido secundario que necesita más espacio que un `Dialog`.
- No uses `Sheet` para confirmaciones simples; usa `Dialog` o `AppDialog`.
- El panel tiene ancho máximo `sm:max-w-sm` en lados (responsive).
- Incluye `SheetHeader` + `SheetTitle` para accesibilidad.
- Usa `side="bottom"` para layouts mobile.

## Import

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/shared/components/base/Sheet";
```

## Props

### `SheetContent`

| Prop        | Tipo                                     | Default   | Descripción                       |
| ----------- | ---------------------------------------- | --------- | --------------------------------- |
| `side`      | `"top" \| "bottom" \| "left" \| "right"` | `"right"` | Desde qué borde aparece el panel. |
| `className` | `string?`                                | —         | Clase adicional.                  |

### `Sheet` (Root)

| Prop           | Tipo                | Descripción         |
| -------------- | ------------------- | ------------------- |
| `open`         | `boolean?`          | Estado controlado.  |
| `onOpenChange` | `(boolean) => void` | Callback de cambio. |

## Para IA

1. Identifica si el contenido es secundario y necesita más espacio que un `Dialog`.
2. Si es secundario/formulario largo → usa `Sheet`.
3. Elige el `side` apropiado (`right` para desktop, `bottom` para mobile).
4. Incluye `SheetHeader` + `SheetTitle` para accesibilidad.
5. Usa `SheetFooter` para botones de acción al final.
6. Solo usa `Dialog` para confirmaciones simples o alertas.

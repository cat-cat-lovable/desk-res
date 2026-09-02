# Spinner

Indicador de carga visual. Usa el icono `Loader2` de Lucide con animación de rotación.

## Cuándo usarlo

Para esperas breves e indeterminadas, sobre todo dentro del control que las causó: el botón que guarda, el campo que busca. Si la espera tiene forma conocida (una lista que carga), prefiere `Skeleton`.

## Composición

Una sola pieza (`Spinner`: el icono `Loader2` de Lucide girando) con tamaños. Dentro de un `Button` deshabilitado comunica “trabajando”.

## Uso básico

```tsx
<Spinner size="md" />
```

## Tamaños

```tsx
<div className="flex gap-4">
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
  <Spinner size="xl" />
</div>
```

## Colores personalizados

```tsx
<Spinner className="text-destructive" />
<Spinner className="text-success" />
```

## En botón cargando

```tsx
<button disabled className="inline-flex items-center gap-2 opacity-50">
  <Spinner size="sm" className="text-primary-foreground" />
  Guardando...
</button>
```

## Reglas

- Usa `Spinner` para operaciones de corta duración (menos de 2-3 segundos).
- Combina con texto descriptivo cuando el contexto no sea obvio.
- Usa `size="sm"` dentro de botones.
- Usa `size="lg"` o `"xl"` para estados de carga de página completa.
- No uses `Spinner` si la operación dura más de 5 segundos → considera `Progress`.
- No uses `Spinner` sin texto si hay múltiples operaciones simultáneas.

## Import

```tsx
import { Spinner } from "@/shared/components/base/Spinner"; // o @/components/base/Spinner
```

## Props

| Prop        | Tipo                           | Default | Descripción         |
| ----------- | ------------------------------ | ------- | ------------------- |
| `size`      | `"sm" \| "md" \| "lg" \| "xl"` | `"md"`  | Tamaño del spinner. |
| `className` | `string?`                      | —       | Clase adicional.    |

## Para IA

1. Identifica si hay una operación en progreso o carga de datos.
2. Si es una operación corta → usa `Spinner`.
3. Elige el tamaño según el contexto.
4. Agrega texto descriptivo si el contexto no es obvio.
5. Considera `Skeleton` si conoces la estructura del contenido que cargará.
6. Considera `Progress` si la operación tiene progreso medible.

# Searchbox

Campo de búsqueda con icono. Para búsquedas.

## Cuándo usarlo

Para filtrar o buscar dentro de un conjunto: la tabla del desk, un listado. El icono de lupa fija la expectativa. Si en realidad se elige entre opciones (no se filtra contenido), eso es un `Combobox`.

## Composición

Una sola pieza (`Searchbox`): un `Input` con el icono de búsqueda integrado. En toolbars convive con las acciones a la derecha.

## Uso básico

```tsx
<Searchbox />
```

## Reglas

- Usa Searchbox según el propósito descrito.
- No abuses de este componente en contexts donde no aplica.

## Import

```tsx
import { Searchbox } from "@/shared/components/base/Searchbox";
```

## Props

Consulta la story en Storybook para ver las props disponibles.

## Para IA

1. Identifica el contexto de uso del componente.
2. Importa Searchbox desde el path correcto.
3. Configura las props según la necesidad.
4. Verifica que el componente se integre correctamente en el layout.
5. Solo usa variantes documentadas.

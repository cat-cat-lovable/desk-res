# Label

Etiqueta para campos de formulario. Incluye indicador de requerido.

## Cuándo usarlo

Para nombrar todo campo de formulario, siempre visible — el placeholder desaparece al escribir y la memoria de la persona no es parte del sistema. Incluye indicador de requerido cuando aplica.

## Composición

Una sola pieza (`Label`) asociada al control por `htmlFor`/`id`. En formularios validados la pone `FormLabel`, que hereda el estado de error.

## Uso básico

```tsx
<Label />
```

## Reglas

- Usa Label según el propósito descrito.
- No abuses de este componente en contexts donde no aplica.

## Import

```tsx
import { Label } from "@/shared/components/base/Label";
```

## Props

Consulta la story en Storybook para ver las props disponibles.

## Para IA

1. Identifica el contexto de uso del componente.
2. Importa Label desde el path correcto.
3. Configura las props según la necesidad.
4. Verifica que el componente se integre correctamente en el layout.
5. Solo usa variantes documentadas.

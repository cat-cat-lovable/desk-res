# Card

Contenedor de contenido. Para agrupar información relacionada.

## Cuándo usarlo

Para agrupar información relacionada en una unidad con jerarquía propia: un resumen, una entidad, un bloque de ajustes. Si la vista entera es un listado denso y comparable, una tabla escanea mejor que una grilla de cards.

## Composición

Composición por slots: `CardHeader` (con `CardTitle`, `CardDescription` y `CardAction` opcional), `CardContent` para el cuerpo y `CardFooter` para acciones o metadatos. Usa solo los slots que necesitas — la caja mantiene su ritmo interno.

## Uso básico

```tsx
<Card />
```

## Reglas

- Usa Card según el propósito descrito.
- No abuses de este componente en contexts donde no aplica.

## Import

```tsx
import { Card } from "@/shared/components/base/Card";
```

## Props

Consulta la story en Storybook para ver las props disponibles.

## Para IA

1. Identifica el contexto de uso del componente.
2. Importa Card desde el path correcto.
3. Configura las props según la necesidad.
4. Verifica que el componente se integre correctamente en el layout.
5. Solo usa variantes documentadas.

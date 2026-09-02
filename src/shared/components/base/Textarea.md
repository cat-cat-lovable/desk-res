# Textarea

Campo de texto multilínea, redimensionable verticalmente (alto mínimo predefinido). Renderiza un `<textarea>` nativo.

## Cuándo usarlo

Para texto libre de varias líneas: descripciones, comentarios, relatos. El alto inicial insinúa la extensión esperada. Para respuestas de una línea, `Input`.

## Composición

Una sola pieza (`Textarea`, un `<textarea>` nativo redimensionable en vertical) con `Label` visible; en formularios validados va dentro de `FormControl`.

## Uso básico

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="notas">Notas del caso</Label>
  <Textarea id="notas" placeholder="Resumen de la reunión…" rows={4} />
</div>
```

## Reglas

- Asocia siempre un `Label` por `htmlFor`/`id`.
- Usa `rows` para insinuar la longitud esperada de la respuesta.
- Si hay límite de caracteres, muéstralo cerca del campo (no solo un `maxLength` silencioso).
- Marca errores con `aria-invalid` + mensaje de texto.

## Cuándo NO usar

- **Una sola línea** (nombre, email, RUT) → `Input`.
- **Editor con formato/markdown** → no existe en el registry; documenta la decisión si usas algo a medida.

## Import

```tsx
import { Textarea } from "@/shared/components/base/Textarea";
```

## Props

| Prop           | Tipo             | Default | Descripción                                           |
| -------------- | ---------------- | ------- | ----------------------------------------------------- |
| `rows`         | `number`         | —       | Alto inicial en líneas.                               |
| `aria-invalid` | `boolean`        | —       | Activa el estilo de error.                            |
| `disabled`     | `boolean`        | `false` | Deshabilita el campo.                                 |
| ...resto       | `textarea` props | —       | `value`, `onChange`, `placeholder`, `maxLength`, etc. |

## Para IA

1. Úsalo solo cuando se espera texto de varias líneas (comentarios, descripciones, notas).
2. Empareja con `Label`.
3. Ajusta `rows` a la longitud esperada.
4. Si hay tope de caracteres, hazlo visible y redacta el error como corregir.

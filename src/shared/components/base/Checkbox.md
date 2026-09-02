# Checkbox

Casilla de verificación (Radix). Para un sí/no independiente o para elegir **varias** opciones de una lista. No trae label: emparéjalo con `Label`.

## Cuándo usarlo

Para un sí/no independiente (acepto los términos) o para elegir varias opciones de una lista visible. Cada checkbox es autónomo: marcar uno no afecta a los demás. Si la elección es excluyente, es un `RadioGroup`; si es un ajuste de efecto inmediato, un `Switch`.

## Composición

Una sola pieza (`Checkbox`, Radix) sin label propio: emparéjala siempre con `Label` apuntando a su `id`. En listas, un checkbox por fila con su label clickeable.

## Uso básico

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terminos" />
  <Label htmlFor="terminos">Acepto los términos</Label>
</div>
```

## Selección múltiple

```tsx
<fieldset className="grid gap-2">
  <legend className="text-sm font-medium">Notificarme sobre</legend>
  {opciones.map((o) => (
    <div key={o.id} className="flex items-center gap-2">
      <Checkbox
        id={o.id}
        checked={seleccion.includes(o.id)}
        onCheckedChange={(c) => toggle(o.id, c)}
      />
      <Label htmlFor={o.id}>{o.label}</Label>
    </div>
  ))}
</fieldset>
```

## Reglas

- Empareja con `Label` por `htmlFor`/`id`; al pulsar el label debe activarse la casilla.
- Para **grupos**, envuelve en `fieldset` + `legend` que describa el grupo.
- Usa `"indeterminate"` para un "seleccionar todo" parcialmente marcado.
- No uses checkbox para activar algo inmediato a nivel de sistema → eso es `Switch`.

## Cuándo NO usar

- **Encender/apagar un ajuste con efecto inmediato** → `Switch`.
- **Elegir una sola opción entre varias** → `RadioGroup`.
- **Más de ~7 opciones o con búsqueda** → `Select`/`Combobox` con multiselección.

## Import

```tsx
import { Checkbox } from "@/shared/components/base/Checkbox";
```

## Props

| Prop              | Tipo                         | Default | Descripción                   |
| ----------------- | ---------------------------- | ------- | ----------------------------- |
| `checked`         | `boolean \| "indeterminate"` | —       | Estado controlado.            |
| `defaultChecked`  | `boolean`                    | —       | Estado inicial no controlado. |
| `onCheckedChange` | `(checked) => void`          | —       | Cambio de estado.             |
| `disabled`        | `boolean`                    | `false` | Deshabilita.                  |

## Para IA

1. ¿Es selección múltiple o un consentimiento aislado? Si es "una entre varias", usa `RadioGroup`; si es ajuste de sistema, `Switch`.
2. Crea el par `Checkbox` + `Label` con `id`/`htmlFor`.
3. Agrupa opciones relacionadas en `fieldset`/`legend`.
4. Controla con `checked` + `onCheckedChange` cuando dependa del estado.

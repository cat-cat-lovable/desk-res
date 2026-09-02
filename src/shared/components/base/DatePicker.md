# DatePicker

Selector de fecha en un campo: un `Button` que abre un `Popover` con un
`Calendar` adentro. Es la composición estándar para elegir una fecha en
formularios. Muestra la fecha elegida formateada (en español por defecto).

## Cuándo usarlo

Para capturar una fecha dentro de un formulario sin ocupar pantalla: el campo muestra la fecha elegida y el calendario aparece solo al abrirlo. Para fecha de nacimiento activa los dropdowns de mes/año — nadie navega trescientos meses con flechas.

## Composición

Receta empaquetada: un `Button` con apariencia de campo que abre un `Popover` con un `Calendar` dentro. Emparéjalo con `Label`, como a cualquier campo de formulario.

## Uso básico (no controlado)

```tsx
<DatePicker />
```

## Controlado

```tsx
const [date, setDate] = React.useState<Date | undefined>();

<DatePicker value={date} onChange={setDate} />;
```

## Fecha de nacimiento (dropdowns de mes/año)

```tsx
<DatePicker captionLayout="dropdown" placeholder="Fecha de nacimiento" />
```

## Receta compuesta

`DatePicker` es un wrapper delgado sobre `Popover` + `Button` + `Calendar`. Sus props extra (`variant`, `disabled`, `id`, `aria-*`…) pasan al botón trigger y el `ref` apunta a ese botón. Si necesitas variar la estructura (rango, dos meses, footer con acciones, otro trigger), compón las piezas directamente:

```tsx
import { Button } from "@/shared/components/base/Button";
import { Calendar } from "@/shared/components/base/Calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/base/Popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">{fecha ? formatear(fecha) : "Selecciona una fecha"}</Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="range" numberOfMonths={2} selected={rango} onSelect={setRango} />
  </PopoverContent>
</Popover>;
```

## Reglas

- Para una sola fecha en un formulario, usa `DatePicker`; para elegir un período usa `Calendar` con `mode="range"` dentro de un `Popover`.
- En modo controlado pasa `value` **y** `onChange`; sin `onChange` el componente maneja su propio estado.
- El popover se cierra al seleccionar una fecha.
- Ajusta el ancho del campo con `className` (por defecto `w-65`).

## Cuándo NO usar

- **Elegir un rango** → `Calendar` con `mode="range"` (date range picker).
- **Mostrar un calendario siempre visible** → `Calendar` directo, sin `Popover`.
- **Solo hora** → un input de tiempo.

## Import

```tsx
import { DatePicker } from "@/shared/components/base/DatePicker";
```

## Props

| Prop            | Tipo                           | Default                  | Descripción                                               |
| --------------- | ------------------------------ | ------------------------ | --------------------------------------------------------- |
| `value`         | `Date`                         | —                        | Fecha seleccionada (modo controlado, junto a `onChange`). |
| `defaultValue`  | `Date`                         | —                        | Fecha inicial en modo no controlado.                      |
| `onChange`      | `(date?: Date) => void`        | —                        | Callback de selección. Activa el modo controlado.         |
| `placeholder`   | `string`                       | `"Selecciona una fecha"` | Texto cuando no hay fecha.                                |
| `disabled`      | `boolean`                      | `false`                  | Deshabilita el disparador.                                |
| `captionLayout` | `"label" \| "dropdown" \| …`   | `"label"`                | Encabezado del calendario.                                |
| `locale`        | `Locale`                       | `es`                     | Localización (de `react-day-picker/locale`).              |
| `align`         | `"start" \| "center" \| "end"` | `"start"`                | Alineación del popover.                                   |
| `className`     | `string`                       | —                        | Clases del botón disparador (p. ej. ancho).               |

## Para IA

1. Para una fecha en formulario, usa `DatePicker` (no reconstruyas Popover+Calendar a mano salvo que necesites rango).
2. Modo controlado: `value` + `onChange` con estado propio; no controlado: solo `<DatePicker />`.
3. Usa `captionLayout="dropdown"` para fechas lejanas (nacimiento, vencimientos).
4. Para rango, compón `Popover` + `Button` + `Calendar mode="range"`.

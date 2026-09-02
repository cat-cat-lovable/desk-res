# Calendar

Selector de fechas construido sobre [React DayPicker](https://daypicker.dev),
con los estilos y el `Button` de Lexy. Soporta selección simple, múltiple y de
rango, navegación por mes/año y localización.

## Cuándo usarlo

Para elegir fechas viendo el contexto del mes: agendar, rangos de reserva, fechas próximas. Si el campo vive en un formulario, usa `DatePicker` (que ya lo envuelve en un `Popover`); usa `Calendar` directo cuando el calendario es protagonista de la vista.

## Composición

Construido sobre React DayPicker: `Calendar` renderiza la grilla del mes con su navegación, y `CalendarDayButton` es el botón de día personalizable. Los modos `single`, `range` y `multiple` cambian qué se selecciona.

## Uso básico (fecha única)

```tsx
const [date, setDate] = React.useState<Date | undefined>(new Date());

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  locale={es}
  className="rounded-lg border border-border"
/>;
```

## Rango

```tsx
const [range, setRange] = React.useState<DateRange | undefined>();

<Calendar
  mode="range"
  selected={range}
  onSelect={setRange}
  numberOfMonths={2}
  locale={es}
  className="rounded-lg border border-border"
/>;
```

## Selección múltiple

```tsx
<Calendar mode="multiple" selected={dates} onSelect={setDates} locale={es} />
```

## Navegación con dropdowns

`captionLayout="dropdown"` reemplaza el título por selectores de mes y año.

```tsx
<Calendar
  mode="single"
  captionLayout="dropdown"
  locale={es}
  className="rounded-lg border border-border"
/>
```

## Reglas

- Es un componente controlado: maneja `selected`/`onSelect` con estado propio.
- Pasa `locale` (p. ej. `es`) para meses y días en español.
- Para elegir una fecha dentro de un formulario, combínalo con `Popover` + un `Button` que muestre la fecha (patrón date-picker).
- No reconstruyas la grilla a mano; toda la estructura sale de React DayPicker.

## Cuándo NO usar

- **Una hora/duración** sin fecha → un `Input type="time"` o un selector dedicado.
- **Rango de fechas en texto** con muchos presets → considera un date-picker con presets sobre este Calendar.

## Import

```tsx
import { Calendar } from "@/shared/components/base/Calendar";
import { es } from "react-day-picker/locale";
```

## Props (las más usadas)

| Prop                    | Tipo                                                             | Descripción                                              |
| ----------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `mode`                  | `"single" \| "multiple" \| "range"`                              | Tipo de selección.                                       |
| `selected` / `onSelect` | según `mode`                                                     | Valor controlado y callback.                             |
| `captionLayout`         | `"label" \| "dropdown" \| "dropdown-months" \| "dropdown-years"` | Encabezado como texto o como selectores.                 |
| `numberOfMonths`        | `number`                                                         | Cantidad de meses visibles.                              |
| `locale`                | `Locale`                                                         | Localización (p. ej. `es` de `react-day-picker/locale`). |
| `buttonVariant`         | variante de `Button`                                             | Variante de los botones de navegación.                   |
| `disabled`              | `Matcher \| Matcher[]`                                           | Días deshabilitados.                                     |
| ...resto                | `DayPickerProps`                                                 | Todas las props de React DayPicker.                      |

## Para IA

1. Decide el `mode` (`single`, `multiple` o `range`) según el caso.
2. Importa `Calendar` local (`@/components/base/Calendar`) y el locale (`es`) desde `react-day-picker/locale`.
3. Mantén el estado de `selected` y pásalo con su `onSelect`.
4. Para un date-picker de formulario, envuélvelo en `Popover` con un `Button` disparador.
5. Usa `captionLayout="dropdown"` cuando el usuario deba saltar muchos meses/años.

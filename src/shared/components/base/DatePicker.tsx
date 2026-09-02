/* eslint-disable jsx-a11y/no-autofocus -- el foco entra al calendario al abrir el popover (patrón diálogo) */
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { Locale } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { cn } from "@/shared/lib/utils/cn";

import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

function formatDate(date: Date, localeCode?: string) {
  return date.toLocaleDateString(localeCode, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Wrapper ergonómico sobre la receta compuesta Popover + Button + Calendar.
 * Si necesitas variar la estructura (rango, dos meses, footer, otro trigger),
 * compón las piezas directamente — ver "Receta compuesta" en DatePicker.md.
 */
export interface DatePickerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "value" | "defaultValue" | "onChange"
> {
  /** Fecha seleccionada (modo controlado: pásala junto a `onChange`). */
  value?: Date;
  /** Fecha inicial en modo no controlado. */
  defaultValue?: Date;
  /** Callback de selección (activa el modo controlado). */
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
  locale?: Partial<Locale>;
  align?: React.ComponentProps<typeof PopoverContent>["align"];
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    onChange,
    placeholder = "Selecciona una fecha",
    captionLayout = "label",
    locale = es,
    align = "start",
    className,
    ...props
  },
  ref,
) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);

  // Controlado si se provee `onChange`; si no, mantenemos estado interno.
  const selected = onChange ? value : internal;

  const handleSelect = (date: Date | undefined) => {
    if (onChange) onChange(date);
    else setInternal(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          data-empty={!selected}
          className={cn(
            "w-65 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
          {...props}
        >
          <CalendarIcon />
          {selected ? formatDate(selected, locale?.code) : placeholder}
        </Button>
      </PopoverTrigger>
      {/* El panel toma el ancho del trigger (igual que Combobox); el calendario
            (248px natural) se centra dentro. */}
      <PopoverContent
        className="flex w-[var(--radix-popover-trigger-width)] justify-center p-0"
        align={align}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout={captionLayout}
          locale={locale}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
});
DatePicker.displayName = "DatePicker";

export { DatePicker };

# AppDialog

Diálogo de aplicación al estilo **Material 3**. Estructura canónica sin dividers:

1. **Icono** (opcional, sin fondo, centrado)
2. **Título compacto** (22/28, centrado si hay icono)
3. **Supporting text** (text-sm, igual que botones)
4. **Content area** (scrollable si es necesario)
5. **Action area** (botones, sin divider, alineación configurable)

## Cuándo usarlo

Para diálogos de aplicación con la estructura ya resuelta: icono, título, descripción y acciones al estilo Material 3. La vía por defecto para modales — pides solo los datos y evitas inconsistencias de composición.

## Composición

Una sola pieza data-driven (`AppDialog`) sobre `Dialog`: recibe `title`, `description`, icono y acciones; el layout canónico (sin dividers) ya viene armado.

## Uso básico

```tsx
<AppDialog
  trigger={<Button variant="outline">Eliminar cuenta</Button>}
  title="¿Eliminar cuenta?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  confirmVariant="destructive"
  onConfirm={() => {
    deleteAccount();
  }}
/>
```

## Con icono

```tsx
import { AlertCircle } from "lucide-react";

<AppDialog
  trigger={<Button variant="outline">Eliminar</Button>}
  icon={<AlertCircle className="size-6 text-destructive" />}
  title="¿Eliminar cuenta?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  confirmVariant="destructive"
  onConfirm={() => deleteAccount()}
/>;
```

## Uso controlado

```tsx
const [open, setOpen] = useState(false);

<AppDialog
  open={open}
  onOpenChange={setOpen}
  trigger={<Button>Invitar miembro</Button>}
  title="Invitar miembro"
  description="Envía una invitación por email."
  confirmLabel="Invitar"
  onConfirm={() => {
    sendInvite();
    return true; // cierra el diálogo
  }}
>
  <Input placeholder="Email" />
</AppDialog>;
```

## Alineación de acciones

```tsx
// Centrado para decisiones binarias
<AppDialog
  trigger={<Button>Confirmar</Button>}
  title="¿Estás seguro?"
  actionsAlignment="center"
  confirmLabel="Sí"
  cancelLabel="No"
/>

// Space-between para guardar/descartar
<AppDialog
  trigger={<Button>Salir</Button>}
  title="Cambios sin guardar"
  actionsAlignment="space-between"
  confirmLabel="Guardar"
  cancelLabel="Descartar"
/>
```

## Receta compuesta

`AppDialog` es un wrapper ergonómico sobre el `Dialog` compuesto: las props extra (`aria-*`, `onEscapeKeyDown`, `onInteractOutside`…) pasan al `DialogContent` y el `ref` apunta a ese nodo. Si la estructura canónica no te alcanza (varios bloques de acciones, layout propio, sin título), usa las piezas directamente:

```tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/base/Dialog";
```

## Reglas

- **Sí** usa `icon` para alertas o confirmaciones importantes (icono plano, sin fondo).
- **Sí** usa `actionsAlignment="center"` para decisiones binarias (sí/no).
- **Sí** usa `actionsAlignment="space-between"` para guardar/descartar.
- **No** uses fondo coloreado en el icono; Material 3 usa icono plano.
- **No** bajes a `Dialog` primitivo si `AppDialog` cubre el caso.
- El supporting text usa `text-sm` para igualar la tipografía del action area.
- No hay dividers entre contenido y acciones (siguiendo Material 3).
- Si hay `icon`, el headline se centra. Si no hay icono, se alinea a la izquierda.

## Import

```tsx
import { AppDialog } from "@/shared/components/base/AppDialog";
```

## Props

| Prop               | Tipo                                               | Default       | Descripción                                       |
| ------------------ | -------------------------------------------------- | ------------- | ------------------------------------------------- |
| `trigger`          | `ReactNode`                                        | —             | Elemento que abre el diálogo.                     |
| `icon`             | `ReactNode?`                                       | —             | Icono arriba del título (sin fondo).              |
| `title`            | `string`                                           | —             | **Requerido.** Título compacto (22/28).           |
| `description`      | `string?`                                          | —             | Texto de soporte (text-sm).                       |
| `children`         | `ReactNode?`                                       | —             | Contenido principal entre descripción y acciones. |
| `confirmLabel`     | `string`                                           | `"Confirmar"` | Texto del botón de acción.                        |
| `cancelLabel`      | `string`                                           | `"Cancelar"`  | Texto del botón de cancelar.                      |
| `confirmVariant`   | `Button variant`                                   | `"default"`   | Variante del botón de confirmar.                  |
| `confirmDisabled`  | `boolean`                                          | `false`       | Deshabilita el botón de confirmar.                |
| `onConfirm`        | `() => boolean \| void \| Promise<...>`            | —             | Si devuelve `false`, no cierra.                   |
| `onCancel`         | `() => void`                                       | —             | Se llama al cancelar o cerrar.                    |
| `actionsAlignment` | `"right" \| "center" \| "left" \| "space-between"` | `"right"`     | Alineación de botones.                            |
| `open`             | `boolean?`                                         | —             | Modo controlado.                                  |
| `onOpenChange`     | `(boolean) => void`                                | —             | Callback de cambio de estado.                     |
| `hideFooter`       | `boolean`                                          | `false`       | Oculta el action area.                            |

## Para IA

1. Identifica el patrón: ¿es confirmación, formulario modal o alerta informativa?
2. Si es confirmación/formulario → usa `AppDialog`.
3. Si es una alerta importante → añade `icon` (sin fondo, icono plano).
4. Define `title` y `description` (supporting text).
5. Si hay formulario, pasa inputs como `children` y maneja `onConfirm` para validar.
6. Elige `actionsAlignment` según el contexto:
   - `right` para acciones estándar
   - `center` para decisiones binarias (sí/no)
   - `space-between` para guardar/descartar
7. Usa `confirmVariant="destructive"` para acciones irreversibles.
8. Usa `open` + `onOpenChange` si necesitas controlar el estado desde fuera.
9. Solo usa `Dialog` primitivo si necesitas un layout sin footer o sin título.

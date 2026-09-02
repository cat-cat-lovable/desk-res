# HeaderBar

Barra superior de aplicación o sitio: marca a la izquierda y acciones a la derecha. Renderiza un `<header>` semántico.

## Cuándo usarlo

Para la barra superior de un sitio o app: marca a la izquierda, acciones a la derecha, semántica de `<header>`. Si puedes describir la navegación como datos, `AppHeaderBar` te ahorra la composición.

## Composición

Una pieza (`HeaderBar`) con slots `brand` y `actions`, variantes de superficie (clara / navy) y modo sticky.

## Uso básico

```tsx
<HeaderBar
  actions={
    <>
      <Button variant="ghost">Ingresar</Button>
      <Button>Crear cuenta</Button>
    </>
  }
/>
```

Por defecto muestra el `Logo`. Sobrescribe la marca con `brand`:

```tsx
<HeaderBar brand={<Logo layout="horizontal" />} actions={<UserMenu />} />
```

## Reglas

- Mantén pocas acciones a la derecha; agrupa el resto en un `DropdownMenu`.
- `surface="navy"` ajusta el logo a su versión clara automáticamente; no fuerces el color del logo.
- Si es una app con barra lateral, usa `SidebarProvider` + `AppSidebar` + `SidebarInset` (ver AppSidebar.md).
- `sticky` para navegación persistente; cuida no tapar contenido al anclar.

## Cuándo NO usar

- **Layout completo de app con sidebar** → `SidebarProvider` + `AppSidebar` + `SidebarInset` (ver AppSidebar.md).
- **Navegación lateral** → `AppSidebar`.
- **Menús de navegación con dropdowns ricos** → combínalo con `NavigationMenu` dentro de `actions`/`brand`.

## Import

```tsx
import { HeaderBar } from "@/shared/components/base/HeaderBar";
```

## Props

| Prop       | Tipo                                   | Default     | Descripción                                         |
| ---------- | -------------------------------------- | ----------- | --------------------------------------------------- |
| `surface`  | `"default" \| "transparent" \| "navy"` | `"default"` | Fondo. `navy` usa el ink de marca con texto blanco. |
| `bordered` | `boolean`                              | `true`      | Borde inferior.                                     |
| `padding`  | `"page" \| "none"`                     | `"page"`    | Padding horizontal estándar o nulo.                 |
| `sticky`   | `boolean`                              | `false`     | Fija la barra al hacer scroll.                      |
| `actions`  | `ReactNode`                            | —           | Contenido alineado a la derecha.                    |
| `brand`    | `ReactNode`                            | `<Logo>`    | Sobrescribe el área de marca.                       |

## Para IA

1. Úsalo como cabecera de sitio o barra superior simple.
2. Pon la marca (o deja el `Logo` por defecto) y 1–3 acciones en `actions`.
3. Elige `surface`/`sticky` según el contexto; agrupa acciones extra en `DropdownMenu`.
4. Si la pantalla es una app con sidebar, prefiere `SidebarProvider` + `AppSidebar` + `SidebarInset` en lugar de componer a mano.

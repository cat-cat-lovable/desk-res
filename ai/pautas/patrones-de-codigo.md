# Patrones de código de componentes

Patrones que mantienen legible y mantenible el código React de un proyecto Lexy: composición antes que props-monolito, estado de formulario consolidado, constantes tipadas fuera del JSX y convenciones de assets y fuentes. Nacen de la auditoría de desarrollo del bootstrap (junio 2026).

Esta pauta responde *cómo se escribe el código*; para *cuándo usar qué componente*
usa [buenas-practicas.md](buenas-practicas.md), y para *valores* (espaciado, color,
densidad) usa [sistema-visual.md](sistema-visual.md).

---

## 1. Composición antes que props-monolito (compound components)

Un componente que recibe decenas de props para dibujar sus partes internas
ensucia el JSX y lo vuelve ilegible. La regla Lexy: **las partes visibles se
componen como hijos; las props configuran comportamiento, no contenido**.

- Los componentes del registry ya son compuestos: úsalos así. `Card` se arma con
  `CardHeader`/`CardTitle`/`CardContent`/`CardFooter`; `Dialog` con
  `DialogTrigger`/`DialogContent`; `Sidebar` con `SidebarProvider`/`SidebarInset`/
  `SidebarTrigger`; `Tabs` con `TabsList`/`TabsTrigger`/`TabsContent`.
- Cuando crees un componente propio con más de una zona visible (encabezado,
  cuerpo, acciones), expón subcomponentes en lugar de props tipo `tituloX`,
  `mostrarY` o `renderZ`.

Anti-patrón:

```tsx
<CasoResumen
  titulo="Caso 2024-113"
  estado="activo"
  mostrarAcciones
  textoAccionPrimaria="Archivar"
  onAccionPrimaria={onArchivar}
  piePersonalizado={renderPie()}
/>
```

Correcto:

```tsx
<CasoResumen densidad="compacta">
  <CasoResumen.Header>
    <CasoResumen.Titulo>Caso 2024-113</CasoResumen.Titulo>
    <Badge variant="outline">Activo</Badge>
  </CasoResumen.Header>
  <CasoResumen.Body>…</CasoResumen.Body>
  <CasoResumen.Footer>
    <Button variant="outline" onClick={onArchivar}>
      Archivar
    </Button>
  </CasoResumen.Footer>
</CasoResumen>
```

### El mecanismo: contexto compartido + dot notation

El patrón de referencia (la `Table` del CLI Lexy de desarrollo, con variantes
`normal`/`basic`/`striped` y `stickyHeader`) tiene tres piezas:

1. **Un Context propio del componente** guarda las decisiones que comparten todas
   sus partes (variante, columnas, densidad); el padre lo provee una sola vez.
2. **Los subcomponentes se cuelgan del padre** (`Table.Header = function Header`)
   y leen ese contexto con `useContext`, en vez de recibir las mismas props
   repetidas en cada nivel.
3. **El consumidor solo compone** (`<Table.Header>`, `<Table.Row>`,
   `<Table.Cell>`); el estilo por variante se resuelve adentro del componente,
   no en el JSX de la pantalla.

```tsx
import { createContext, useContext, type ReactNode } from "react";

type Densidad = "normal" | "compacta";

const CasoResumenContext = createContext<{ densidad: Densidad }>({
  densidad: "normal",
});

export function CasoResumen({
  children,
  densidad = "normal",
}: {
  children: ReactNode;
  densidad?: Densidad;
}) {
  const ctx = { densidad };
  return (
    <CasoResumenContext.Provider value={ctx}>
      <section className="rounded-md border border-border bg-card">
        {children}
      </section>
    </CasoResumenContext.Provider>
  );
}

CasoResumen.Header = function Header({ children }: { children: ReactNode }) {
  const { densidad } = useContext(CasoResumenContext);
  return (
    <header className={densidad === "compacta" ? "px-4 py-2" : "px-6 py-4"}>
      {children}
    </header>
  );
};
```

- La variante o densidad se pasa **una sola vez** al padre y todas las partes se
  ajustan solas: nada de `variantHeader`, `variantRow` ni props espejo.
- Los estilos internos usan **tokens semánticos** (`bg-card`, `border-border`,
  `text-muted-foreground`), nunca colores crudos.
- Las excepciones data-driven del sistema (`AppSidebar`, `AppHeaderBar`,
  `AppDialog`, `AppAccordion`) existen para casos estándar de alto nivel; no
  repliques ese patrón en componentes nuevos sin necesidad real.

## 2. Estado consolidado: nada de `useState` en cascada

Varios `useState` que pertenecen al mismo rol (los campos de un formulario, los
filtros de una tabla) fragmentan el estado, multiplican re-renders y hacen
ilegible el componente.

**Regla: tres o más `useState` del mismo dominio → un solo objeto de estado o un
custom hook.**

Anti-patrón:

```tsx
const [nombre, setNombre] = useState("");
const [rut, setRut] = useState("");
const [email, setEmail] = useState("");
const [telefono, setTelefono] = useState("");
const [comuna, setComuna] = useState("");
```

Correcto:

```tsx
type FormState = {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  comuna: string;
};

const FORM_INICIAL: FormState = {
  nombre: "",
  rut: "",
  email: "",
  telefono: "",
  comuna: "",
};

const [form, setForm] = useState<FormState>(FORM_INICIAL);

const setCampo = <K extends keyof FormState>(campo: K, valor: FormState[K]) =>
  setForm((prev) => ({ ...prev, [campo]: valor }));
```

- Si la lógica se repite en más de una pantalla, extráela a un custom hook
  (`useFormulario`, `useFiltros`) en la ruta de hooks del proyecto.
- El estado local y el de URL siguen siendo lo primero (ver
  [buenas-practicas.md](buenas-practicas.md)); esta regla es sobre la *forma* del
  estado, no sobre dónde vive.

## 3. Constantes tipadas fuera del JSX

Las listas de opciones, catálogos y textos estructurales no se declaran inline en
el JSX ni se re-tipean en cada uso. Viven en un `constants.ts` junto al feature
(o en `src/shared/constants.ts` si son transversales), con un tipo estandarizado:

```ts
// constants.ts
import type { Decision } from "./types";

export type Opcion = {
  value: Decision;
  label: string;
  descripcion?: string;
};

export const OPCIONES: Opcion[] = [
  { value: "aprobar", label: "Aprobar", descripcion: "Continúa el flujo" },
  { value: "rechazar", label: "Rechazar", descripcion: "Cierra el caso" },
];
```

El componente solo consume:

```tsx
<RadioGroup>
  {OPCIONES.map((opcion) => (
    <RadioGroupItem key={opcion.value} value={opcion.value}>
      {opcion.label}
    </RadioGroupItem>
  ))}
</RadioGroup>
```

- `value` sale de un tipo de dominio (`Decision`), nunca `string` suelto; `label`
  y `descripcion` son presentación.
- Si el dato participa de la experiencia (visible, editable, calculado o
  filtrable), su tipo nace del **contrato de datos del prototipo**, no de una
  constante ad hoc.

## 4. Assets: dónde viven y cómo se importan

- **Arquitectura layer**: assets compartidos en `src/assets/`.
- **Arquitectura feature**: los assets de un feature viven junto al feature; los
  transversales, en `src/shared/assets/`.
- **Siempre imports estáticos** (`import logo from "./assets/logo.svg"`), nunca
  rutas string armadas en runtime: el import estático permite al bundler
  optimizar, versionar y eliminar lo no usado (tree-shaking).
- Lo que no pasa por el bundler (favicon, fuentes) vive en `public/`.

## 5. Fuentes autoalojadas, no CDN

Decisión de sistema: **Geist Sans y Geist Mono se sirven desde `public/fonts/`**,
no desde Google Fonts ni otro CDN.

Razones: sin dependencia de terceros ni fuga de IPs de usuarios hacia Google
(privacidad), latencia estable y funcionamiento sin conexión o en intranet. El scaffold ya deja las fuentes y su
licencia en `public/fonts/`; no agregues `<link>` a fonts.googleapis.com.

## 6. Bundle de producción

El `vite.config.ts` del scaffold ya trae la política de build; no la elimines:

- `minify: "terser"` con `drop_console`/`drop_debugger`: nada de `console.*` ni
  `debugger` en producción.
- **Code splitting por grupos de vendor** (`rolldownOptions.output.codeSplitting`):
  separa `node_modules` en bundles temáticos (react-core, router, query, state,
  utils, ui, radix, icons, vendor) con `minSize` 20000, para carga diferida y
  mejor caché entre deploys.

Si agregas una dependencia pesada nueva, evalúa darle un grupo propio en la misma
configuración antes de dejarla caer al grupo `vendor` genérico.

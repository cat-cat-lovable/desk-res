import type { Documento } from "@/shared/types/caso";

export function archivoADocumento(archivo: File): Documento {
  const tipo: Documento["tipo"] = archivo.type.startsWith("image/")
    ? "imagen"
    : archivo.type === "application/pdf"
      ? "pdf"
      : "word";
  return { nombre: archivo.name, tipo, url: URL.createObjectURL(archivo) };
}

import { appendFileSync } from "node:fs";
import { tareas } from "./datos.js";
import type { Tarea, RespuestaTareas } from "./tipos.js";

export function registrar(
  accion: string,
  antes: Tarea[],
  status: number,
  respuesta: RespuestaTareas,
): void {
  // despues toma el estado actual de las tareas, por eso se llama después de modificar los datos
  const entrada = { accion, status, antes, respuesta, despues: tareas };
  // JSON.stringify arma una sola línea de texto, y el salto de línea cierra el registro
  appendFileSync("bitacora.jsonl", JSON.stringify(entrada) + "\n");
}

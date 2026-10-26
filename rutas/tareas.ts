import { Router } from "express";
import { tareas } from "../datos.js";
import { registrar } from "../registro.js";
import type { Tarea, ErrorRespuesta } from "../tipos.js";

export const rutasTareas = Router();

rutasTareas.get("/", (req, res) => {
  const antes = structuredClone(tareas);
  const filtro = req.query.completada;
  const accion =
    filtro === undefined ? "GET /tareas" : "GET /tareas?completada=" + filtro;
  let resultado: Tarea[] = tareas;

  // Agregá acá la validación del filtro (paso 2)
  if (filtro !== undefined && filtro !== "true" && filtro !== "false") {
    const respuesta: ErrorRespuesta = {
      error: "El filtro completada debe ser 'true' o 'false'",
    };
    registrar(accion, antes, 400, respuesta);
    return res.status(400).json(respuesta);
  }

  // Agregá acá el filtrado de las tareas (paso 3)
  if (filtro !== undefined) {
    resultado = tareas.filter((t) => t.completada === (filtro === "true"));
  }

  registrar(accion, antes, 200, resultado);
  res.json(resultado);
});

rutasTareas.get("/:id", (req, res) => {
  const antes = structuredClone(tareas);
  const tarea = tareas.find((t) => t.id === Number(req.params.id));
  if (!tarea) {
    const respuesta: ErrorRespuesta = { error: "Tarea no encontrada" };
    registrar("GET /tareas/:id", antes, 404, respuesta);
    return res.status(404).json(respuesta);
  }
  registrar("GET /tareas/:id", antes, 200, tarea);
  res.json(tarea);
});

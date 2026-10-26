import express from "express";
import type { Request, Response, NextFunction } from "express";
import { saludo } from "./middlewares/prueba.js";
import type { RespuestaTareas, Tarea, ErrorRespuesta } from "./tipos.js";

import { tareas } from "./datos.js";
import { registrar } from "./registro.js";
import { logger } from "./middlewares/logger.js";

console.log(saludo);

const app = express();

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

app.get("/tareas", (req, res) => {
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

app.get("/tareas/:id", (req, res) => {
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

app.post("/tareas", (req, res) => {
  const antes = structuredClone(tareas);
  // El ?. evita un error si la petición llegó sin cuerpo y req.body es undefined
  const titulo = req.body?.titulo;
  // El id es el mayor de los existentes más uno. Si no hay tareas, Math.max devuelve -Infinity, por eso ese caso arranca en 1
  const id = tareas.length > 0 ? Math.max(...tareas.map((t) => t.id)) + 1 : 1;
  // Se guarda el título sin los espacios de los extremos, igual que al validarlo
  const nueva: Tarea = { id, titulo: titulo.trim(), completada: false };
  tareas.push(nueva);
  registrar("POST /tareas", antes, 201, nueva);
  res.status(201).json(nueva);
});

app.get("/productos/:id", (req, res) => {
  const id = req.params.id;
  res.json({ id });
});

app.get("/externo/:id", async (req, res) => {
  const respuesta = await fetch(
    "https://dummyjson.com/products/" + req.params.id,
  );
  const producto = await respuesta.json();
  res.json(producto);
});

app.get("/error", (req, res, next) => {
  next(new Error("Error de prueba"));
});

app.put("/tareas/:id", (req, res) => {
  const antes = structuredClone(tareas);
  const tarea = tareas.find((t) => t.id === Number(req.params.id));
  if (!tarea) {
    const respuesta: ErrorRespuesta = { error: "Tarea no encontrada" };
    registrar("PUT /tareas/:id", antes, 404, respuesta);
    return res.status(404).json(respuesta);
  }

  const titulo = req.body?.titulo;
  const completada = req.body?.completada;

  // Agregá acá la validación de titulo y completada (paso 2)
  if (
    typeof titulo !== "string" ||
    titulo.trim() === "" ||
    typeof completada !== "boolean"
  ) {
    const respuesta: ErrorRespuesta = {
      error:
        "El título debe ser un texto no vacío y completada debe ser un booleano",
    };
    registrar("PUT /tareas/:id", antes, 400, respuesta);
    return res.status(400).json(respuesta);
  }

  // Se modifica el objeto que ya está dentro del array
  tarea.titulo = titulo.trim();
  tarea.completada = completada;
  registrar("PUT /tareas/:id", antes, 200, tarea);
  res.json(tarea);
});

app.delete("/tareas/:id", (req, res) => {
  const antes = structuredClone(tareas);
  const indice = tareas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) {
    const respuesta: ErrorRespuesta = { error: "Tarea no encontrada" };
    registrar("DELETE /tareas/:id", antes, 404, respuesta);
    return res.status(404).json(respuesta);
  }

  // Agregá acá el borrado de la tarea (paso 2)
  tareas.splice(indice, 1);

  registrar("DELETE /tareas/:id", antes, 204, null);
  res.status(204).send();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: "Algo salió mal" });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

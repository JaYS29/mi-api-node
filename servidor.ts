import express from "express";
import { appendFileSync } from "node:fs";
import type { Request, Response, NextFunction } from "express";

interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
}

interface ErrorRespuesta {
  error: string;
}
// Lo que puede devolver una operación: una tarea, la lista, un error, o nada (null)
type RespuestaTareas = Tarea | Tarea[] | ErrorRespuesta | null;

const tareas: Tarea[] = [
  { id: 1, titulo: "Aprender Express", completada: true },
  { id: 2, titulo: "Construir una API", completada: false },
];

function registrar(
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

const app = express();

app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
});

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

app.get("/tareas", (req, res) => {
  // structuredClone guarda una copia independiente del estado actual, no una referencia al mismo array
  const antes = structuredClone(tareas);
  registrar("GET /tareas", antes, 200, tareas);
  res.json(tareas);
});

app.get("/tareas/:id", (req, res) => {
  const tarea = tareas.find((t) => t.id === Number(req.params.id));
  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  res.json(tarea);
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: "Algo salió mal" });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

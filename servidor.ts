import express from "express";
import { appendFileSync } from "node:fs";
import type { Request, Response, NextFunction } from "express";
import { saludo } from "./middlewares/prueba.js";
console.log(saludo);

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

app.use(express.json());

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

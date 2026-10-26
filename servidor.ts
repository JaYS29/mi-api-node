import express from "express";

import { logger } from "./middlewares/logger.js";
import { manejadorErrores } from "./middlewares/manejadorErrores.js";
import { registrar } from "./registro.js";
import { saludo } from "./middlewares/prueba.js";
import { tareas } from "./datos.js";
import { rutasTareas } from "./rutas/tareas.js";

import type { RespuestaTareas, Tarea, ErrorRespuesta } from "./tipos.js";

console.log(saludo);

const app = express();

app.use(express.json());
app.use(logger);

app.use("/tareas", rutasTareas);

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

app.get("/productos/:id", (req, res) => {
  const id = req.params.id;
  res.json({ id });
});

app.get("/externo/:id", async (req, res, next) => {
  try {
    const respuesta = await fetch(
      "https://dummyjson.com/products/" + req.params.id,
    );
    if (!respuesta.ok) {
      return res
        .status(respuesta.status)
        .json({ error: "No se pudo obtener el producto" });
    }
    const producto = await respuesta.json();
    res.json(producto);
  } catch (error) {
    next(error);
  }
});

app.get("/buscar", async (req, res, next) => {
  const termino = req.query.q;
  if (!termino) {
    return res.status(400).json({ error: "Falta el parámetro de búsqueda q" });
  }
  try {
    const url =
      "https://dummyjson.com/products/search?q=" +
      encodeURIComponent(termino as string);
    const respuesta = await fetch(url);
    const resultado = await respuesta.json();
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

app.get("/categoria/:nombre", async (req, res, next) => {
  try {
    const respuesta = await fetch(
      "https://dummyjson.com/products/category/" + req.params.nombre,
    );
    if (!respuesta.ok) {
      return res
        .status(respuesta.status)
        .json({ error: "No se pudo obtener la categoría" });
    }
    const resultado = await respuesta.json();
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

app.get("/error", (req, res, next) => {
  next(new Error("Error de prueba"));
});

app.use(manejadorErrores);

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

import express from "express";

import { logger } from "./middlewares/logger.js";
import { manejadorErrores } from "./middlewares/manejadorErrores.js";
import { saludo } from "./middlewares/prueba.js";
import { rutasTareas } from "./rutas/tareas.js";

import { rutasExternas } from "./rutas/externas.js";

console.log(saludo);

const app = express();

app.use(express.json());
app.use(logger);

app.use("/tareas", rutasTareas);
app.use(rutasExternas);

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

app.get("/productos/:id", (req, res) => {
  const id = req.params.id;
  res.json({ id });
});

app.get("/error", (req, res, next) => {
  next(new Error("Error de prueba"));
});

app.use(manejadorErrores);

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

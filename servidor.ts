import express from "express";
import type { Request, Response, NextFunction } from "express";

const app = express();

app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
});

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

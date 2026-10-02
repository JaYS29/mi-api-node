import express from "express";

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

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

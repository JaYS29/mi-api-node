import { Router } from "express";

export const rutasExternas = Router();

rutasExternas.get("/externo/:id", async (req, res, next) => {
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

rutasExternas.get("/buscar", async (req, res, next) => {
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

rutasExternas.get("/categoria/:nombre", async (req, res, next) => {
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

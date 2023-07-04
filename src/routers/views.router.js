import express from "express";
import { manager } from "../DAO/manager/db/productManager.js";
import { manager as cManager } from "../DAO/manager/db/cartsManager.js";
import userModel from "../DAO/model/user.model.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("session/login");
});

router.get("/products", async (req, res) => {
  const limit = req.query.limit;
  const page = req.query.page;
  const query = req.query.query;
  const sort = req.query.sort;

  if (!req.session.user)
    return res.render("errors/base", {
      error: "No tienes los permisos para acceder a esta seccion.",
    });

  const mail = req.session.user.email;
  const nombre = req.session.user.first_name;
  const apellido = req.session.user.last_name;
  let rol = "";

  if (mail == "adminCoder@coder.com") {
    rol = "admin";
  } else {
    rol = "User";
  }

  let limite = "",
    consulta = "",
    orden = "";
  if (limit) limite = `&limit=${limit}`;
  if (query) consulta = `&query=${query}`;
  if (sort) orden = `&sort=${sort}`;

  manager.getProductosView(limit, page, query, sort).then((data) => {
    if (data) {
      let prevLink = "";
      let nextLink = "";
      data.hasPrevPage
        ? (prevLink = `/products?page=${data.prevPage}${limite}${consulta}${orden}`)
        : (prevLink = "");
      data.hasNextPage
        ? (nextLink = `/products?page=${data.nextPage}${limite}${consulta}${orden}`)
        : (nextLink = "");
      res.render("products", {
        data,
        prevLink,
        nextLink,
        mail,
        nombre,
        apellido,
        rol,
      });
    }
  });
});

router.get("/carts/:cid", (req, res) => {
  const cid = req.params.cid;
  cManager.getCartByIdView(cid).then((data) => {
    if (data) {
      res.render("cart", { cid, data });
    }
  });
});

export default router;

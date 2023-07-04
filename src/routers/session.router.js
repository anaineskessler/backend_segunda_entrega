import { Router } from "express";
import userModel from "../DAO/model/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";

const router = Router();

router.get("/register", (req, res) => {
  const email = req.session.email;
  if (email) {
    res.redirect("/products");
  } else {
    res.render("sessions/register");
  }
});

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/session/failureRegister",
  }),
  async (req, res) => {
    res.redirect("/session/login");
  }
);

router.get("/failureRegister", (req, res) => {
  res.render("errors/base", {
    error: "No se pudo registrar el usuario, el email ya existe.",
  });
});

router.get("/login", (req, res) => {
  const email = req.session.email;
  if (email) {
    res.redirect("/products");
  } else {
    res.render("sessions/login");
  }
});

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/session/failLogin" }),
  async (req, res) => {
    if (!req.user) {
      return res
        .status(400)
        .send({ status: "error", error: "Invalid credentials" });
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
    };
    res.redirect("/products");
  }
);

router.get("/failLogin", (req, res) => {
  res.render("errors/base", {
    error: "No se pudo iniciar sesión. Usuario o contraseña incorrecto.",
  });
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user: email"] }),
  (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/session/login" }),
  async (req, res) => {
    req.session.user = {
      first_name: req.user.first_name,
      age: req.user.age,
    };
    res.redirect("/products");
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("errors/base", { error: "Internal server error" });
    } else {
      res.redirect("/session/login");
    }
  });
});

export default router;

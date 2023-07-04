import { Router } from "express";
import userModel from "../DAO/model/user.model.js";

const router = Router();

router.get("/register", (req, res) => {
  const email = req.session.email;
  if (email) {
    res.redirect("/products");
  } else {
    res.render("sessions/register");
  }
});

router.post("/register", async (req, res) => {
  const userNew = req.body;
  const user = new userModel(userNew);
  await user.save();
  res.redirect("/session/login");
});

router.get("/login", (req, res) => {
  const email = req.session.email;
  if (email) {
    res.redirect("/products");
  } else {
    res.render("sessions/login");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel
    .findOne({ email: email, password: password })
    .lean()
    .exec();
  if (!user) {
    return res
      .status(401)
      .render("errors/base", { error: "Invalid email or password" });
  } else {
    req.session.email = user.email;
    res.redirect("/products");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("errors/base", { error: "Internal server error" });
    } else {
      res.redirect("/sessions/login");
    }
  });
});

export default router;

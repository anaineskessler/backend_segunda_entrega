import express from "express";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import productsRouter from "./routers/products.router.js";
import cartsRouter from "./routers/carts.router.js";
import viewsRouter from "./routers/views.router.js";
import chatRouter from "./routers/chat.router.js";
import sessionRouter from "./routers/session.router.js";
import mongoose from "mongoose";

import chatManager from "./DAO/manager/db/messagesManager.js";
import messageModel from "./DAO/model/mesagges.model.js";

import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

import cookieParser from "cookie-parser";

const uri = "mongodb+srv://coderhouse:coderhouse@cluster0.2x8nri1.mongodb.net/";

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: uri,
      dbName: "test",
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    }),
    secret: "c0d3rhous3",
    resave: true,
    saveUninitialized: true,
  })
);

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

app.use("/", viewsRouter);
app.use("/chat", chatRouter);
app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/session/", sessionRouter);

/*
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado!");
  manager.getProductos().then((data) => {
    if (data) {
      io.emit("resp-new-product", data);
    }
  });
  socket.on("new-product", (data) => {
    manager.addProduct(data).then((data) => {
      if (data == "406b") {
        socket.emit("resp-new-product", "El producto ya existe" );
      } else if (data == "406a") {
        socket.emit("resp-new-product", "Todos los campos son obligatorios" );
      } else {
        manager.getProductos().then((data) => {
          if (data) {
            io.emit("resp-new-product", data);
          }
        });
      }
    });
  });
  socket.on('delete-product', (id) => {
    manager.deleteProducto(parseInt(id)).then((data) => {
      if (data == 406) {
        socket.emit("resp-delete-product", "El producto no existe" );
      } else {
        manager.getProductos().then((data) => {
          if (data) {
            io.emit("resp-delete-product", data);
          }
        });
      }
    });
  });
});
*/

mongoose.set("strictQuery", false);

const httpServer = app.listen(8080, () => {
  console.log("Servidor HTTP escuchando en el puerto 8080");
});
const io = new Server(httpServer);

try {
  await mongoose.connect(uri);
  console.log("DB connected!");
} catch (err) {
  console.log("No se puede conectar a la BD");
}

let messages = [];
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado!");
  io.emit("messageLogs", messages);
  socket.on("message", (data) => {
    messages.push(data);
    io.emit("messageLogs", messages);
    let id = chatManager.getID();
    messageModel.updateOne({ _id: id }, { messages: messages }).then((data) => {
      console.log(data);
    });
  });
});

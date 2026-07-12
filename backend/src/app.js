import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors());

app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("AssetFlow Backend Running...");
});

export default app;
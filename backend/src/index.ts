import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productosRoutes from "./routes/productos.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/productos", productosRoutes);

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "price-tracker-api",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
});
import { Request, Response } from "express";
import { docClient } from "../config/dynamo";
import { PutCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

// post /api/productos - registrar nuevo producto
export async function crearProducto(req: Request, res: Response) {
    try {
        const { url, precio_objetivo, usuario_email, moneda = "USD" } = req.body || {};

        if (!url || !precio_objetivo) {
            return res.status(400).json({ error: "URL y precio objetivo son obligatorios" });
        }

        const nuevoProducto = {
            id_producto: randomUUID(),
            url,
            precio_objetivo,
            precio_actual: null,
            moneda,
            usuario_email: "4mrvro@gmail.com",
            estado: "ACTIVO",
            creado_en: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: "PRODUCTOS",
            Item: nuevoProducto
        }));

        res.status(201).json({
            mensaje: "Producto registrado con éxito",
            producto: nuevoProducto
        });
    } catch (error) {
        console.error("Error al registrar producto:", error);
        res.status(500).json({ error: "Error interno del backend" });
    }
}

// get /api/productos - listar productos
export async function listarProductos(req: Request, res: Response) {
    try {
        const respuesta = await docClient.send(new ScanCommand({
            TableName: "PRODUCTOS"
        }));

        res.json({
            total: respuesta.Items?.length || 0,
            productos: respuesta.Items || []
        });
    } catch (error) {
        console.error("Error al listar productos:", error);
        res.status(500).json({ error: "Error interno del backend" });
    }
}

// get /api/productos/:id/historial
export async function obtenerHistorial(req: Request, res: Response) {
    try {
        const { id_historial } = req.params;

        const respuesta = await docClient.send(new QueryCommand({
            TableName: "HISTORIAL_PRECIOS",
            KeyConditionExpression: "id_historial = :id_historial",
            ExpressionAttributeValues: {
                ":id_historial": id_historial
            },
            ScanIndexForward: true
        }));

        res.json({
            id_historial: id_historial,
            total_puntos: respuesta.Items?.length || 0,
            historial: respuesta.Items || []
        });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error interno del backend" });
    }
}
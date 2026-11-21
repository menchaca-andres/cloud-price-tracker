import { ProductoExtraido } from "./extraer";
import { docClient } from "./config/dynamo";
import { PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

interface Producto {
    id_producto: string;
    url: string;
    precio_objetivo: number;
    usuario_email?: string;
}

async function procesarProducto(producto: Producto) {
    console.log(`Procesando producto ID: ${producto.id_producto}`);

    try {
        // extraer datos con playwright
        const datos = await ProductoExtraido(producto.url);
        const timestamp = new Date().toISOString();

        console.log(`${datos.titulo}, | ${datos.precio} | ${datos.moneda}`);

        // guardar en la tabla HISTORIAL_PRECIOS
        await docClient.send(
            new PutCommand({
                TableName: "HISTORIAL_PRECIOS",
                Item: {
                    id_historial: producto.id_producto,
                    timestamp,
                    precio: datos.precio,
                    moneda: datos.moneda,
                    titulo: datos.titulo,
                    captura_ruta: datos.captura_ruta
                }
            })
        );

        await docClient.send(
            new UpdateCommand({
                TableName: "PRODUCTOS",
                Key: { id_producto: producto.id_producto },
                UpdateExpression: "SET precio_actual = :precio, titulo = :titulo, moneda = :moneda, ultima_revision = :fecha",
                ExpressionAttributeValues: {
                    ":precio": datos.precio,
                    ":titulo": datos.titulo,
                    ":moneda": datos.moneda,
                    ":fecha": timestamp
                }
            })
        );
        console.log("Historial guardado y producto actualizado en DynamoDB");

        // reglas de negocio
        if (datos.precio <= producto.precio_objetivo) {
            console.log(`Con oferta! Precio actual (${datos.precio}) <= Precio objetivo (${producto.precio_objetivo})`);
            console.log(`Notificación simulada enviada a ${producto.usuario_email}`);
        } else {
            console.log(`Sin oferta! recio actual (${datos.precio}) > Precio objetivo (${producto.precio_objetivo})`);
        }
    } catch (error) {
        console.log(`Error al procesar el producto ${producto.id_producto}:`, error);
    }
}

async function main() {
    console.log("Iniciando barrido de productos activos");

    try {
        const respuesta = await docClient.send(
            new ScanCommand({
                TableName: "PRODUCTOS",
                FilterExpression: "estado = :activo",
                ExpressionAttributeValues: {
                    ":activo": "ACTIVO"
                }
            })
        );

        const productos = (respuesta.Items as Producto[]) || [];

        for (const producto of productos) {
            await procesarProducto(producto);
        }

        console.log("Barrido de productos finalizado");
    } catch (error) {
        console.log("Error al consultar la tabla PRODUCTOS:", error);
    }
}

main();
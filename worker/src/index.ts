import { ProductoExtraido } from "./extraer";
import { docClient } from "./config/dynamo";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

async function procesarProducto(id_historial: string, url: string, precioObjetivo: number) {
    console.log(`Procesando producto ID: ${id_historial}`);

    try {
        // extraer datos con playwright
        const datos = await ProductoExtraido(url);
        const timestamp = new Date().toISOString();

        console.log(`${datos.titulo}, | ${datos.precio} | ${datos.moneda}`);

        // guardar en la tabla HISTORIAL_PRECIOS
        await docClient.send(
            new PutCommand({
                TableName: "HISTORIAL_PRECIOS",
                Item: {
                    id_historial,
                    timestamp,
                    precio: datos.precio,
                    moneda: datos.moneda,
                    titulo: datos.titulo,
                    captura_ruta: datos.captura_ruta
                }
            })
        );
        console.log("Historial guardado en DynamoDB con éxito");

        // reglas de negocio
        if (datos.precio <= precioObjetivo) {
            console.log(`Con oferta! Precio actual (${datos.precio}) <= Precio objetivo (${precioObjetivo})`);
            console.log(`Notificación simulada enviada al usuario`);
        } else {
            console.log(`Sin oferta! recio actual (${datos.precio}) > Precio objetivo (${precioObjetivo})`);
        }
    } catch (error) {
        console.log("Error al procesar el producto:", error);
    }
}

// producto simulado
async function main() {
    const testProductoId = "prod-101";
    const testUrl = "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html";
    const testPrecioObjetivo = 60;
    console.log("Iniciando prueba del worker de extracción");

    await procesarProducto(testProductoId, testUrl, testPrecioObjetivo);
}

main();
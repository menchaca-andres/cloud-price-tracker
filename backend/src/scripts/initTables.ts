import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../config/dynamo";

async function createTables() {
    // tabla PRODUCTOS
    try {
        await client.send(
            new CreateTableCommand({
                TableName: "PRODUCTOS",
                KeySchema: [
                    { AttributeName: "id_producto", KeyType: "HASH" }
                ],
                AttributeDefinitions: [
                    { AttributeName: "id_producto", AttributeType: "S" }
                ],
                BillingMode: "PAY_PER_REQUEST"
            })
        );
        console.log("Tabla PRODUCTOS creada exitosamente");
    } catch (error: any) {
        if (error.name === "ResourceInUseException") {
            console.log("La tabla PRODUCTOS ya existe");
        } else {
            console.error("Error al crear la tabla PRODUCTOS: ", error);
        }
    }

    //tabla HISTORIAL_PRECIOS
    try {
        await client.send(
            new CreateTableCommand({
                TableName: "HISTORIAL_PRECIOS",
                KeySchema: [
                    { AttributeName: "id_historial", KeyType: "HASH" },
                    { AttributeName: "timestamp", KeyType: "RANGE" }
                ],
                AttributeDefinitions: [
                    { AttributeName: "id_historial", AttributeType: "S" },
                    { AttributeName: "timestamp", AttributeType: "S" }
                ],
                BillingMode: "PAY_PER_REQUEST"
            })
        );
        console.log("Tabla HISTORIAL_PRECIOS creada exitosamente");
    } catch (error: any) {
        if (error.name === "ResourceInUseException") {
            console.log("La tabla HISTORIAL_PRECIOS ya existe");
        } else {
            console.log("Error al crear la tabla HISTORIAL_PRECIOS: ", error);
        }
    }
}

createTables();
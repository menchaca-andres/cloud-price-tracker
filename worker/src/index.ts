import { ProductoExtraido } from "./extraer";

async function main() {
    const testUrl = "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html";
    console.log("Iniciando prueba del worker de extracción");

    try {
        const datos = await ProductoExtraido(testUrl);
        console.log("DATOS EXTRAIDOS:");
        console.log(`Producto: ${datos.titulo}`);
        console.log(`Precio: ${datos.precio} ${datos.moneda}`);
        console.log(`Captura guardada en: ${datos.captura_ruta}`);
    } catch (error) {
        console.log("Error durante la extracción:", error);
    }
}

main();
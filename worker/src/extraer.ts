import { chromium } from "playwright";

export interface DatosExtraidos {
    titulo: string;
    precio: number;
    moneda: string;
    captura_ruta: string;
};

// funcion para detectar la moneda
function detectarMoneda(precioFila: string): string {
    if (precioFila.includes("£")) return "GBP";
    if (precioFila.includes("€")) return "EUR";
    if (precioFila.includes("Bs") || precioFila.includes("BOB")) return "BOB";
    if (precioFila.includes("$")) return "USD";
    return "USD";
}

export async function ProductoExtraido(url: string): Promise<DatosExtraidos> {
    console.log(`Abriendo navegador para la url: ${url}`);

    const navegador = await chromium.launch({ headless: true });
    const contexto = await navegador.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    });

    const pagina = await contexto.newPage();

    try {
        await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

        // extraer titulo
        const titulo = (await pagina.locator("h1").first().textContent())?.trim() || "Sin título";

        // extraer precio
        const precioTexto = (await pagina.locator(".price_color, .a-price-whole, [data-price]").first().textContent()) || "0";

        // limpiar caracteres y convertir a numero
        const precioNumerico = parseFloat(precioTexto.replace(/[^0-9.]/g, "")) || 0;

        // detectar la moneda
        const moneda = detectarMoneda(precioTexto);

        // tomar captura
        const captura_ruta = `captura-${Date.now()}.png`;
        await pagina.screenshot({ path: captura_ruta });

        return {
            titulo,
            precio: precioNumerico,
            moneda,
            captura_ruta
        };
    } finally {
        await navegador.close();
    }
}
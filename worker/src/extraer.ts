import { chromium } from "playwright";

export interface DatosExtraidos {
  titulo: string;
  precio: number;
  moneda: string;
  captura_ruta: string;
}

function detectarMoneda(texto: string): string {
  if (texto.includes("£") || texto.includes("GBP")) return "GBP";
  if (texto.includes("€") || texto.includes("EUR")) return "EUR";
  if (texto.includes("Bs") || texto.includes("BOB")) return "BOB";
  if (texto.includes("S/")) return "PEN";
  if (texto.includes("USD") || texto.includes("$")) return "USD";
  return "USD";
}

function parsearPrecio(textoCrudo: string): number {
  const limpio = textoCrudo.replace(/[^0-9.,]/g, "").trim();
  if (!limpio) return 0;

  // si tiene coma y punto, determinamos cuál es el separador decimal
  if (limpio.includes(",") && limpio.includes(".")) {
    const ultimoPunto = limpio.lastIndexOf(".");
    const ultimaComa = limpio.lastIndexOf(",");
    if (ultimaComa > ultimoPunto) {
      // Formato 1.299,50 -> 1299.50
      return parseFloat(limpio.replace(/\./g, "").replace(",", ".")) || 0;
    }
    // formato 1,299.50 -> 1299.50
    return parseFloat(limpio.replace(/,/g, "")) || 0;
  }

  // si solo tiene coma (ej: "51,77" o "1,299")
  if (limpio.includes(",")) {
    const partes = limpio.split(",");
    if (partes[partes.length - 1].length === 2) {
      return parseFloat(limpio.replace(",", ".")) || 0;
    }
    return parseFloat(limpio.replace(/,/g, "")) || 0;
  }

  return parseFloat(limpio) || 0;
}

export async function ProductoExtraido(url: string): Promise<DatosExtraidos> {
  console.log(`Abriendo navegador para la url: ${url}`);

  const navegador = await chromium.launch({ headless: true });
  const contexto = await navegador.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  const pagina = await contexto.newPage();

  try {
    await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Pequeña espera para contenido dinámico SPA sin bloquear demasiado
    await pagina.waitForTimeout(1500);

    const resultado = await pagina.evaluate(() => {
      let titulo = "";
      let precioRaw = "";
      let moneda = "";

      // JSON-LD (datos estructurados para Google Shopping)
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || "{}");
          const items = Array.isArray(data) ? data : data["@graph"] || [data];
          for (const item of items) {
            if (item["@type"] === "Product" || (Array.isArray(item["@type"]) && item["@type"].includes("Product"))) {
              titulo = item.name || titulo;
              const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offers) {
                precioRaw = String(offers.price ?? offers.lowPrice ?? "");
                moneda = offers.priceCurrency || "";
              }
              if (precioRaw) break;
            }
          }
          if (precioRaw) break;
        } catch {
          // ignorar JSON-LD malformado
        }
      }

      // meta tags OpenGraph / Schema.org
      if (!precioRaw) {
        const metaPrecio = document.querySelector(
          'meta[property="product:price:amount"], meta[property="og:price:amount"], [itemprop="price"]'
        );
        if (metaPrecio) {
          precioRaw = metaPrecio.getAttribute("content") || metaPrecio.textContent || "";
        }
        const metaMoneda = document.querySelector(
          'meta[property="product:price:currency"], meta[property="og:price:currency"], [itemprop="priceCurrency"]'
        );
        if (metaMoneda) {
          moneda = metaMoneda.getAttribute("content") || metaMoneda.textContent || "";
        }
      }

      // selectores CSS comunes
      if (!precioRaw) {
        const selectoresPrecio = [
          ".andes-money-amount__fraction",
          ".woocommerce-Price-amount bdi",
          ".woocommerce-Price-amount",
          ".price__current .money",
          ".product-price",
          ".price_color",
          ".a-price .a-offscreen",
          ".a-price-whole",
          "[data-price]",
          ".price",
        ];
        for (const sel of selectoresPrecio) {
          const el = document.querySelector(sel);
          if (el && el.textContent?.trim()) {
            precioRaw = el.textContent.trim();
            break;
          }
        }
      }

      if (!titulo) {
        const h1 = document.querySelector("h1");
        const ogTitle = document.querySelector('meta[property="og:title"]');
        titulo =
          h1?.textContent?.trim() ||
          ogTitle?.getAttribute("content")?.trim() ||
          document.title ||
          "Sin título";
      }

      return { titulo, precioRaw, moneda };
    });

    const precioNumerico = parsearPrecio(resultado.precioRaw);
    const monedaFinal = resultado.moneda || detectarMoneda(resultado.precioRaw);

    const captura_ruta = `captura-${Date.now()}.png`;
    await pagina.screenshot({ path: captura_ruta });

    return {
      titulo: resultado.titulo,
      precio: precioNumerico,
      moneda: monedaFinal,
      captura_ruta,
    };
  } finally {
    await navegador.close();
  }
}
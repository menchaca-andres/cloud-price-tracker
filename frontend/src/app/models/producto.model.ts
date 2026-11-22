export interface Producto {
  id_producto: string;
  url: string;
  titulo?: string;
  precio_objetivo: number;
  precio_actual: number | null;
  moneda: string;
  estado: string;
  ultima_revision?: string;
}

export interface CrearProductoDto {
  url: string;
  precio_objetivo: number;
  moneda: string;
}

export interface PuntoHistorial {
  id_historial: string;
  timestamp: string;
  precio: number;
  moneda: string;
  titulo: string;
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearProductoDto, Producto, PuntoHistorial } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  // detectar si está en local o en producción
  // private apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/productos' : 'http://52.200.215.119:3000/api/productos';
  private apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/productos' : 'http://54.242.233.172:3000/api/productos';

  listar(): Observable<{ total: number; productos: Producto[] }> {
    return this.http.get<{ total: number; productos: Producto[] }>(this.apiUrl);
  }

  crear(data: CrearProductoDto): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  obtenerHistorial(id: string): Observable<{ historial: PuntoHistorial[] }> {
    return this.http.get<{ historial: PuntoHistorial[] }>(`${this.apiUrl}/${id}/historial`);
  }
}

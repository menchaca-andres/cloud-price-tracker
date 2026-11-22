import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearProductoDto, Producto, PuntoHistorial } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/productos';

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

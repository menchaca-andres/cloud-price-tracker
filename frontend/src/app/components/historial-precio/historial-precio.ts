import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Producto, PuntoHistorial } from '../../models/producto.model';

@Component({
    selector: 'app-historial-precio',
    imports: [DatePipe],
    templateUrl: './historial-precio.html',
    styleUrl: './historial-precio.scss',
})
export class HistorialPrecio {
    producto = input.required<Producto>();
    historial = input.required<PuntoHistorial[]>();
}

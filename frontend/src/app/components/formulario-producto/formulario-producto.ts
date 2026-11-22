import { Component, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CrearProductoDto } from "../../models/producto.model";

@Component({
    selector: 'app-formulario-producto',
    imports: [FormsModule],
    templateUrl: './formulario-producto.html',
    styleUrl: './formulario-producto.scss'
})
export class FormularioProducto {
    crearProducto = output<CrearProductoDto>();
    url = '';
    precioObjetivo: number | null = null;
    moneda = 'USD';

    enviar() {
        if (!this.url || !this.precioObjetivo) return;
        this.crearProducto.emit({
            url: this.url,
            precio_objetivo: this.precioObjetivo,
            moneda: this.moneda
        });
        this.url = '';
        this.precioObjetivo = null;
    }
}
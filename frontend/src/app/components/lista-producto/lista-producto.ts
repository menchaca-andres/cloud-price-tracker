import { Component, input, output } from "@angular/core";
import { Producto } from "../../models/producto.model";

@Component({
    selector: 'app-lista-producto',
    templateUrl: './lista-producto.html',
    styleUrl: './lista-producto.scss'
})
export class ListaProducto {
    productos = input.required<Producto[]>();
    cargando = input<boolean>(false);

    actualizar = output<void>();
    seleccionar = output<Producto>();
}
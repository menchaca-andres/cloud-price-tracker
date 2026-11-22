import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductosService } from './services/productos.service';
import { CrearProductoDto, Producto, PuntoHistorial } from './models/producto.model';
import { FormularioProducto } from './components/formulario-producto/formulario-producto';
import { ListaProducto } from './components/lista-producto/lista-producto';
import { HistorialPrecio } from './components/historial-precio/historial-precio';

@Component({
  selector: 'app-root',
  imports: [FormularioProducto, ListaProducto, HistorialPrecio],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private productosService = inject(ProductosService);

  productos = signal<Producto[]>([]);
  historialSeleccionado = signal<PuntoHistorial[]>([]);
  productoActivo = signal<Producto | null>(null);
  cargando = signal(false);

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.productosService.listar().subscribe({
      next: (res) => {
        this.productos.set(res.productos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onCrearProducto(dto: CrearProductoDto) {
    this.productosService.crear(dto).subscribe(() => this.cargarProductos());
  }

  onVerHistorial(producto: Producto) {
    this.productoActivo.set(producto);
    this.productosService.obtenerHistorial(producto.id_producto).subscribe((res) => {
      this.historialSeleccionado.set(res.historial);
    });
  }
}

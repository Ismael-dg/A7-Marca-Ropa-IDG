package com.ismael.tienda_ropa;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. ESTO ES LO QUE TE FALTA: Permite cargar la tabla al inicio
    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // 2. Para añadir productos nuevos
    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        System.out.println("Recibido para guardar: " + producto.getNombre());
        return productoRepository.save(producto);
    }

    // 3. Para borrar productos
    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Integer id) {
        System.out.println("Eliminando ID: " + id);
        productoRepository.deleteById(id);
    }
}
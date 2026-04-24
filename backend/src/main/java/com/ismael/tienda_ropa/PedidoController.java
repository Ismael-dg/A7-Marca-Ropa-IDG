package com.ismael.tienda_ropa;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {
    @Autowired
    private PedidoRepository pedidoRepository;

    @PostMapping
    public Pedido crearPedido(@RequestBody Pedido pedido) {
        pedido.setFechaPedido(LocalDateTime.now());
        return pedidoRepository.save(pedido);
    }

    @GetMapping
    public List<Pedido> obtenerHistorial() {
        return pedidoRepository.findAll();
    }
}
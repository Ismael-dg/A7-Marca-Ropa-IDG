package com.ismael.tienda_ropa;

import jakarta.persistence.*;

@Entity
@Table(name = "PRODUCTO") // Asegúrate de que el nombre sea igual al de phpMyAdmin
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Integer id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "precio")
    private Double precio;

    @Column(name = "url_imagen") // Cambia esto si en tu tabla se llama distinto
    private String imagen;

    // Getters y Setters (Asegúrate de que existan)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}
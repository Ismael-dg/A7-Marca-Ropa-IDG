DROP DATABASE IF EXISTS Marca_Ropa_IDG;
CREATE DATABASE Marca_Ropa_IDG;

USE Marca_Ropa_IDG;

DROP USER IF EXISTS 'BD_admin'@'localhost';
CREATE USER 'BD_admin'@'localhost' IDENTIFIED BY 'BD_admin';
-- Concede todos los privilegios al usuario sobre la base de datos
GRANT ALL PRIVILEGES ON Marca_Ropa_IDG.* TO 'BD_admin'@'localhost';
FLUSH PRIVILEGES;

-- CREACIÓN DE LA BASE DE DATOS

-- Tabla ADMINISTRADOR: almacena datos de los administradores de la tienda
CREATE TABLE ADMINISTRADOR (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY COMMENT 'PK: Identificador único del administrador', 
    dni VARCHAR(15) NOT NULL UNIQUE COMMENT 'DNI único del administrador', 
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo', 
    correo VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo electrónico', 
    contraseña VARCHAR(255) NOT NULL COMMENT 'Hash de contraseña', 
    dirección VARCHAR(200) COMMENT 'Dirección física', 
    teléfono VARCHAR(20) COMMENT 'Teléfono de contacto', 
    fecha_registro DATE DEFAULT (CURRENT_DATE) COMMENT 'Fecha de alta', 
    permisos VARCHAR(50) COMMENT 'Rol/Permisos del administrador' 
) COMMENT='Tabla que almacena a los administradores de la tienda';

-- Tabla CLIENTE: información de clientes registrados
CREATE TABLE CLIENTE (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY COMMENT 'PK: Identificador único del cliente', 
    dni VARCHAR(15) NOT NULL UNIQUE, 
    nombre VARCHAR(100) NOT NULL, 
    correo VARCHAR(100) NOT NULL UNIQUE, 
    contraseña VARCHAR(255) NOT NULL, 
    dirección VARCHAR(200), 
    teléfono VARCHAR(20), 
    fecha_registro DATE DEFAULT (CURRENT_DATE), 
    INDEX idx_cliente_correo (correo) 
) COMMENT='Tabla que almacena los clientes registrados';

-- Tabla GESTIONA: relación entre administradores y clientes
CREATE TABLE GESTIONA (
    id_usuario_administrador INT, 
    id_usuario_cliente INT, 
    PRIMARY KEY (id_usuario_administrador, id_usuario_cliente), 
    CONSTRAINT fk_gestiona_admin FOREIGN KEY (id_usuario_administrador) REFERENCES ADMINISTRADOR(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE, 
    CONSTRAINT fk_gestiona_cliente FOREIGN KEY (id_usuario_cliente) REFERENCES CLIENTE(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE 
) COMMENT='Relación de gestión entre administradores y clientes';

-- Tabla PRODUCTO: productos disponibles en la tienda
CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY, 
    nombre VARCHAR(100) NOT NULL, 
    descripcion TEXT, 
    precio DECIMAL(10,2) NOT NULL, 
    stock INT NOT NULL, 
    categoría VARCHAR(50), 
    url_imagen VARCHAR(255) DEFAULT 'default.jpg' COMMENT 'Ruta de la imagen del producto',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Soft delete: FALSE si se deja de vender'
) COMMENT='Productos disponibles en la tienda';

-- Tabla CARRITO_COMPRA: carritos de compra por cliente
CREATE TABLE CARRITO_COMPRA (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY, 
    id_cliente INT NOT NULL, 
    fecha_creación DATE DEFAULT (CURRENT_DATE), 
    fecha_modificación DATE, 
    total DECIMAL(10,2), 
    CONSTRAINT fk_carrito_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE 
) COMMENT='Carritos de compra por cliente';

-- Tabla DETALLE_CARRITO: productos añadidos al carrito
CREATE TABLE DETALLE_CARRITO (
    id_detalles_carrito INT AUTO_INCREMENT PRIMARY KEY, 
    id_carrito INT NOT NULL, 
    id_producto INT NOT NULL, 
    cantidad INT NOT NULL CHECK (cantidad > 0), 
    precio_unitario DECIMAL(10,2) NOT NULL, 
    CONSTRAINT fk_detalle_carrito FOREIGN KEY (id_carrito) REFERENCES CARRITO_COMPRA(id_carrito)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE
) COMMENT='Detalle de productos dentro de un carrito';

-- Tabla PEDIDO: pedidos realizados por clientes
CREATE TABLE PEDIDO (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY, 
    id_cliente INT NOT NULL, 
    id_carrito INT, 
    estado ENUM('Pendiente', 'Pagado', 'En preparación', 'Enviado', 'En reparto', 'Entregado', 'Cancelado') DEFAULT 'Pendiente', 
    fecha_pedido DATE DEFAULT (CURRENT_DATE), 
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pedido_carrito FOREIGN KEY (id_carrito) REFERENCES CARRITO_COMPRA(id_carrito)
        ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT='Pedidos realizados por los clientes';

-- Tabla DESCUENTO: descuentos aplicados a pedidos
CREATE TABLE DESCUENTO (
    id_descuento INT AUTO_INCREMENT PRIMARY KEY, 
    id_pedido INT NOT NULL, 
    codigo_descuento VARCHAR(50), 
    porcentaje_descuento DECIMAL(5,2) CHECK (porcentaje_descuento BETWEEN 0 AND 100), 
    fecha_inicio DATE, 
    fecha_fin DATE, 
    CONSTRAINT fk_descuento_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Descuentos aplicados a pedidos';

-- Tabla PAGO: pagos registrados para pedidos
CREATE TABLE PAGO (
    id_pago INT AUTO_INCREMENT PRIMARY KEY, 
    id_pedido INT NOT NULL, 
    monto DECIMAL(10,2), 
    fecha_pago DATE DEFAULT (CURRENT_DATE), 
    método VARCHAR(50), 
    CONSTRAINT fk_pago_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Pagos registrados para pedidos';

-- Tabla PASARELA_PAGO: plataformas usadas para pagos
CREATE TABLE PASARELA_PAGO (
    id_pasarela INT AUTO_INCREMENT PRIMARY KEY, 
    id_pago INT NOT NULL, 
    nombre VARCHAR(50), 
    comision DECIMAL(5,2), 
    CONSTRAINT fk_pasarela_pago FOREIGN KEY (id_pago) REFERENCES PAGO(id_pago)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Pasarelas de pago utilizadas en las transacciones';

-- Tabla NOTIFICACION: mensajes enviados a clientes
CREATE TABLE NOTIFICACION (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY, 
    id_administrador INT NOT NULL, 
    id_usuario INT NOT NULL, 
    fecha_notificacion DATE DEFAULT (CURRENT_DATE), 
    leido BOOLEAN DEFAULT FALSE, 
    mensaje TEXT, 
    CONSTRAINT fk_notificacion_admin FOREIGN KEY (id_administrador) REFERENCES ADMINISTRADOR(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario) REFERENCES CLIENTE(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Notificaciones enviadas a clientes desde administradores';

-- Tabla RESEÑA: reseñas de productos por parte de clientes
CREATE TABLE RESEÑA (
    id_reseña INT AUTO_INCREMENT PRIMARY KEY, 
    id_cliente INT NOT NULL, 
    id_producto INT NOT NULL, 
    id_administrador INT, 
    comentario TEXT, 
    fecha_reseña DATE DEFAULT (CURRENT_DATE), 
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5), 
    CONSTRAINT fk_reseña_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reseña_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reseña_admin FOREIGN KEY (id_administrador) REFERENCES ADMINISTRADOR(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT='Reseñas de productos por parte de los clientes';

-- Tabla RECOMENDACION: recomendaciones entre administradores y clientes
CREATE TABLE RECOMENDACION (
    id_recomendacion INT AUTO_INCREMENT PRIMARY KEY, 
    id_administrador INT NOT NULL, 
    id_cliente INT NOT NULL, 
    razon_recomendacion TEXT, 
    CONSTRAINT fk_recomendacion_admin FOREIGN KEY (id_administrador) REFERENCES ADMINISTRADOR(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recomendacion_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Recomendaciones hechas por los administradores';

-- Tabla RECOMENDADO: productos relacionados por temporada
CREATE TABLE RECOMENDADO (
    temporada VARCHAR(20), 
    id_producto_recomienda INT, 
    id_producto_es_recomendado INT, 
    PRIMARY KEY (temporada, id_producto_recomienda, id_producto_es_recomendado), 
    CONSTRAINT fk_recomendado_recomienda FOREIGN KEY (id_producto_recomienda) REFERENCES PRODUCTO(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recomendado_es_recomendado FOREIGN KEY (id_producto_es_recomendado) REFERENCES PRODUCTO(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT='Relación de productos recomendados según temporada';

-- POBLAR LA BASE DE DATOS

INSERT INTO ADMINISTRADOR (dni, nombre, correo, contraseña, dirección, teléfono, permisos) VALUES
('12345678A', 'Laura Gómez', 'laura.gomez@isdega.com', 'Laura1234', 'Calle Mayor 15, Madrid', '600123456', 'superadmin'),
('23456789B', 'Carlos Pérez', 'carlos.perez@isdega.com', 'Carlos5678', 'Avenida del Sol 7, Valencia', '600234567', 'admin'),
('34567890C', 'Marta Sánchez', 'marta.sanchez@isdega.com', 'Marta9876', 'Calle Luna 3, Sevilla', '600345678', 'admin'),
('45678901D', 'Diego Ruiz', 'diego.ruiz@isdega.com', 'Diego4321', 'Paseo del Río 21, Zaragoza', '600456789', 'editor'),
('56789012E', 'Elena Torres', 'elena.torres@isdega.com', 'Elena2468', 'Calle Olmo 10, Bilbao', '600567890', 'admin');

INSERT INTO CLIENTE (dni, nombre, correo, contraseña, dirección, teléfono) VALUES
('98765432Z', 'Ana López', 'ana.lopez@gmail.com', 'Ana1234', 'Calle Nube 2, Málaga', '611123456'),
('87654321Y', 'Javier Martínez', 'javier.martinez@gmail.com', 'Javier5678', 'Calle Fuente 8, Alicante', '611234567'),
('76543210X', 'Lucía Fernández', 'lucia.fernandez@gmail.com', 'Lucia9876', 'Avenida del Mar 11, Murcia', '611345678'),
('65432109W', 'David Gómez', 'david.gomez@gmail.com', 'David4321', 'Calle Jardín 6, Valladolid', '611456789'),
('54321098V', 'Sara Morales', 'sara.morales@gmail.com', 'Sara2468', 'Paseo Verde 14, Granada', '611567890');

INSERT INTO PRODUCTO (nombre, descripcion, precio, stock, categoría) VALUES
('Camiseta básica', 'Camiseta de algodón 100% en varios colores', 12.99, 100, 'Ropa mujer'),
('Pantalón vaquero', 'Pantalón vaquero azul de corte slim', 29.99, 60, 'Ropa hombre'),
('Sudadera con capucha', 'Sudadera unisex con capucha y bolsillos', 34.90, 80, 'Ropa unisex'),
('Vestido de verano', 'Vestido estampado de tirantes, tela ligera', 39.95, 50, 'Ropa mujer'),
('Chaqueta deportiva', 'Chaqueta ligera para deporte o casual', 49.99, 40, 'Ropa hombre');

INSERT INTO CARRITO_COMPRA (id_cliente, total) VALUES
(1, 45.98), (2, 12.99), (3, 64.89), (4, 39.95), (5, 49.99);

INSERT INTO DETALLE_CARRITO (id_carrito, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 2, 12.99), (1, 2, 1, 29.99), (2, 1, 1, 12.99), (3, 2, 2, 29.99), (3, 3, 1, 34.90);

INSERT INTO PEDIDO (id_cliente, id_carrito, estado) VALUES
(1, 1, 'Entregado'), (2, 2, 'En preparación'), (3, 3, 'En reparto'), (4, 4, 'Entregado'), (5, 5, 'Cancelado');

INSERT INTO DESCUENTO (id_pedido, codigo_descuento, porcentaje_descuento, fecha_inicio, fecha_fin) VALUES
(1, 'VERANO10', 10.00, '2025-04-01', '2025-04-30'),
(2, 'BIENVENIDO15', 15.00, '2025-01-01', '2025-06-30'),
(3, 'PRIMAVERA5', 5.00, '2025-03-01', '2025-04-30'),
(4, 'MAYO20', 20.00, '2025-05-01', '2025-05-31'),
(5, 'CANCELADO25', 25.00, '2025-04-01', '2025-04-30');

INSERT INTO PAGO (id_pedido, monto, método) VALUES
(1, 41.38, 'Tarjeta'), (2, 11.04, 'PayPal'), (3, 61.65, 'Transferencia'), (4, 31.96, 'Tarjeta'), (5, 37.49, 'Reembolso');

INSERT INTO PASARELA_PAGO (id_pago, nombre, comision) VALUES
(1, 'Stripe', 2.00), (2, 'PayPal', 3.50), (3, 'Redsys', 1.75), (4, 'Stripe', 2.00), (5, 'PayPal', 3.50);

INSERT INTO NOTIFICACION (id_administrador, id_usuario, mensaje) VALUES
(1, 1, 'Tu pedido ha sido entregado. ¡Gracias por comprar en Ayexus!'),
(2, 2, 'Tu pedido está en preparación.'),
(3, 3, 'Tu pedido ha salido en reparto.'),
(4, 4, '¡Gracias por tu compra! Esperamos que vuelvas.'),
(5, 5, 'Tu pedido ha sido cancelado por falta de stock.');

INSERT INTO RESEÑA (id_cliente, id_producto, id_administrador, comentario, calificacion) VALUES
(1, 1, 1, 'Buena calidad y envío rápido.', 5),
(2, 2, 2, 'Corte muy cómodo y moderno.', 4),
(3, 3, 3, 'Un poco ajustado de talla.', 3),
(4, 4, 4, 'Perfecto para el verano.', 5),
(5, 5, 5, 'Cumple su función, pero esperaba más.', 3);

INSERT INTO RECOMENDACION (id_administrador, id_cliente, razon_recomendacion) VALUES
(1, 1, 'Suele comprar ropa básica. Recomendamos camisetas y sudaderas.'),
(2, 2, 'Ha comprado jeans. Se le recomienda chaquetas casual.'),
(3, 3, 'Cliente con pedidos frecuentes. Promocionar descuentos.'),
(4, 4, 'Compras deportivas. Sugerir chaquetas y sudaderas.'),
(5, 5, 'Perfil joven. Recomendamos ropa moderna y de temporada.');

INSERT INTO RECOMENDADO (temporada, id_producto_recomienda, id_producto_es_recomendado) VALUES
('Verano', 1, 4), ('Primavera', 2, 3), ('Invierno', 5, 3), ('Otoño', 2, 5), ('Verano', 3, 1);


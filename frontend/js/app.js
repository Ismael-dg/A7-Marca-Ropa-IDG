let productosCatalogo = [];
let carrito = [];

// 1. Cargar productos desde tu API de Java
fetch('http://localhost:8080/api/productos')
    .then(response => response.json())
    .then(data => {
        productosCatalogo = data;
        renderizarCatalogo();
    })
    .catch(error => console.error('Error al cargar productos:', error));

// 2. Pintar los productos en pantalla
function renderizarCatalogo() {
    const contenedor = document.getElementById('catalogo');
    contenedor.innerHTML = '';

    productosCatalogo.forEach(p => {
        // Obtenemos la URL de la imagen (p.urlImagen es el nombre exacto de tu Entidad Java)
        const urlImagen = p.urlImagen;

        contenedor.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="card card-producto h-100 shadow-sm">
                    <img src="${urlImagen}" class="card-img-top" alt="${p.nombre}">
                    <div class="card-body card-body-producto d-flex flex-column">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text text-muted">${p.descripcion}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="precio">${p.precio} €</span>
                            <button onclick="agregarAlCarrito(${p.id})" class="btn btn-primary btn-sm">Añadir al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// 3. Lógica del carrito mejorada (con contador de cantidad)
function agregarAlCarrito(id) {
    // Buscamos si el producto YA ESTÁ en el carrito
    const productoExistente = carrito.find(p => p.id === id);

    if (productoExistente) {
        // Si ya está, solo le sumamos 1 a la cantidad
        productoExistente.cantidad++;
    } else {
        // Si no está, lo buscamos en el catálogo
        const productoNuevo = productosCatalogo.find(p => p.id === id);
        if (productoNuevo) {
            // Lo metemos en el carrito añadiéndole una propiedad "cantidad" que empieza en 1
            carrito.push({ ...productoNuevo, cantidad: 1 });
        }
    }

    actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalElemento = document.getElementById('total-carrito');
    
    lista.innerHTML = '';
    let total = 0;

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;
        
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${p.urlImagen}" alt="${p.nombre}" 
                         style="width: 50px; height: 50px; object-fit: contain; margin-right: 15px; border-radius: 8px; background-color: #f8f9fa; padding: 2px; border: 1px solid #eee;">
                    <div>
                        <span class="d-block">${p.nombre}</span>
                        <span class="badge bg-dark rounded-pill">x${p.cantidad}</span>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="fw-bold text-primary me-3">${subtotal.toFixed(2)} €</span>
                    
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="restarCantidad(${p.id})">-</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${p.id})">🗑️</button>
                </div>
            </li>
        `;
    });

    totalElemento.innerText = total.toFixed(2) + ' €';
}

// Función para restar 1 a la cantidad
function restarCantidad(id) {
    const producto = carrito.find(p => p.id === id);
    if (producto) {
        if (producto.cantidad > 1) {
            producto.cantidad--; // Le restamos 1
        } else {
            eliminarProducto(id); // Si solo queda 1 y le damos a restar, lo borramos del todo
        }
        actualizarVistaCarrito(); // Refrescamos la vista
    }
}

// Función para eliminar el producto del carrito completamente
function eliminarProducto(id) {
    // Sobrescribimos el carrito con todos los productos MENOS el que queremos borrar
    carrito = carrito.filter(p => p.id !== id);
    actualizarVistaCarrito(); // Refrescamos la vista
}

// ==========================================
// NUEVA FUNCIONALIDAD A8: Lógica del Buscador
// ==========================================
document.getElementById('buscador-productos').addEventListener('input', function(e) {
    // 1. Guardamos lo que el usuario está escribiendo y lo pasamos a minúsculas
    const textoBuscado = e.target.value.toLowerCase();

    // 2. Seleccionamos todas las tarjetas de productos de la pantalla
    const tarjetasProductos = document.querySelectorAll('.card');

    // 3. Recorremos cada tarjeta para ver si coincide con la búsqueda
    tarjetasProductos.forEach(tarjeta => {
        // Buscamos el título del producto dentro de la tarjeta
        const titulo = tarjeta.querySelector('.card-title') ? tarjeta.querySelector('.card-title').innerText.toLowerCase() : '';

        // Si el título incluye lo que hemos escrito, mostramos la tarjeta, si no, la ocultamos
        if (titulo.includes(textoBuscado)) {
            tarjeta.parentElement.style.display = 'block'; // Mostrar
        } else {
            tarjeta.parentElement.style.display = 'none';  // Ocultar
        }
    });
});

// ==========================================
// App.js - Lógica principal del Frontend (Versión A9)
// ==========================================
async function procesarPago() {
    console.log("Iniciando procesamiento de pago..."); // Chivato para la consola

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    // Limpiamos el texto del total por si tiene el símbolo € o espacios
    let textoTotal = document.getElementById('total-carrito').innerText;
    let totalLimpio = parseFloat(textoTotal.replace('€', '').trim());

    const datosPedido = {
        nombreCliente: document.getElementById('nombre').value,
        direccionEnvio: document.getElementById('direccion').value,
        total: totalLimpio
    };

    try {
        const respuesta = await fetch('http://localhost:8080/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        if (respuesta.ok) {
            alert("✅ ¡Pedido guardado en la base de datos! Gracias por tu compra.");
            carrito = [];
            actualizarVistaCarrito();

            // Cerramos el modal de Bootstrap
            let modalEl = document.getElementById('checkoutModal');
            let modalObj = bootstrap.Modal.getInstance(modalEl);
            if (modalObj) {
                modalObj.hide();
            }
        } else {
            alert("❌ Error del servidor: No se pudo guardar el pedido.");
        }
    } catch (error) {
        console.error("Error en la petición Fetch:", error);
        alert("Error de conexión al procesar el pago. ¿Está encendido el Backend?");
    }
}
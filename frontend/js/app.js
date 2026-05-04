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
        // SINCRONIZACIÓN: Usamos p.imagen (nombre de la variable en Java)
        // Si en tu Java pusiste @Column(name="url_imagen") private String imagen;
        // el JSON que llega aquí tiene la propiedad "imagen".
        const urlImagen = p.imagen;

        contenedor.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="card card-producto h-100 shadow-sm">
                    <img src="${urlImagen}" class="card-img-top" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="card-body card-body-producto d-flex flex-column">
                        <h5 class="card-title">${p.nombre}</h5>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="precio">${p.precio.toFixed(2)} €</span>
                            <button onclick="agregarAlCarrito(${p.id})" class="btn btn-primary btn-sm">Añadir al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// 3. Lógica del carrito con contador
function agregarAlCarrito(id) {
    const productoExistente = carrito.find(p => p.id === id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        const productoNuevo = productosCatalogo.find(p => p.id === id);
        if (productoNuevo) {
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
                    <img src="${p.imagen}" alt="${p.nombre}" 
                         style="width: 50px; height: 50px; object-fit: contain; margin-right: 15px;">
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

function restarCantidad(id) {
    const producto = carrito.find(p => p.id === id);
    if (producto) {
        if (producto.cantidad > 1) {
            producto.cantidad--;
        } else {
            eliminarProducto(id);
        }
        actualizarVistaCarrito();
    }
}

function eliminarProducto(id) {
    carrito = carrito.filter(p => p.id !== id);
    actualizarVistaCarrito();
}

// 4. Lógica del Buscador
document.getElementById('buscador-productos').addEventListener('input', function(e) {
    const textoBuscado = e.target.value.toLowerCase();
    const tarjetasProductos = document.querySelectorAll('.card-producto');

    tarjetasProductos.forEach(tarjeta => {
        const titulo = tarjeta.querySelector('.card-title').innerText.toLowerCase();
        if (titulo.includes(textoBuscado)) {
            tarjeta.parentElement.style.display = 'block';
        } else {
            tarjeta.parentElement.style.display = 'none';
        }
    });
});

// 5. Procesamiento de pago (Hito A9)
async function procesarPago() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let textoTotal = document.getElementById('total-carrito').innerText;
    let totalLimpio = parseFloat(textoTotal.replace('€', '').trim());

    const datosPedido = {
        nombreCliente: document.getElementById('nombre').value,
        direccionEnvio: document.getElementById('direccion').value,
        total: totalLimpio
    };

    if (!datosPedido.nombreCliente || !datosPedido.direccionEnvio) {
        alert("Por favor, rellena los datos de envío.");
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:8080/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        if (respuesta.ok) {
            alert("✅ ¡Pedido guardado con éxito!");
            carrito = [];
            actualizarVistaCarrito();

            let modalEl = document.getElementById('checkoutModal');
            let modalObj = bootstrap.Modal.getInstance(modalEl);
            if (modalObj) modalObj.hide();
            document.getElementById('formulario-pago').reset();
        } else {
            alert("❌ Error del servidor al guardar el pedido.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión. ¿Está encendido el Backend?");
    }
}
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

// 4. Pintar el carrito actualizado
function actualizarVistaCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalElemento = document.getElementById('total-carrito');

    lista.innerHTML = '';
    let total = 0;

    carrito.forEach(p => {
        // Calculamos el subtotal de ese producto (precio * cantidad)
        const subtotal = p.precio * p.cantidad;
        total += subtotal;

        // Renderizamos el HTML del producto en el carrito
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
                <span class="fw-bold text-primary">${subtotal.toFixed(2)} €</span>
            </li>
        `;
    });

    totalElemento.innerText = total.toFixed(2) + ' €';
}
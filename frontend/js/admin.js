// URLs base de tus APIs
const API_URL = 'http://localhost:8080/api/productos';
const API_PEDIDOS = 'http://localhost:8080/api/pedidos'; // Añadida la ruta de los pedidos

// 1. Cargar los datos al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
    cargarPedidos(); // AHORA CARGA TAMBIÉN LOS PEDIDOS
});

// --- FUNCIÓN DE PRODUCTOS ---
async function cargarInventario() {
    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = '';

        productos.forEach(producto => {
            tbody.innerHTML += `
                <tr>
                    <td>${producto.id}</td>
                    <td><img src="${producto.imagen}" width="50" alt="img" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td>${producto.nombre}</td>
                    <td>${producto.precio.toFixed(2)} €</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="borrarProducto(${producto.id})">🗑️ Borrar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando el inventario:", error);
    }
}

async function cargarPedidos() {
    try {
        const respuesta = await fetch(API_PEDIDOS);
        const pedidos = await respuesta.json();

        const tbody = document.getElementById('tabla-pedidos');
        if (!tbody) return;

        tbody.innerHTML = '';

        pedidos.forEach(p => {
            // Formatear la fecha para que se vea bonita (ej: 04/05/2026 15:30)
            let fechaTexto = "Sin fecha";
            if (p.fechaPedido) {
                const fechaObj = new Date(p.fechaPedido);
                fechaTexto = fechaObj.toLocaleDateString('es-ES') + " " + fechaObj.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            }

            tbody.innerHTML += `
                <tr>
                    <td>#00${p.id}</td>
                    <td class="fw-bold">${p.nombreCliente}</td>
                    <td>${p.direccionEnvio}</td>
                    <td class="text-success fw-bold">${p.total.toFixed(2)} €</td>
                    <td><span class="badge bg-secondary">${fechaTexto}</span></td> 
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

// 2. Guardar un producto nuevo
document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevo = {
        nombre: document.getElementById('admin-nombre').value,
        precio: parseFloat(document.getElementById('admin-precio').value),
        imagen: document.getElementById('admin-imagen').value
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo)
        });

        if (res.ok) {
            // Comprobamos si has puesto el link de SweetAlert, si no, usa el normal
            if (typeof Swal !== 'undefined') {
                Swal.fire('¡Añadido!', 'Producto guardado correctamente.', 'success');
            } else {
                alert("✅ Producto añadido correctamente");
            }

            document.getElementById('form-producto').reset();
            cargarInventario();
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo añadir el producto.', 'error');
            } else {
                alert("❌ Error al añadir. Revisa la consola de IntelliJ.");
            }
        }
    } catch(error) {
        console.error(error);
    }
});

// 3. Borrar un producto
async function borrarProducto(id) {
    if (typeof Swal !== 'undefined') {
        // Confirmación de borrado con SweetAlert (Mucho más profesional)
        Swal.fire({
            title: '¿Estás seguro?',
            text: "El producto desaparecerá de la tienda.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                ejecutarBorrado(id);
            }
        });
    } else {
        // Alerta clásica
        if(confirm("¿Estás seguro de que quieres borrar este producto?")) {
            ejecutarBorrado(id);
        }
    }
}

// Lógica interna para borrar el producto
async function ejecutarBorrado(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (typeof Swal !== 'undefined') {
            Swal.fire('Eliminado', 'El producto ha sido borrado.', 'success');
        } else {
            alert("🗑️ Producto eliminado");
        }
        cargarInventario();
    } catch (error) {
        console.error("Error al borrar:", error);
    }
}
// URL base de tu API de productos
const API_URL = 'http://localhost:8080/api/productos';

// 1. Cargar los productos al abrir la página
document.addEventListener('DOMContentLoaded', cargarInventario);

async function cargarInventario() {
    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = ''; // Limpiamos la tabla antes de rellenar

        productos.forEach(producto => {
            tbody.innerHTML += `
                <tr>
                    <td>${producto.id}</td>
                    <td><img src="${producto.imagen}" width="50" alt="img"></td>
                    <td>${producto.nombre}</td>
                    <td>${producto.precio} €</td>
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

// 2. Guardar un producto nuevo
document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Creamos el objeto exactamente como lo espera el Backend
    const nuevo = {
        nombre: document.getElementById('admin-nombre').value,
        precio: parseFloat(document.getElementById('admin-precio').value),
        imagen: document.getElementById('admin-imagen').value // Debe llamarse 'imagen' para que Java lo entienda
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    if (res.ok) {
        alert("✅ Producto añadido correctamente");
        document.getElementById('form-producto').reset();
        cargarInventario();
    } else {
        alert("❌ Error al añadir. Revisa la consola de IntelliJ.");
    }
});

// 3. Borrar un producto
async function borrarProducto(id) {
    if(confirm("¿Estás seguro de que quieres borrar este producto?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            alert("🗑️ Producto eliminado");
            cargarInventario(); // Recarga la tabla
        } catch (error) {
            alert("❌ Error al borrar");
        }
    }
}
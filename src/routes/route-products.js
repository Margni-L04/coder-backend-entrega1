const express = require('express');
const router = express.Router();

// Obtenemos la ruta del json de los productos
const path = require('path');
const rutaProductos = path.join(__dirname, '../json/products.json');

// Le decimos a express que vamos a usar json
router.use(express.json());

// Creamos un objeto de la clase ProductManager
const ProductManager = require('../classes/ProductManager');
const prodManager = new ProductManager(rutaProductos);

// Endpoints de products
router.get('/', async (req, res) => {
    // Obtenemos todos los productos
    try {
        const productos = await prodManager.getProducts();

        res.status(200).send({ message: 'Productos obtenidos exitosamente', productos });
    } catch(error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    // Obtenemos el producto con el id pasado
    const pid = parseInt(req.params.pid);

    try {
        if(isNaN(pid)) {
            res.status(400).send({ error: 'id de producto invalido' });
        } else {
            const producto = await prodManager.getProductById(pid);

            res.status(200).send({ message: 'Producto obtenido exitosamente', producto });
        }

    } catch(error) {
        if(error.message.includes('no encontrado')) {
            res.status(404).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

router.post('/', async (req, res) => {
    // Cargamos un nuevo producto, pasado por el body
    const producto = req.body;

    try {
        const prodAgregado = await prodManager.addProduct(producto);

        res.status(201).send({ message: 'Producto creado exitosamente', producto: prodAgregado });

    } catch(error) {
        if(error.message.includes('Ya existe') || error.message.includes('campos obligatorios') || error.message.includes('tipos')) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

router.put('/:pid', async (req, res) => {
    // Modificamos el producto con el id pasado
    const pid = parseInt(req.params.pid);
    const datosModificar = req.body;

    try {
        if(isNaN(pid)) {
            res.status(400).send({ error: 'id de producto invalido' });
        } else {
            const productoModificado = await prodManager.updateProduct(pid, datosModificar);

            res.status(200).send({ message: 'Producto modificado exitosamente', productoModificado });
        }

    } catch(error) {
        if(error.message.includes('no encontrado')) {
            res.status(404).send({ error: error.message });
        } else if(error.message.includes('El valor de') || error.message.includes('datos validos')
                    || error.message.includes('campo permitido')) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

router.delete('/:pid', async (req, res) => {
    // Obtenemos el producto con el id pasado
    const pid = parseInt(req.params.pid);

    try {
        if(isNaN(pid)) {
            res.status(400).send({ error: 'id de producto invalido' });
        } else {
            await prodManager.deleteProduct(pid);

            res.status(200).send({ message: 'Producto eliminado exitosamente'});
        }

    } catch(error) {
        if(error.message.includes('no encontrado')) {
            res.status(404).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

module.exports = router;
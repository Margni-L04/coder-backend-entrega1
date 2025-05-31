const express = require('express');
const router = express.Router();

// Obtenemos la ruta del json de los carritos
const path = require('path');
const rutaCarritos = path.join(__dirname, '../json/carts.json');

// Le decimos a express que vamos a usar json
router.use(express.json());

// Creamos un objeto de la clase CartManager
const CartManager = require('../classes/CartManager');
const cManager = new CartManager(rutaCarritos);

router.get('/:cid', async (req, res) => {
    // Obtenemos el carrito con el id pasado
    const cid = parseInt(req.params.cid);

    try {
        if(isNaN(cid)) {
            res.status(400).send({ error: 'id de carrito invalido' });
        } else {
            const carrito = await cManager.getCartById(cid);

            res.status(200).send({ message: 'Carrito obtenido exitosamente', carrito });
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
    const carrito = req.body;

    try {
        const cartAgregado = await cManager.addCart(carrito);

        res.status(201).send({ message: 'Carrito creado exitosamente', carrito: cartAgregado });

    } catch(error) {
        if(error.message.includes('campos obligatorios') || error.message.includes('tipos')) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    // Obtenemos los parámetros pasados y el valor de quantity opcional del body
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    let quantity = req.body.quantity;

    try {
        if(isNaN(cid)) {
            res.status(400).send({ error: 'id de carrito invalido' });
        } else if(isNaN(pid)) {
            res.status(400).send({ error: 'id de producto invalido' });
        } else {
            if(!quantity) {
                // No se especificó un valor para quantity, lo ponemos como 1
                quantity = 1;
            }

            const cartModificado = await cManager.addProductInCart(cid, pid, quantity);

            res.status(201).send({ message: 'Producto agregado al carrito exitosamente', carrito: cartModificado });
        }

    } catch(error) {
        if(error.message.includes('no encontrado')) {
            res.status(404).send({ error: error.message });
        } else if(error.message.includes('invalida')) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

module.exports = router;
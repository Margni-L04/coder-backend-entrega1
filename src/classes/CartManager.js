const fs = require('fs').promises;

class CartManager {
    constructor(path) {
        this.path = path;
        this.carritos = [];
        this.proxId = 1;

        this.inicializar();
    }

    async inicializar() {
        await this.leerCarritos();

        if(this.carritos) {
            // Hay carritos cargados, actualizamos el proxId
            this.proxId = Math.max(...this.carritos.map(cart => cart.id)) + 1;
        }
    }

    async leerCarritos() {
        this.carritos = [];

        try {
            const data = await fs.readFile(this.path, 'utf8');

            if(data) {
                // Hay data cargada que obtener
                this.carritos = JSON.parse(data);
            }
        } catch(error) {
            console.error(`Error al leer carritos: ${error}`);
        }
    }

    async escribirCarritos() {
        try {
            const carritos_str = JSON.stringify(this.carritos, null, 2);

            await fs.writeFile(this.path, carritos_str, 'utf8');
        } catch(error) {
            throw new Error(`Error al escribir carritos: ${error}`);
        }
    }

    async addCart({ products }) {
        let nuevoCarrito = null;

        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerCarritos();

        // Todos los campos son obligatorios, validamos que eso se cumpla
        if(!products) {

            throw new Error("No se agregaron todos los campos obligatorios: { products }");

        } else if(!Array.isArray(products)) {

            throw new Error("No se respetaron los tipos de los parametros, products debe ser un array");

        } else {
            // Agregamos el nuevo carrito
            nuevoCarrito = { "id":this.proxId, products }

                this.carritos.push(nuevoCarrito);

                await this.escribirCarritos();
                
                this.proxId++;
                console.log(`Carrito agregado correctamente: ${nuevoCarrito}`);
        }

        return nuevoCarrito;
    }

    async getCartById(id) {
        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerCarritos();

        const cartBuscado = this.carritos.find(cart => cart.id === id);

        if(!cartBuscado) {
            // No se encontro un carrito con el id pasado
            throw new Error(`Carrito con el id ${id} no encontrado`);
        }

        return cartBuscado;
    }

    async addProductInCart(idCart, idProduct, quantity) {
        if(typeof(quantity) !== 'number' || quantity <= 0) {
            throw new Error('Valor de quantity invalida, debe ser un numero mayor que 0');
        }

        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerCarritos();

        // Obtenemos el carrito del id pasado
        const carrito = this.carritos.find(cart => cart.id === idCart);

        if(!carrito) {
            // No se encontro un carrito con el id pasado
            throw new Error(`Carrito con el id ${idCart} no encontrado`);
        }

        let productosDeCarrito = carrito.products;

        let productoBuscado = productosDeCarrito.find(prod => prod.idProduct === idProduct);

        if(productoBuscado) {
            // El producto está en la lista de productos, aumentamos la cantidad
            productoBuscado.quantity += quantity;
        } else {
            // El producto no existe en la lista, lo creamos y agregamos
            productosDeCarrito = productosDeCarrito.push({ idProduct, quantity });
        }

        await this.escribirCarritos();

        return carrito;
    }
}

module.exports = CartManager;
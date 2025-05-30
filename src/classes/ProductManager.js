const fs = require('fs').promises;

class ProductManager {
    constructor(path) {
        this.path = path;
        
        const productos = this.leerProductos();
        if(!productos) {
            //no hay productos cargados
            this.proxId = 1;
        } else {
            // el proximo id es un valor más que el máximo de los ids de los productos que tenemos
            this.proxId = Math.max(...productos.map(p => p.id)) + 1;
        }
    }

    async leerProductos() {
        let productos = [];

        try {
            const data = await fs.readFile(this.path, 'utf8');

            if(data) {
                // Hay data cargada que obtener
                productos = JSON.parse(data);
            }
        } catch(error) {
            console.error(`Error al leer productos: ${error}`);
        }

        return productos;
    }

    async escribirProductos(productos) {
        try {
            const productos_str = JSON.stringify(productos);

            await fs.writeFile(this.path, productos_str, 'utf8');
        } catch(error) {
            console.error(`Error al leer productos: ${error}`);
        }
    }

    addProduct({title, description, price, thumbnail, code, stock}) {
        let agregado = false;

        // Todos los campos son obligatorios, validamos que eso se cumpla
        if(!title || !description || !price || !thumbnail || !code || !stock) {

            console.log("No se agregaron todos los campos obligatorios");

        } else {
            // Buscamos si existe algun producto con el mismo codigo pasado
            const existeCode = this.products.some(prod => prod.code === code);

            if(!existeCode) {
                // No existe un producto con el codigo code
                const nuevoProducto = {"id":this.proxId, "title":title, "description":description, "price":price,
                                        "thumbnail":thumbnail, "code":code, "stock":stock}

                this.products.push(nuevoProducto);
                
                agregado = true;
                this.proxId++;
            }
        }

        // devolvemos si el producto se pudo agregar correctamente
        return agregado;
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const prodBuscado = this.products.find(prod => prod.id === id);

        if(!prodBuscado) {
            //no se encontro un producto con el id pasado
            console.log("Product not found");
        }

        return prodBuscado;
    }
}
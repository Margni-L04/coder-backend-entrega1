const fs = require('fs').promises;

class ProductManager {
    constructor(path) {
        this.path = path;
        this.productos = [];
        this.proxId = 1;

        this.inicializar();
    }

    async inicializar() {
        await this.leerProductos();

        if(this.productos) {
            // Hay productos cargados, actualizamos el proxId
            this.proxId = Math.max(...this.productos.map(prod => prod.id)) + 1;
        }
    }

    async leerProductos() {
        this.productos = [];

        try {
            const data = await fs.readFile(this.path, 'utf8');

            if(data) {
                // Hay data cargada que obtener
                this.productos = JSON.parse(data);
            }
        } catch(error) {
            console.error(`Error al leer productos: ${error}`);
        }
    }

    async escribirProductos() {
        try {
            const productos_str = JSON.stringify(this.productos, null, 2);

            await fs.writeFile(this.path, productos_str, 'utf8');
        } catch(error) {
            throw new Error(`Error al escribir productos: ${error}`);
        }
    }

    async addProduct({title, description, code, price, status, stock, category, thumbnails}) {
        let nuevoProducto = null;

        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerProductos();

        // Todos los campos son obligatorios, validamos que eso se cumpla
        if(!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {

            throw new Error("No se agregaron todos los campos obligatorios: {title, description, code, price, status, stock, category, thumbnails}");

        } else if(typeof(title) !== 'string' || typeof(description) !== 'string' || typeof(code) !== 'string'
                    || typeof(price) !== 'number' || typeof(status) !== 'boolean' || typeof(stock) !== 'number'
                    || typeof(category) !== 'string' || !Array.isArray(thumbnails)) {

            throw new Error("No se respetaron los tipos de los parametros");

        } else {
            // Buscamos si existe algun producto con el mismo codigo pasado
            const existeCode = this.productos.some(prod => prod.code === code);

            if(!existeCode) {
                // No existe un producto con el codigo code
                nuevoProducto = {"id":this.proxId, title, description, code, price, status, stock, category, thumbnails}

                this.productos.push(nuevoProducto);

                await this.escribirProductos();
                
                this.proxId++;
                console.log(`Producto agregado correctamente: ${nuevoProducto}`);
            } else {
                throw new Error("Ya existe un producto con el codigo pasado");
            }
        }

        return nuevoProducto;
    }

    async getProducts() {
        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerProductos();

        return this.productos;
    }

    async getProductById(id) {
        const prodBuscado = this.productos.find(prod => prod.id === id);

        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerProductos();

        if(!prodBuscado) {
            // No se encontro un producto con el id pasado
            throw new Error(`Producto con el id ${id} no encontrado`);
        }

        return prodBuscado;
    }

    async updateProduct(id, camposModificados) {
        let actualizado = false;

        const camposPermitidos = [
            'title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'
        ];

        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerProductos();

        const index = this.productos.findIndex(prod => prod.id === id);
        const prodModificado = this.productos[index];

        if(index === -1) {
            // No se encontro un producto con el id pasado
            throw new Error(`Producto con el id ${id} no encontrado`);
        } else {
            // Actualizamos únicamente los datos que nos pasaron
            for(let campo in camposModificados) {
                // Validamos que el campo sea uno permitido para modificar
                if(!camposPermitidos.includes(campo)) {
                    throw new Error(`'${campo}' no es un campo permitido para modificar un producto`);
                }

                // Validaciones de que se cumplan las condiciones de tipos y otras restricciones
                if(campo === 'code') {
                    if(this.productos.some((prod, i) => i !== index && prod.code === camposModificados.code)) {
                        // Existe otro producto con el mismo codigo
                        throw new Error(`El valor de código ${camposModificados.code} ya existe en otro producto`);
                    }
                }

                if ((campo === 'price' || campo === 'stock') && typeof camposModificados[campo] !== 'number') {
                    throw new Error(`El valor de price y stock deben ser numericos`);
                }

                if (campo === 'status' && typeof camposModificados[campo] !== 'boolean') {
                    throw new Error(`El valor de status debe ser un valor booleano`);
                }

                if (campo === 'thumbnails' && !Array.isArray(camposModificados[campo])) {
                    throw new Error(`El valor de thumbnail debe ser un arreglo`);
                }

                if (prodModificado[campo] !== camposModificados[campo]) {
                    prodModificado[campo] = camposModificados[campo];
                    actualizado = true;
                }
            }

            if(actualizado) {
                console.log(`Producto actualizado correctamente: ${prodModificado}`);
                await this.escribirProductos();
            } else {
                throw new Error("No se proporcionaron datos validos para actualizar");
            }
        }
        
        return actualizado ? prodModificado : [];
    }

    async deleteProduct(id) {
        let eliminado = false;

        // Leemos los productos para asegurarnos que el arreglo se encuentre actualizado
        await this.leerProductos();

        const existeProd = this.productos.some(prod => prod.id === id);

        if(!existeProd) {
            // No se encontro un producto con el id pasado
            throw new Error(`No existe un producto con el id ${id}`);
        } else {
            this.productos = this.productos.filter(prod => prod.id !== id);

            await this.escribirProductos();

            eliminado = true;
            console.log(`Producto eliminado correctamente`);
        }

        return eliminado;
    }
}

module.exports = ProductManager;
const express = require('express');
const app = express();

//Puerto utilizado para el servidor
const PORT = 8080;

//Utilizamos los enpoints guardados en las rutas
const products = require('./routes/route-products.js');
const carts = require('./routes/route-carts.js');

//Resultado que obtendrá el cliente al entrar al servidor
app.get('/', (req, res) => {
    res.send('<h1>Servidor ejecutándose, listo para recibir peticiones...</h1>');
});

//Utilizamos las rutas
app.use('/products', products);
app.use('/carts', carts);

//Abrimos el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose http://localhost:${PORT}`);
});
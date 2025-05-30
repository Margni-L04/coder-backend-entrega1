const express = require('express');
const router = express.Router();

router.use(express.json());

//Endpoints de products
router.get('/', (req, res) => {
    res.send("b");
});

module.exports = router;
import express from 'express';
const router = express.Router();

const { saveProd } = require('./../../../controllers/V2/IoTScanner/productScanner');

router.route('/product-scanner').post(saveProd);

module.exports = router;
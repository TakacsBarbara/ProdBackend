import express from 'express';
const router = express.Router();

const { getStockInfo } = require('./../../../../../controllers/V2/productionManagement/materialManagement/stock/stock');

router.route('/').get(getStockInfo);

module.exports = router;
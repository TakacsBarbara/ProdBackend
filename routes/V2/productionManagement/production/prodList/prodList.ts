import express from 'express';
const router = express.Router();

const { getProductionList } = require('./../../../../../controllers/V2/productionManagement/production/prodList/prodList');

router.route('/').get(getProductionList);

module.exports = router;
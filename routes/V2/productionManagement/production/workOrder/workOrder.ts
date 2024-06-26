import express from 'express';
const router = express.Router();

const { getWOData } = require('./../../../../../controllers/V2/productionManagement/production/workOrder/workOrder');

router.route('/:workOrderNumber').get(getWOData);

module.exports = router;
import express from 'express';
const router = express.Router();

const { getMaterialPlanner } = require('./../../../../../controllers/V2/productionManagement/materialManagement/materialPlanner/materialPlanner');

router.route('/:article').get(getMaterialPlanner);

module.exports = router;
import express from 'express';
const router = express.Router();

const { saveBooking } = require('./../../../../../controllers/V2/productionManagement/materialManagement/materialBooking/materialBooking');

router.route('/').post(saveBooking);

module.exports = router;
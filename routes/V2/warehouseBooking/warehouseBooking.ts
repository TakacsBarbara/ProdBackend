import express from 'express';
const router = express.Router();

const { book, get } = require('./../../../controllers/V2/warehouseBooking/warehouseBooking');

router.route('/book').get(book);
router.route('/get').get(get);

module.exports = router;
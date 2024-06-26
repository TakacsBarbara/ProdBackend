import express from 'express';
const router = express.Router();

const { checkOutUser } = require('./../../../controllers/V2/workTime/userCheckOut');

router.route('/:id').get(checkOutUser);

module.exports = router;
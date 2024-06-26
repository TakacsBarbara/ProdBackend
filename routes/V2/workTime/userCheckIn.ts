import express from 'express';
const router = express.Router();

const { checkInUser } = require('./../../../controllers/V2/workTime/userCheckIn');

router.route('/:id').get(checkInUser);

module.exports = router;
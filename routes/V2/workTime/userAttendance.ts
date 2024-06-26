import express from 'express';
const router = express.Router();

const { getAttendance } = require('./../../../controllers/V2/workTime/userAttendance');

router.route('/:id').get(getAttendance);

module.exports = router;
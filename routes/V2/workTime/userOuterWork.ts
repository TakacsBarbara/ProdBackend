import express from 'express';
const router = express.Router();

const { outerWorkUser } = require('./../../../controllers/V2/workTime/userOuterWork');

router.route('/:id').get(outerWorkUser);

module.exports = router;
import express from 'express';
const router = express.Router();

const { getUser } = require('./../../../controllers/V2/workTime/userDatas');

router.route('/:hash').get(getUser);

module.exports = router;
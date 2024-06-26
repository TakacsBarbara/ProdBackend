import express from 'express';
const router = express.Router();

const { accessControl } = require('./../../../controllers/V2/accessControl/accessControl');

router.route('/:doorID').get(accessControl);

module.exports = router;
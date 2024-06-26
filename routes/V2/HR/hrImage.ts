import express from 'express';
const router = express.Router();

const { saveImage } = require('./../../../controllers/V2/HR/hrImage');

router.route('/').post(saveImage);

module.exports = router;
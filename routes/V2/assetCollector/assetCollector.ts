import express from 'express';
const router = express.Router();

const { saveAssetDatas } = require('./../../../controllers/V2/assetCollector/assetCollector');

router.route('/').post(saveAssetDatas);

module.exports = router;
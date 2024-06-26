import express from 'express';
const router = express.Router();

const { setNewWOData, getUserData } = require('./../../../../../controllers/V2/productionManagement/production/bde/bde');

router.route('/time-update').post(setNewWOData);
router.route('/user-data').post(getUserData);

module.exports = router;
import express from 'express';
const router = express.Router();

const { 
    getPic,
    getCdwg,
    getCutlist,
    getAdwg,
    getCellainfo } = require('./../../controllers/V2/files');

router.route('/pic/:article').get(getPic);
router.route('/cdwg/:article').get(getCdwg);
router.route('/cutlist/:article').get(getCutlist);
router.route('/adwg/:article').get(getAdwg);
router.route('/cellainfo/:article').get(getCellainfo);

module.exports = router;
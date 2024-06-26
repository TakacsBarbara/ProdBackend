import express from 'express';
const router = express.Router();

const { getUser } = require('./../../../controllers/V2/login/login');

router.route('/byID/:id').get(getUser);

module.exports = router;
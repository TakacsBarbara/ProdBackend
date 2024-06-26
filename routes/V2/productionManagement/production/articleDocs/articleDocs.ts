import express from "express";
const router = express.Router();

const { renderPage, saveDocs, getArticle, getFiles } = require('./../../../../../controllers/V2/productionManagement/production/articleDocs/articleDocs');

router.route('/').get(renderPage);
router.route('/').post(saveDocs);
router.route('/get-article/:articleID').get(getArticle);
router.route('/get-files/:articleID/:category').get(getFiles);

module.exports = router;
const express = require('express');
 const { submitReport, upload } = require('../controllers/reportController');
const router = express.Router();

 router.post('/', upload.single('attachment'), submitReport);

 module.exports = router;
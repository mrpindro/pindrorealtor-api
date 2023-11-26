const router = require('express').Router();
const sendPropMail = require('../controllers/sendPropMailContoller');

router.route('/')
    .post(sendPropMail)
;


module.exports = router;
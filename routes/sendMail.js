const router = require('express').Router();
const sendMail = require('../controllers/sendMailController');

router.route('/')
    .post(sendMail)
;


module.exports = router;
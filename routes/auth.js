const authController = require('../controllers/authController');
const router = require('express').Router();

router.post('/', authController.login);

router.get('/refresh', authController.refresh);

router.post('/logout', authController.logout);

module.exports = router;
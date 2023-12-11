const router = require('express').Router();
const upload = require('../config/multer');
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middlewares/verifyJWT');

router.route('/')
    .get( usersController.getUsers)
    .post(upload.single('image'), usersController.createUser)
    .patch(usersController.updateUser)
;

router.route('/messages')
    .post(usersController.addUserMessages)
;

router.route('/reset-password')
    .patch(usersController.resetPassword)
;
    
router.route('/:id')
    .get(usersController.getUserById)
    .put(upload.single('image'), usersController.updateUserImg)
    .delete(usersController.deleteAccount)
;

module.exports = router;
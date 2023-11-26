const router = require('express').Router();
const upload = require('../config/multer');
const rentPropsController = require('../controllers/rentPropsController');

router.route('/')
    .post(upload.array('images', 10), rentPropsController.createRentProp)
    .get(rentPropsController.getRentPropsWithPages)
    .patch(rentPropsController.updateRentProp)
;
    
router.route('/props')
    .get(rentPropsController.getRentProps)
;

router.route('/:id')
    .get(rentPropsController.getRentPropById)
    .put(upload.array('images', 10), rentPropsController.updateRentPropImg)
    .delete(rentPropsController.deleteRentProp)
; 

module.exports = router;
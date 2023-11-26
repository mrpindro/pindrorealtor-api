const router = require('express').Router();
const upload = require('../config/multer');
const buyPropsController = require('../controllers/buyPropsController');

router.route('/')
    .post(upload.array('images', 10), buyPropsController.createBuyProp)
    .get(buyPropsController.getBuyPropsWithPages)
    .patch(buyPropsController.updateBuyProp)
;

router.route('/props')
    .get(buyPropsController.getBuyProps)
;

router.route('/:id')
    .get(buyPropsController.getBuyPropById)
    .put(upload.array('images', 10),buyPropsController.updateBuyPropImg)
    .delete(buyPropsController.deleteBuyProp)
;


module.exports = router;
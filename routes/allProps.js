const router = require('express').Router();
const { getAllProps, getAllPropById } = require('../controllers/allPropsController');

router.route('/')
    .get(getAllProps)
;

router.route('/:id')
    .get(getAllPropById)
;

module.exports = router;
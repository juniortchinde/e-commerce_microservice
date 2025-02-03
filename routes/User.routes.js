const router = require('express').Router();
const userCtr = require('../controllers/User.controller');
const auth = require('../middlewares/auth')

router.post('/signup', userCtr.signup);
router.post('/login', userCtr.login);
router.get('/getUser',auth.protect, userCtr.getUser);

module.exports = router;
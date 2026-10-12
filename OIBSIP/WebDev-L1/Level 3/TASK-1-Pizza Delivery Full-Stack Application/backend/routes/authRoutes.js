const router = require('express').Router();
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;

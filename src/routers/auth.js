import express from 'express';
import validateBody from '../decorators/validateBody.js';
import { registerSchema } from '../validators/authValidator.js';
import * as authController from '../controllers/auth.js';
import { loginSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refreshSession);
router.post('/logout', authController.logout);


export default router;






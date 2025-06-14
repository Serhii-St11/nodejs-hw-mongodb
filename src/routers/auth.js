import express from 'express';
import validateBody from '../decorators/validateBody.js';
import { resetPasswordSchema } from '../validators/authValidator.js';
import { resetPassword } from '../controllers/auth.js';
import {
  registerSchema,
  loginSchema,
  sendResetEmailSchema,
} from '../validators/authValidator.js';
import * as authController from '../controllers/auth.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refreshSession);
router.post('/logout', authController.logout);
router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  authController.sendResetEmail,
);
router.post('/reset-pwd', validateBody(resetPasswordSchema), resetPassword);

export default router;







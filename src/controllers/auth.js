import * as authService from '../services/auth.js';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import sendEmail from '../helpers/sendEmail.js';
import User from '../models/user.js';

const { JWT_SECRET, APP_DOMAIN } = process.env;

export const register = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, sessionId } = await authService.register(
      req.body,
    );

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        status: 201,
        message: 'Successfully registered a user!',
        data: {
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, sessionId } = await authService.login(
      req.body,
    );

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        status: 200,
        message: 'Successfully logged in!',
        data: {
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    const {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId,
    } = await authService.refreshSession(refreshToken);

    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: { accessToken },
      });
  } catch (error) {
    next(error);
  }
};


export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    await authService.logout(refreshToken);

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });

    const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

    const subject = 'Password Reset';
    const html = `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    const emailSent = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (!emailSent) {
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};


import bcrypt from 'bcryptjs';

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw createHttpError(401, 'Token is expired or invalid.');
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import Session from '../models/session.js';
import sendEmail from '../helpers/sendEmail.js';

const { ACCESS_SECRET, REFRESH_SECRET, JWT_SECRET, APP_DOMAIN } = process.env;

if (!ACCESS_SECRET || !REFRESH_SECRET || !JWT_SECRET || !APP_DOMAIN) {
  throw new Error(
    'The environment variables ACCESS_SECRET, REFRESH_SECRET, JWT_SECRET, and APP_DOMAIN must be defined',
  );
}

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  const accessToken = jwt.sign({ userId: newUser._id }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId: newUser._id }, REFRESH_SECRET, {
    expiresIn: '30d',
  });

  const session = await Session.create({
    userId: newUser._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  await Session.findOneAndDelete({ userId: user._id });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
    expiresIn: '30d',
  });

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token missing');
  }

  try {
    jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired refresh token');
  }

  const existingSession = await Session.findOne({ refreshToken });
  if (!existingSession) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > existingSession.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  const user = await User.findById(existingSession.userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  await Session.deleteOne({ _id: existingSession._id });

  const newAccessToken = jwt.sign({ userId: user._id }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const newRefreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
    expiresIn: '30d',
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  const newSession = await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionId: newSession._id,
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token missing');
  }

  const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  await Session.deleteOne({ _id: session._id });
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
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

  const emailSent = await sendEmail({ to: email, subject, html });

  if (!emailSent) {
    throw createHttpError(500, 'Failed to send reset email');
  }

  return true;
};


export const resetPassword = async (token, newPassword) => {
  try {
    const { email } = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    await Session.deleteMany({ userId: user._id });

    return true;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createHttpError(400, 'Reset token has expired');
    }
    throw createHttpError(400, 'Invalid reset token');
  }
};

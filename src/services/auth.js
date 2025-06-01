import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import Session from '../models/session.js';

const { ACCESS_SECRET, REFRESH_SECRET } = process.env;

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

  const { password: _, ...userData } = newUser.toObject();

  return userData;
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
    user: {
      email: user.email,
    },
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    const { accessToken, refreshToken: newRefreshToken } = await refreshSession(
      refreshToken,
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: 'success',
      message: 'Token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired refresh token');
  }

  const existingSession = await Session.findOne({ refreshToken });

  if (!existingSession) {
    throw createHttpError(401, 'Session not found');
  }

  const user = await User.findById(existingSession.userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  await Session.deleteOne({ _id: existingSession._id });

  const newAccessToken = jwt.sign({ id: user._id }, ACCESS_SECRET, {
    expiresIn: '15m',
  });
  const newRefreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, {
    expiresIn: '30d',
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  await Session.deleteOne({ _id: session._id });
};

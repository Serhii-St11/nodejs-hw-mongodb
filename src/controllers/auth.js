import * as authService from '../services/auth.js';

export const register = async (req, res) => {
  const newUser = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Successfully registered a user!',
    data: newUser,
  });
};

export const login = async (req, res) => {
  const { accessToken, refreshToken } = await authService.login(req.body);

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: 'success',
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
};

export const refreshSession = async (req, res) => {
  const { refreshToken } = req.cookies;

  const { accessToken } = await authService.refreshSession(refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Successfully refreshed a session!',
    data: {
      accessToken,
    },
  });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');

  res.status(204).send();
};

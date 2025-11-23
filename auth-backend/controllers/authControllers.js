const { create, login, getCurrentUser } = require('../services/user.service');

const registerUser = async (req, res, next) => {
  try {
    const newUser = await create(req);
    return res.status(201).send({ userId: newUser._id, message: 'User registered successfully.' });
  } catch (error) {
    next(error);
  }
};

let loginUser = async (req, res, next) => {
  try {
    const user = await login(req);
    return res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

// const logout = async (req, res, next) => {
//   try {
//     await sessionControllers.killSession(req.session.id);
//     return res.status(200).send('Successfully logged out.');
//   } catch (error) {
//     next(error);
//   }
// };

// const sessionLogout = async (req, res, next) => {
//   try {
//     await sessionControllers.killSession(req.body.sessionId);
//     return res.status(200).send('Successfully logged out.');
//   } catch (error) {
//     next(error);
//   }
// };

const currentUser = async (req, res, next) => {
  try {
    const currentUser = await getCurrentUser(req);
    res.status(200).send(currentUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  currentUser,
};

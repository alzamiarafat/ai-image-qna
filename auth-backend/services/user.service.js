const User = require('../models/User');
const bcrypt = require('bcryptjs');
const UserSession = require('../models/UserSession');
const { ErrorFilter } = require('../utils/helper');
const userSessionService = require('../services/userSession.service');

const DeviceDetector = require('node-device-detector');
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');
// const sessionControllers = require('../controllers/userSessionControllers');
// const { create, login } = require('../services/user.service');

const create = async (req) => {
  try {
    const { fullName, email, mobile, password, profilePicture } = req.body;
    if (!fullName || !email || !password) {
      throw new Error('Required fields are missing.');
    }

    const existingUser = await User.findOne({ email: { $in: email } });
    if (existingUser) {
      throw new Error('User already exists.');
    }

    const payload = {
      fullName,
      email,
      mobile,
      password: await bcrypt.hash(password, 10),
      profilePicture,
    };
    const newUser = new User(payload);
    await newUser.save();
    return newUser;
  } catch (error) {
    ErrorFilter(error);
    throw error;
  }
};

const login = async (req) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Required fields are missing');
    }

    const detector = new DeviceDetector();
    const userAgent = detector.detect(req.headers['user-agent']);

    let user = await User.findOne({ status: 'active', email: email });
    if (!user) {
      throw new Error('User not found');
    }

    if (await user.comparePassword(password)) {
      await userSessionService.handleLoginSession(user?._id, req?.session?.id, userAgent);
      delete user._doc.password;
      req.session.user = user;

      return user;
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    throw error;
  }
};

const getCurrentUser = async (req) => {
  try {
    const sessionUser = req?.session?.user;

    if (!sessionUser) {
      throw Object.assign(new Error('No logged-in user found'), { statusCode: 404 });
    }

    const currentUser = await User.findById(sessionUser._id).lean();
    if (!currentUser) throw new Error('User not found');

    delete currentUser.password;
    return currentUser;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  login,
  getCurrentUser,
};

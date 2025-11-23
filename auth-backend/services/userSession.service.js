const _ = require('lodash');
const UserSession = require('../models/UserSession');
const redisStore = require('../config/redis');

const checkSessionLimit = async (user, deviceId) => {
  try {
    const sessionLimit = Number(process.env.MAX_SESSIONS);
    const query = {
      user: user._id,
      deviceId: { $exists: true },
      loggedOutAt: { $exists: false },
    };

    const currentSessions = await UserSession.find(query);
    const currentDeviceIndex = _.findIndex(currentSessions, (session) => {
      return session.deviceId === deviceId;
    });

    const returnData = {
      sessionLimit: sessionLimit,
      sessionLimitExceeded: currentDeviceIndex !== -1 ? false : currentSessions?.length >= sessionLimit,
      currentSessions,
    };
    return returnData;
  } catch (error) {
    throw new Error(error.message);
  }
};

const handleLoginSession = async (userId, sessionId, userAgent) => {
  try {
    let query = {
      user: userId,
      loggedOutAt: { $exists: false },
    };
    const currentSessions = await UserSession.find(query);
    if (currentSessions.length > 0) {
      await Promise.all(
        currentSessions.map(async (session) => {
          session.loggedOutAt = Date.now();
          await session.save();
          redisStore.destroy(session.sessionID);
        })
      );
    }

    const userInfo = {
      user: userId,
      sessionID: sessionId,
      os: userAgent.os,
      client: userAgent.client,
      device: userAgent.device,
    };
    return await UserSession.create(userInfo);
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  checkSessionLimit,
  handleLoginSession,
};

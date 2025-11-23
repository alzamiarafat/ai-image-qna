const Schema = require('mongoose').Schema;
const model = require('mongoose').model;
const mogoosePlugin = require('../plugins/mongoosePlugins').Plugins;

let UserSessionSchema = new Schema(
  {
    loggedInAt: { type: Date, default: Date.now },
    loggedOutAt: { type: Date, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionID: { type: String, index: true },
    deviceId: { type: String },
    os: { type: Schema.Types.Mixed },
    client: { type: Schema.Types.Mixed },
    device: { type: Schema.Types.Mixed },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

UserSessionSchema.plugin(mogoosePlugin.documentDeleted);
const UserSession = model("UserSession", UserSessionSchema);
module.exports = UserSession;

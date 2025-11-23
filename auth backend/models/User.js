const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePlugins = require('../plugins/mongoosePlugins').Plugins;
const mongoosePaginate = require('mongoose-paginate-v2');


const UserSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['review', 'active', 'inactive', 'suspended'], default: 'active' },
    role: { type: String },
    fullName: { type: String, require: true, index: true },
    mobile: { type: String, require: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    password: { type: String, required: true },
    profilePicture: { type: String },
    temporaryPassword: { type: String },
    resetPasswordToken: { type: String },
    passwordResetRequired: { type: Boolean, default: true },
    resetPasswordExpires: { type: Date },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// UserSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//     return next();
//   }
//   return next();
// });

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.plugin(mongoosePlugins.documentDeleted);
UserSchema.plugin(mongoosePaginate);
const User = model("User", UserSchema);
module.exports = User;

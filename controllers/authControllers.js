const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");

const { ctrlWrapper, resizeAvatar } = require("../utils");
const { HttpError, sendEmail } = require("../helpers");
const { User } = require("../models/userModels");
const { SECRET_KEY, BASE_URL } = process.env;

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email is already used");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const result = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

  const verifyEmail = {
    to: email,
    subject: "Сonfirmation of registration",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to confirm registration</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: result.email,
      subscription: result.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });

  res.status(200).json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  const verifyEmail = {
    to: email,
    subject: "Сonfirmation of registration",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to confirm registration</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({ message: "Verification email sent" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verify");
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = { id: user._id };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const getCurrentUser = async (req, res) => {
  const { email, subscription, avatarURL } = req.user;

  res.status(200).json({
    email,
    subscription,
    avatarURL,
  });
};

const updateSubscriptionUser = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  const result = await User.findByIdAndUpdate(_id, { subscription });
  if (!result) {
    throw HttpError(401, "Not authorized");
  }
  res.status(200).json(result);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tmpUpload, filename } = req.file;

  await resizeAvatar(tmpUpload, 250, 250);

  const avatarName = `${_id}_${filename}`;
  const resultUpload = path.join(avatarDir, avatarName);

  await fs.rename(tmpUpload, resultUpload);

  const avatarURL = path.join("avatars", avatarName);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateSubscriptionUser: ctrlWrapper(updateSubscriptionUser),
  updateAvatar: ctrlWrapper(updateAvatar),
};

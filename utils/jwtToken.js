const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const createToken = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createToken({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("mytoken", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    //to send cookies only over secured http i.e https. to be considered on production
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  createToken,
  isTokenValid,
  attachCookiesToResponse,
};

import JWT from "jsonwebtoken";

export const generateToken = (id, roles, isAdmin, username) => {
  return JWT.sign({ id, roles, isAdmin, username }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const { StatusCodes } = require("http-status-codes");

const register = async (req, res) => {
  const newUser = { ...req.body };
  global.users.push(newUser);
  global.user_id = newUser;

  const safeUser = { ...req.body };
  delete safeUser.password;
  return res.status(StatusCodes.CREATED).json(safeUser);
};

const logon = async (req, res) => {
  const { email, password } = req.body || {};
  const foundUser = global.users.find((u) => u.email === email);

  if (!foundUser || foundUser.password !== password) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication Failed" });
  }

  global.user_id = foundUser;
  return res.status(StatusCodes.OK).json({ name: foundUser.name, email: foundUser.email });
};

const logoff = async (req, res) => {
  global.user_id = null;
  return res.status(StatusCodes.OK).end();
};

module.exports = { register, logon, logoff };


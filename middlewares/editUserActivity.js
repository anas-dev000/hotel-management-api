module.exports = editUserActivity = (req, res, next) => {
  const isActive = false;
  req.body.isActive = isActive;
  next();
};

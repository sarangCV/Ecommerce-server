module.exports = function (req, res, next) {
  console.log(req.params);
  const { token } = req.params;
  if (token == "") {
    console.log("NO PARAMS");
    return res.status(400).send(`Token doesn't exist!`);
  }
  next();
};

const jwt = require("jsonwebtoken");

module.exports = {
  validateRegister: (req, res, next) => {
    // username min length 3
    if (!req.body.user || req.body.user.length < 3) {
      return res.status(400).send({
        msg: 'Please enter a username with min. 3 chars'
      });
    }
    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).send({
        msg: 'Please enter a password with min. 6 chars'
      });
    }
    // password (repeat) does not match
    if (
      !req.body.password_repeat ||
      req.body.password != req.body.password_repeat
    ) {
      return res.status(400).send({
        msg: 'Both passwords must match'
      });
    }
    next();
  },

  isLoggedIn: (req, res, next) => {
    try {
      // const token = req.headers.authorization.split(" ")[1];
      // const a  =req.headers.authorization
      // const decoded = jwt.verify(
      //   token,
      //   'SECRETKEY'
      // );
      // req.userData = decoded;
      // next();

      var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

      if (token == null) return res.send(401)

      const verified = jwt.verify(token, 'SECRETKEY', )
      console.log(verified.userId) 
        req.userId = verified.userId
        next();


    } catch (error) {
      return res.status(401).send({ msg: "Your session is not valid" })
    }
  }
}
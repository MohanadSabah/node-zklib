const bcrypt = require('bcryptjs');
const basicAuth = require('basic-auth');

const user = {
  name: 'admin',
  pass: bcrypt.hashSync('12345678', 10)
};

const auth = async (req, res, next) => {
  const credentials = basicAuth(req);

  // Debugging logs
  console.log(credentials);
  if (credentials && await bcrypt.compare(credentials.pass, user.pass)) {
    next(); // Authentication successful, proceed to the next middleware
  } else {
    // Authentication failed, send 401 Unauthorized
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.sendStatus(401);
    // Do not call next() here, as we've already sent a response
  }
  // Removed the unconditional next() call
};

module.exports = auth;

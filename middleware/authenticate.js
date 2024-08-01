// middleware/authenticate.js
const clerk = require('../clerk');

const authenticateClerkToken = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const session = await clerk.sessions.verifySession(token);
    req.user = session.user;
    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticateClerkToken;

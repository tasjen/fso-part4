const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userExtractor = async (req, res, next) => {

  let token = null;

  const authorization = req.get('authorization');
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.replace('Bearer ', '');
  }

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' });
  }

  req.user = await User.findById(decodedToken.id);
  next();
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  } else if (err.name ===  'JsonWebTokenError') {
    return res.status(401).json({ error: err.message })
  }
  next(err)
}

module.exports = {
  userExtractor,
  unknownEndpoint,
  errorHandler
}
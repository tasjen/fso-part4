const tokenExtractor = (req, res, next) => {
  req.token = null;

  const auth = req.get('authorization');
  if (auth && auth.startsWith('Bearer')) {
    req.token = auth.replace('Bearer ', '');
  }

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
  tokenExtractor,
  unknownEndpoint,
  errorHandler
}
const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY
const expiresIn = process.env.EXPIRED_TOKEN

const verifyToken = (req, res, next) => {
  const token = extractToken(req.headers['authorization'])

  if (!token) {
    return sendUnauthorized(res, 'No token provided')
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return handleTokenVerificationError(res, err)
    }

    req.decoded = decoded
    next()
  })
}

const extractToken = (authorizationHeader) => {
  return authorizationHeader && authorizationHeader.split(' ')[1]
}

const sendUnauthorized = (res, message) => {
  return res.status(401).json({
    success: false,
    message,
    data: {},
  })
}

const handleTokenVerificationError = (res, err) => {
  if (err.name === 'TokenExpiredError') {
    return sendUnauthorized(res, 'Token expired')
  } else {
    return sendUnauthorized(res, 'Failed to authenticate token')
  }
}

const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    },
    secretKey,
    { expiresIn: expiresIn.toString() },
  )
}

module.exports = { verifyToken, generateToken }

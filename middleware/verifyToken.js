// middleware/verify-token.js
// import jwt to use the verify method
const jwt = require("jsonwebtoken");


function verifyToken(req, res, next) {

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // assign decoded payload to req.user. Some tokens wrap the payload
    // in a `payload` property while others put claims at the root.
    req.user =  decoded;

    // call next() to invoke the next middleware function
    next();
  }
  
  catch (err) {
    // if any errors, send back a 401 status and an "Invalid token." error message
    res.status(401).json({ err: "Invalid token." });
  }

}


// export this function to use it in our controller files
module.exports = verifyToken;
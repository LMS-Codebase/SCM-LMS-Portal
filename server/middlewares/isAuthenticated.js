import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // getting token from browser cookie.
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    // if we have token , we first verify it with our secret key

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    // what we are getting from decode ? --> Something related to User_.id , see as we itself doing this in generateToken function

    // making a variable named 'id' --> will store user_id that we saved in during tokenGeneration

    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};

export default isAuthenticated;

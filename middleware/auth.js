import jwt from 'jsonwebtoken'

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({error: 'Access denided. No token provided.' });
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next();
    } catch (error) {
        console.error("Authenication Error: ",error)
        res.status(403).json({error: "Invalid Token"})
    }

}
export default authenticateUser
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js'; 


const authMiddleware = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error.message);

        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export default authMiddleware;
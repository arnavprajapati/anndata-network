import jwt from 'jsonwebtoken';
import User from '../models/User.model.js'; // Assuming you have a User model

// NOTE: We use named export to match how it's imported in your routes file:
// import authMiddleware from "../middleware/auth.middleware.js"; 
// ^ Your route file is using default import, so I'll make this a default export for the fix.

/**
 * Middleware to verify JWT token from Authorization header or cookie.
 * Populates req.user with user details and role.
 */
const authMiddleware = async (req, res, next) => {
    // 1. Get token from Authorization header (Bearer Token)
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }
    // 2. Alternatively, get token from cookies (if using cookie-based auth)
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // 3. Verify token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find user by ID from the decoded payload
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // 5. Attach user object to the request
        req.user = user;

        // 6. Proceed to the next middleware/controller
        next();

    } catch (error) {
        // Log the error for debugging
        console.error('Auth Middleware Error:', error.message);

        // Respond with 401 if token is invalid or expired
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Exporting as a default export to match your donation.routes.js file:
// import authMiddleware from "../middleware/auth.middleware.js";
export default authMiddleware;
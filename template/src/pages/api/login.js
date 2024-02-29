import { setCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }
    const { username, password } = req.body;
    // Replace this logic with your actual authentication logic
    if (username === process.env.JWT_USERNAME && password === process.env.JWT_PASSWORD) {
        const user = { username: username };
        const expireHours = process.env.JWT_EXPIRY || 6;
        // Generate JWT token
        const token = jwt.sign(user, process.env.JWT_KEY || 'DefaultJWTKey', { expiresIn: expireHours + 'h' });

        setCookie('auth_token', token, { req, res, maxAge: 60 * 60 * expireHours });

        //      res.setHeader('Set-Cookie', 'auth_token=secure_token; Expires=Sat, 24 Feb 2025 07:35:37 GMT; Path=/; HttpOnly');
        return res.status(200).json({ message: 'Authentication successful' });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
}

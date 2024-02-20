import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }
    const { username, password } = req.body;

    // Replace this logic with your actual authentication logic
    if (username === 'admin' && password === 'password') {
        const user = { username: username };
        const expireHours = 6;
        // Generate JWT token
        // process.env.JWT_SECRET
        const token = jwt.sign(user, 'HelloWorldSecret', { expiresIn: expireHours + 'h' });

        setCookie('auth_token', token, { req, res, maxAge: 60 * 60 * expireHours });

        //      res.setHeader('Set-Cookie', 'auth_token=secure_token; Expires=Sat, 24 Feb 2025 07:35:37 GMT; Path=/; HttpOnly');
        return res.status(200).json({ message: 'Authentication successful' });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
}

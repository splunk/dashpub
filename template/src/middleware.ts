// // _middleware.js
import { NextRequest, NextResponse } from 'next/server';

async function verifyJwt(token, secret) {
    // Split the JWT into its components
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token');
    }

    const header = JSON.parse(atob(parts[0]));
    // const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];

    // Ensure the algorithm is HS256 (as an example)
    if (header.alg !== 'HS256') {
        throw new Error('Unsupported algorithm');
    }

    // Prepare the signing input
    const data = new TextEncoder().encode(parts.slice(0, 2).join('.'));

    // Convert the secret and the signature into the format required by Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['verify']
    );

    const signatureArrayBuffer = _base64UrlToArrayBuffer(signature);

    // Verify the signature
    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureArrayBuffer, data);

    return isValid;
}

function _base64UrlToArrayBuffer(base64Url) {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function redirectToLogin(req: NextRequest, reason: string) {
    const url = req.nextUrl.clone();
    url.searchParams.set('returnTo', url.pathname);
    url.searchParams.set('reason', reason);
    url.pathname = '/login';
    return NextResponse.redirect(url);
}

export async function middleware(req) {
    // Define the paths that don't require authentication

    const authRequired = process.env.JWT_REQUIRED === 'true';

    // If authentication is not required, allow all requests to proceed
    if (!authRequired) {
        return NextResponse.next();
    }

    const publicPaths = ['/login', '/api/login'];
    const { pathname } = req.nextUrl;

    // Check if the path is public
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    // Allow the request for public paths
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Extract the auth_token cookie
    const token = req.cookies.get('auth_token');
    if (token === undefined) {
        return redirectToLogin(req, 'loggedOut');
        // If the token is valid, proceed with the request
    }
    try {
        // Verify the token
        const decoded = await verifyJwt(token, process.env.JWT_KEY || 'DefaultJWTKey');
        if (!decoded) {
            return redirectToLogin(req, 'jwtInvalid');
        }
    } catch (error) {
        return redirectToLogin(req, 'jwtError');
    }
}
export const config = {
    matcher: ['/', '/((?!login|_next/static|_next/image|auth|favicon.ico|robots.txt|images|$).*)']
};

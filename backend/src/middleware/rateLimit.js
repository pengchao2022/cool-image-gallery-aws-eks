// Rate limiting middleware
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
        error: 'Too many login attempts from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per windowMs
    message: {
        error: 'Too many uploads from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

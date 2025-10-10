// CORS configuration
import cors from 'cors';

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // In production, specify allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            // Add your production frontend URLs here
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// CORS middleware
export const corsMiddleware = cors(corsOptions);

// Preflight options handler
export const corsPreflight = (req, res) => {
    res.status(200).send();
};

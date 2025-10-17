import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import router from './router'
import movieRoutes from './movie.routes'
import { connectDB } from './config/db'
import { corsConfig } from './config/cors'

/**
 * Main instance of the Express application.
 * 
 * This application serves as the entry point for the API server,
 * handling all incoming HTTP requests and routing them to appropriate handlers.
 * 
 * @type {Application}
 * @constant
 */
const app: Application = express()

/**
 * Establishes connection to the database.
 * 
 * Initializes and connects to the MongoDB database using the configuration
 * defined in the database module. This should be called before the server
 * starts accepting requests.
 * 
 * @function
 * @returns {Promise<void>}
 */
connectDB()

/**
 * CORS (Cross-Origin Resource Sharing) middleware configuration.
 * 
 * Enables cross-origin requests from allowed domains specified in corsConfig.
 * This is essential for frontend applications hosted on different domains
 * to communicate with this API.
 * 
 * @see {@link corsConfig} for allowed origins and methods
 */
app.use(cors(corsConfig))

/**
 * JSON body parser middleware.
 * 
 * Automatically parses incoming requests with JSON payloads and makes
 * the parsed data available in req.body. Handles Content-Type: application/json.
 * 
 * @middleware
 */
app.use(express.json())

/**
 * Cookie parser middleware.
 * 
 * Parses Cookie header and populates req.cookies with an object keyed by cookie names.
 * Essential for handling authentication tokens stored in HTTP-only cookies.
 * 
 * @middleware
 */
app.use(cookieParser())

/**
 * Main application router.
 * 
 * Handles general API routes including authentication, user management,
 * and other core functionality endpoints.
 * 
 * @middleware
 */
app.use('/', router)

/**
 * Movie-specific routes handler.
 * 
 * Manages all movie-related endpoints including CRUD operations,
 * search, filtering, and recommendations.
 * 
 * @middleware
 */
app.use('/', movieRoutes)

/**
 * Custom error interface extending the standard Error object.
 * 
 * @interface CustomError
 * @extends {Error}
 */
interface CustomError extends Error {
    /** The name/type of the error (e.g., 'JsonWebTokenError', 'TokenExpiredError') */
    name: string
    /** Human-readable error message */
    message: string
}

/**
 * Global error handling middleware.
 * 
 * Centralized error handler that catches all errors thrown in the application.
 * Provides specific handling for JWT-related errors and returns appropriate
 * HTTP status codes and error messages.
 * 
 * **Error Types Handled:**
 * - `JsonWebTokenError`: Invalid JWT token format or signature
 * - `TokenExpiredError`: JWT token has expired
 * - Generic errors: All other unhandled errors
 * 
 * **Environment-Specific Behavior:**
 * - Development: Returns detailed error messages for debugging
 * - Production: Returns generic error messages to avoid exposing sensitive information
 * 
 * @middleware
 * @param {CustomError} err - The error object thrown by previous middleware or route handlers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function (unused but required by signature)
 * 
 * @returns {Response} JSON response with appropriate status code and error message
 * 
 * @example
 * // JWT validation error
 * // Returns: 401 { error: 'Invalid token' }
 * 
 * @example
 * // Expired token error
 * // Returns: 401 { error: 'Token expired' }
 * 
 * @example
 * // Generic error in production
 * // Returns: 500 { error: 'Internal server error' }
 */
app.use((err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error:', err)
    
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token' })
        return
    }
    
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired' })
        return
    }
    
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Internal server error' 
    })
})

/**
 * 404 Not Found handler for undefined routes.
 * 
 * Catches all requests to routes that don't exist in the application
 * and returns a standardized 404 error response. This middleware should
 * always be registered last, after all other routes.
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Response} JSON response with 404 status and error message
 * 
 * @example
 * // Request to /api/nonexistent
 * // Returns: 404 { error: 'Route not found' }
 */
app.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ error: 'Route not found' })
})

export default app
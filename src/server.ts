import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import router from './router.js'
import mongoose from 'mongoose'
import { fixReviewIndexes } from './models/Review.js'
import movieRoutes from './movie.routes.js'
import { connectDB } from './config/db.js'
import { corsConfig } from './config/cors.js'

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

// Once DB is connected, run a one-time fixer to drop obsolete indexes
mongoose.connection.on('connected', () => {
    fixReviewIndexes().catch(() => {})
})

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
// Handle preflight requests globally to avoid 404 on OPTIONS
app.options('*', cors(corsConfig))

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
 * Lightweight health check endpoint.
 * Useful for uptime monitoring and to warm up cold starts in hosting providers.
 */
app.get('/health', (_req: Request, res: Response): void => {
    // Report basic DB readiness from mongoose
    const dbReady = ((): boolean => {
        try {
            // lazy require to avoid direct import cycles
            const mongoose = require('mongoose') as typeof import('mongoose')
            return mongoose.connection.readyState === 1 // connected
        } catch { return false }
    })()
    res.status(200).json({ ok: true, uptime: process.uptime(), dbReady })
})


/**
 * Global error handling middleware.
 * 
 * Centralized error handler that catches all errors thrown in the application.
 * Provides specific handling for JWT-related errors and returns appropriate
 * HTTP status codes and error messages.
 * 
 * *Error Types Handled:*
 * - JsonWebTokenError: Invalid JWT token format or signature
 * - TokenExpiredError: JWT token has expired
 * - Generic errors: All other unhandled errors
 * 
 * *Environment-Specific Behavior:*
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
app.all('*', (req: Request, res: Response): void => {
    // Using req prevents TS6133 (unused parameter) and gives a more helpful message
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` })
})

export default app
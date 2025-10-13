import express from 'express'
import cors from 'cors'
import router from './router.js'
import movieRoutes from './movie.routes.js'
import 'dotenv/config'
import { connectDB } from './config/db.js'
import { corsConfig } from './config/cors.js'
import cookieParser from 'cookie-parser'

/**
 * Main instance of the Express application.
 * @type {Application}
 */
const app = express()

/**
 * Database connection.
 * @function
 */
connectDB()

/**
 * CORS middleware with the configuration defined in corsConfig.
 */
app.use(cors(corsConfig))

/**
 * Middleware to parse request bodies in JSON format.
 */
app.use(express.json())

/**
 * Middleware to parse cookies in requests.
 */
app.use(cookieParser())

/**
 * Main router of the application.
 */
app.use('/', router)

/**
 * Movie routes.
 */
app.use('/', movieRoutes)

/**
 * Global error handling middleware.
 * 
 * - Handles errors related to JWT (invalid or expired token).
 * - Returns detailed error messages in development environment.
 * - Returns a generic message in production.
 * 
 * @param {Error} err - Thrown error object.
 * @param {Request} req - Request object.
 * @param {Response} res - Response object.
 * @param {NextFunction} next - Function to pass control to the next middleware.
 */

app.use((err, req, res, next) => {
    console.error('Error:', err)
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' })
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' })
    }
    
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Error interno del servidor' 
    })
})

/**
 * Middleware to handle non-existent routes (404).
 * 
 * @param {Request} req - Request object.
 * @param {Response} res - Response object.
 */
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
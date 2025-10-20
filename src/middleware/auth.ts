import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/auths.js'
import User, { UserDocument } from '../models/User.js'

/**
 * Extend Express Request to include authenticated user.
 */
declare global {
    namespace Express {
        interface Request {
            user?: UserDocument
        }
    }
}

/**
 * Middleware to authenticate the user using JWT.
 * 
 * @param {Request} req - Request object.
 * @param {Response} res - Response object.
 * @param {NextFunction} next - Function to proceed to the next middleware.
 * @returns {Promise<void>}
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const bearer = req.headers.authorization

        if (!bearer) {
            const error = new Error('Unauthorized')
            return res.status(401).json({ error: error.message })
        }

        const [, token] = bearer.split(' ')

        if (!token) {
            const error = new Error('Unauthorized')
            return res.status(401).json({ error: error.message })
        }

        const result = verifyToken(token)
        if (typeof result === 'object' && result.id) {
            const user = await User.findById(result.id).select('-password')
            if (!user) {
                const error = new Error('User does not exist')
                return res.status(404).json({ error: error.message })
            }
            req.user = user
            return next()
        }
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                redirect: '/login',
            })
        }

        return res.status(401).json({
            error: 'Invalid token',
            redirect: '/login',
        })
    }
}

/**
 * Alias middleware to require authentication.
 * @type {Function}
 */
export const requireAuth = authenticate

/**
 * Middleware for routes that require the user to be logged out
 * (e.g., login or registration).
 * 
 * @param {Request} req - Request object.
 * @param {Response} res - Response object.
 * @param {NextFunction} next - Function to proceed to the next middleware.
 */
export const requireGuest = (req: Request, res: Response, next: NextFunction): void | Response => {
    let token: string | undefined

    if (req.cookies?.authToken) {
        token = req.cookies.authToken
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
        try {
            verifyToken(token)
            return res.status(302).json({
                message: 'Already authenticated',
                redirect: '/mainDashBoard.html'
            })
        } catch (error) {
            // Invalid token, continue
        }
    }

    next()
}
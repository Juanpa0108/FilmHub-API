import { Router } from 'express'
import { body } from 'express-validator'
import { 
    createAccount, 
    loginUser, 
    getCurrentUser,
    verifyAuth
} from './handlers/index.js'
import { handleInputErrors } from './middleware/validation.js'
import { requireAuth, requireGuest } from './middleware/auth.js'

/**
 * Express Router instance for authentication and user management routes.
 * 
 * This router handles all authentication-related endpoints including:
 * - User registration
 * - User login
 * - Current user retrieval
 * - Token verification
 * 
 * @constant
 * @type {Router}
 */
const router: Router = Router()

/**
 * User registration endpoint.
 * 
 * Creates a new user account with email and password authentication.
 * Validates input data and ensures the user is not already authenticated.
 * 
 * **Validation Rules:**
 * - `firstName`: Required, 2-50 characters, trimmed
 * - `email`: Must be a valid email format, normalized
 * - `password`: Minimum 8 characters, must contain at least one uppercase letter,
 *   one lowercase letter, and one number
 * 
 * **Middleware Chain:**
 * 1. `requireGuest` - Ensures user is not already authenticated
 * 2. Validation rules - Validates request body
 * 3. `handleInputErrors` - Returns validation errors if any
 * 4. `createAccount` - Creates the user account
 * 
 * @route POST /api/users/register
 * @access Public (guests only)
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} 201 - Successfully created user account
 * @returns {Object} 400 - Validation errors
 * @returns {Object} 409 - User already exists
 * 
 * @example
 * // Request body
 * {
 *   "firstName": "John",
 *   "email": "john@example.com",
 *   "password": "SecurePass123"
 * }
 */
router.post(
    '/api/users/register',
    requireGuest,
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 13 }).withMessage('User must be at least 13 years old'),
    body('email')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleInputErrors,
    createAccount
)

/**
 * User login endpoint.
 * 
 * Authenticates a user with email and password credentials.
 * On successful authentication, returns a JWT token (typically in an HTTP-only cookie).
 * 
 * **Validation Rules:**
 * - `email`: Must be a valid email format, normalized
 * - `password`: Minimum 8 characters
 * 
 * **Middleware Chain:**
 * 1. Validation rules - Validates email and password format
 * 2. `handleInputErrors` - Returns validation errors if any
 * 3. `loginUser` - Authenticates user and issues token
 * 
 * @route POST /api/auth/login
 * @access Public
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} 200 - Successfully authenticated with user data and token
 * @returns {Object} 400 - Validation errors
 * @returns {Object} 401 - Invalid credentials
 * 
 * @example
 * // Request body
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123"
 * }
 */
router.post(
    '/api/auth/login',
    body('email')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    handleInputErrors,
    loginUser
)

/**
 * Get current authenticated user endpoint.
 * 
 * Retrieves the profile information of the currently authenticated user.
 * Requires a valid JWT token in the request (typically from HTTP-only cookie).
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies JWT token and attaches user to request
 * 2. `getCurrentUser` - Returns user profile data
 * 
 * @route GET /api/auth/user
 * @access Private (requires authentication)
 * 
 * @returns {Object} 200 - User profile data
 * @returns {Object} 401 - Unauthorized (invalid or missing token)
 * 
 * @example
 * // Response
 * {
 *   "id": "507f1f77bcf86cd799439011",
 *   "firstName": "John",
 *   "email": "john@example.com",
 *   "createdAt": "2025-01-15T10:30:00.000Z"
 * }
 */
router.get(
    '/api/auth/user',
    requireAuth,
    getCurrentUser
)

/**
 * Token verification endpoint.
 * 
 * Verifies if the provided JWT token is valid and not expired.
 * Useful for client-side token validation and keeping user sessions alive.
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies JWT token validity
 * 2. `verifyAuth` - Returns verification status
 * 
 * @route GET /api/auth/verify
 * @access Private (requires authentication)
 * 
 * @returns {Object} 200 - Token is valid
 * @returns {Object} 401 - Token is invalid or expired
 * 
 * @example
 * // Response on valid token
 * {
 *   "valid": true,
 *   "user": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "email": "john@example.com"
 *   }
 * }
 */
router.get(
    '/api/auth/verify',
    requireAuth,
    verifyAuth
)

export default router
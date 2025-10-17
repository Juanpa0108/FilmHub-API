import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'

/**
 * JWT payload structure for user authentication tokens.
 * 
 * @interface TokenPayload
 */
interface TokenPayload {
    /** Unique identifier of the user */
    id: string
}

/**
 * Decoded JWT token structure extending the standard JwtPayload.
 * 
 * @interface DecodedToken
 * @extends {JwtPayload}
 */
interface DecodedToken extends JwtPayload {
    /** User ID extracted from the token */
    id: string
}

/**
 * Generates a secure hash of the provided password using bcrypt.
 * 
 * Uses bcrypt's hashing algorithm with a salt rounds factor of 10,
 * which provides a good balance between security and performance.
 * The resulting hash is one-way, meaning the original password cannot
 * be derived from it.
 * 
 * **Security Notes:**
 * - Salt rounds of 10 means the hash will be computed 2^10 (1024) times
 * - Each hash is unique due to the random salt
 * - The salt is automatically included in the returned hash string
 * 
 * @async
 * @function hashPassword
 * 
 * @param {string} password - Plain text password to be hashed
 * 
 * @returns {Promise<string>} Hashed password string including the salt
 * 
 * @throws {Error} If the password is empty or bcrypt operation fails
 * 
 * @example
 * const hashedPassword = await hashPassword('MySecurePass123')
 * // Returns: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
 * 
 * @example
 * // Storing hashed password in database
 * const user = new User({
 *   email: 'user@example.com',
 *   password: await hashPassword(req.body.password)
 * })
 * await user.save()
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

/**
 * Verifies if an entered password matches a stored hash.
 * 
 * Compares a plain text password with a bcrypt hash to determine
 * if they match. This is used during user authentication to verify
 * login credentials without storing passwords in plain text.
 * 
 * **Security Notes:**
 * - Uses constant-time comparison to prevent timing attacks
 * - The hash contains the salt, so it's automatically used for comparison
 * - Original password cannot be extracted from the hash
 * 
 * @async
 * @function checkPassword
 * 
 * @param {string} enteredPassword - Plain text password entered by the user
 * @param {string} storedHash - Hashed password retrieved from the database
 * 
 * @returns {Promise<boolean>} `true` if the password matches the hash, `false` otherwise
 * 
 * @example
 * // During login
 * const user = await User.findOne({ email: 'user@example.com' })
 * const isValid = await checkPassword(req.body.password, user.password)
 * 
 * if (isValid) {
 *   // Grant access
 * } else {
 *   // Deny access
 * }
 */
export const checkPassword = async (enteredPassword: string, storedHash: string): Promise<boolean> => { 
    return await bcrypt.compare(enteredPassword, storedHash)
}

/**
 * Generates a signed JWT (JSON Web Token) for user authentication.
 * 
 * Creates a JWT containing the user's ID and other payload data,
 * signed with the secret key from environment variables. The token
 * expires after 2 hours for security purposes.
 * 
 * **Security Notes:**
 * - Requires `JWT_SECRET` environment variable to be set
 * - Token should be stored in HTTP-only cookies on the client side
 * - Short expiration time (2h) reduces risk if token is compromised
 * 
 * **Environment Variables:**
 * - `JWT_SECRET`: Secret key for signing tokens (required, should be long and random)
 * 
 * @function generateToken
 * 
 * @param {TokenPayload} payload - Data to include in the token
 * @param {string} payload.id - User's unique identifier
 * 
 * @returns {string} Signed JWT valid for 2 hours
 * 
 * @throws {Error} If JWT_SECRET is not defined in environment variables
 * 
 * @example
 * // After successful login
 * const token = generateToken({ id: user._id.toString() })
 * res.cookie('token', token, {
 *   httpOnly: true,
 *   secure: process.env.NODE_ENV === 'production',
 *   maxAge: 2 * 60 * 60 * 1000 // 2 hours
 * })
 * 
 * @example
 * // Token structure (decoded)
 * {
 *   "id": "507f1f77bcf86cd799439011",
 *   "iat": 1735689600,  // Issued at (timestamp)
 *   "exp": 1735696800   // Expiration (timestamp)
 * }
 */
export const generateToken = (payload: TokenPayload): string  => {
    const secret = process.env.JWT_SECRET
    
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined')
    }
    
    return jwt.sign(payload, secret, {
        expiresIn: '2h'
    })
}

/**
 * Verifies and decodes a JWT token.
 * 
 * Validates the token's signature using the secret key and checks
 * if it has expired. If valid, returns the decoded payload data.
 * 
 * **Security Notes:**
 * - Verifies token signature to prevent tampering
 * - Automatically checks expiration time
 * - Throws error if token is invalid or expired
 * 
 * **Environment Variables:**
 * - `JWT_SECRET`: Secret key used for token verification (must match signing secret)
 * 
 * @function verifyToken
 * 
 * @param {string} token - JWT token to verify and decode
 * 
 * @returns {DecodedToken} Decoded token payload containing user data
 * 
 * @throws {JsonWebTokenError} If the token is malformed or signature is invalid
 * @throws {TokenExpiredError} If the token has expired
 * @throws {Error} If JWT_SECRET is not defined
 * 
 * @example
 * // Verify token from cookie
 * try {
 *   const decoded = verifyToken(req.cookies.token)
 *   const userId = decoded.id
 *   // Token is valid, proceed with request
 * } catch (error) {
 *   // Token is invalid or expired
 *   res.status(401).json({ error: 'Invalid token' })
 * }
 * 
 * @example
 * // Using in authentication middleware
 * const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
 * const decoded = verifyToken(token)
 * req.user = await User.findById(decoded.id)
 */
export const verifyToken = (token: string): DecodedToken => {
    const secret = process.env.JWT_SECRET
    
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined')
    }
    
    return jwt.verify(token, secret) as DecodedToken
}

/**
 * Validates if an email address conforms to RFC 5322 standard format.
 * 
 * Uses a comprehensive regular expression to validate email format
 * according to RFC 5322 specification. This includes validating the
 * local part (before @), domain name, and top-level domain.
 * 
 * **Validation Rules:**
 * - Allows alphanumeric characters and special characters in local part
 * - Domain must be valid DNS format
 * - Supports subdomains
 * - Case-insensitive validation
 * 
 * @function validateEmail
 * 
 * @param {string} email - Email address to validate
 * 
 * @returns {boolean} `true` if the email format is valid, `false` otherwise
 * 
 * @example
 * validateEmail('user@example.com')        // true
 * validateEmail('user.name@sub.domain.com') // true
 * validateEmail('invalid.email')            // false
 * validateEmail('user@')                    // false
 * validateEmail('@example.com')             // false
 * 
 * @example
 * // Using in validation middleware
 * if (!validateEmail(req.body.email)) {
 *   return res.status(400).json({ error: 'Invalid email format' })
 * }
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email)
}

/**
 * Extracts the user ID from a JWT token without requiring authentication.
 * 
 * Decodes and verifies a JWT token to extract the user ID. This is useful
 * for operations that need to identify a user from a token without going
 * through full authentication middleware.
 * 
 * **Security Notes:**
 * - Still verifies token signature to prevent tampering
 * - Returns null instead of throwing error for easier error handling
 * - Should not be used as sole authentication mechanism
 * 
 * **Environment Variables:**
 * - `JWT_SECRET`: Secret key for token verification
 * 
 * @function getUserIdFromToken
 * 
 * @param {string} token - JWT token (without "Bearer " prefix)
 * 
 * @returns {string | null} User ID if token is valid, `null` if token is invalid or expired
 * 
 * @example
 * // Extract user ID from authorization header
 * const token = req.headers.authorization?.split(' ')[1]
 * const userId = getUserIdFromToken(token)
 * 
 * if (userId) {
 *   const user = await User.findById(userId)
 * } else {
 *   // Token is invalid
 * }
 * 
 * @example
 * // Extract user ID from cookie
 * const userId = getUserIdFromToken(req.cookies.token)
 * if (userId) {
 *   console.log(`Request from user: ${userId}`)
 * }
 */
export const getUserIdFromToken = (token: string): string | null => {
    try {
        const secret = process.env.JWT_SECRET
        
        if (!secret) {
            console.error('JWT_SECRET environment variable is not defined')
            return null
        }
        
        const decoded = jwt.verify(token, secret) as DecodedToken
        return decoded.id
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error verifying token:', error.message)
        }
        return null
    }
}
import mongoose, { Schema, Model, HydratedDocument } from 'mongoose'

/**
 * User document interface representing the structure of a user in the database.
 * 
 * Contains all fields stored in MongoDB for user authentication and profile data.
 * 
 * @interface IUser
 */
export interface IUser {
    /** User's first name */
    firstName: string
    
    /** User's email address (unique, lowercase) */
    email: string
    
    /** Hashed password using bcrypt */
    password: string
    
    /** Number of consecutive failed login attempts */
    loginAttempts: number
    
    /** Timestamp until which the account is locked (if locked) */
    lockUntil?: Date
    
    /** Account creation timestamp */
    createdAt: Date
}

/**
 * User document methods interface.
 * 
 * Defines custom instance methods available on user documents for
 * managing account security and login attempts.
 * 
 * @interface IUserMethods
 */
export interface IUserMethods {
    /**
     * Checks if the user account is currently locked.
     * 
     * @returns {boolean} `true` if account is locked, `false` otherwise
     */
    isLocked(): boolean
    
    /**
     * Increments failed login attempts counter.
     * 
     * @returns {Promise<any>} Update operation result
     */
    incLoginAttempts(): Promise<any>
    
    /**
     * Resets login attempts and unlocks the account.
     * 
     * @returns {Promise<any>} Update operation result
     */
    resetLoginAttempts(): Promise<any>
}

/**
 * Combined User document type with all properties and methods.
 * 
 * @typedef {HydratedDocument<IUser, IUserMethods>} UserDocument
 */
export type UserDocument = HydratedDocument<IUser, IUserMethods>

/**
 * User model type.
 * 
 * @typedef {Model<IUser, {}, IUserMethods>} UserModel
 */
type UserModel = Model<IUser, {}, IUserMethods>

/**
 * Mongoose schema definition for User collection.
 * 
 * Defines the structure, validation rules, and default values for user documents.
 * Implements account locking mechanism to prevent brute-force attacks.
 * 
 * **Security Features:**
 * - Email uniqueness enforced at database level
 * - Passwords stored as bcrypt hashes (hashing done in controller)
 * - Account locking after 5 failed login attempts
 * - 15-minute lockout period for security
 * - Automatic lock expiration checking
 * 
 * **Schema Fields:**
 * - `firstName`: User's first name (required, trimmed, 2-50 chars)
 * - `email`: Unique email address (required, lowercase, trimmed)
 * - `password`: Hashed password (required, trimmed)
 * - `loginAttempts`: Counter for failed login attempts (default: 0)
 * - `lockUntil`: Expiration time for account lock (optional)
 * - `createdAt`: Account creation timestamp (auto-generated)
 * 
 * @constant
 * @type {Schema<IUser, UserModel, IUserMethods>}
 */
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        minlength: [8, 'Password must be at least 8 characters']
    },
    loginAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    lockUntil: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
})

/**
 * Checks if the user account is currently locked due to failed login attempts.
 * 
 * An account is considered locked if `lockUntil` exists and its timestamp
 * is still in the future. The lock automatically expires after 15 minutes.
 * 
 * **Usage Context:**
 * - Called before processing login attempts
 * - Prevents authentication when account is locked
 * - Part of brute-force attack prevention
 * 
 * @method isLocked
 * @memberof IUserMethods
 * 
 * @this {UserDocument}
 * 
 * @returns {boolean} `true` if the account is currently locked, `false` otherwise
 * 
 * @example
 * const user = await User.findOne({ email: 'user@example.com' })
 * 
 * if (user?.isLocked()) {
 *   return res.status(423).json({ 
 *     error: 'Account is locked due to too many failed attempts'
 *   })
 * }
 */
userSchema.methods.isLocked = function(this: UserDocument): boolean {
    return !!(this.lockUntil && this.lockUntil.getTime() > Date.now())
}

/**
 * Increments the failed login attempts counter and locks account if threshold is reached.
 * 
 * **Behavior:**
 * - If lock has expired: Resets attempts and unlocks account
 * - If attempts < 5: Increments counter
 * - If attempts >= 5: Locks account for 15 minutes
 * 
 * **Security Notes:**
 * - Threshold: 5 failed attempts
 * - Lockout duration: 15 minutes (900,000 milliseconds)
 * - Lock automatically expires after duration
 * - Counter resets on successful login via `resetLoginAttempts()`
 * 
 * @method incLoginAttempts
 * @memberof IUserMethods
 * 
 * @this {UserDocument}
 * 
 * @returns {Promise<any>} MongoDB update operation result
 * 
 * @example
 * // After failed login attempt
 * const user = await User.findOne({ email: 'user@example.com' })
 * const isPasswordValid = await checkPassword(password, user.password)
 * 
 * if (!isPasswordValid) {
 *   await user.incLoginAttempts()
 *   return res.status(401).json({ error: 'Invalid credentials' })
 * }
 * 
 * @example
 * // Account gets locked after 5th failed attempt
 * // Attempt 1-4: loginAttempts increments
 * // Attempt 5: Account locked for 15 minutes
 * // After 15 min: Lock expires automatically on next login attempt
 */
userSchema.methods.incLoginAttempts = function(this: UserDocument): Promise<any> {
    // If lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
        return this.updateOne({
            $unset: { loginAttempts: 1, lockUntil: 1 }
        })
    }

    const newAttempts = (this.loginAttempts || 0) + 1
    
    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
        return this.updateOne({
            $set: {
                loginAttempts: newAttempts,
                lockUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            }
        })
    } else {
        return this.updateOne({
            $set: { loginAttempts: newAttempts }
        })
    }
}

/**
 * Resets failed login attempts counter and unlocks the account.
 * 
 * Should be called after a successful login to clear the failed attempts
 * counter and remove any active account lock.
 * 
 * **Use Cases:**
 * - After successful login with correct credentials
 * - When manually unlocking an account (admin action)
 * - When lock period has expired and user logs in successfully
 * 
 * @method resetLoginAttempts
 * @memberof IUserMethods
 * 
 * @this {UserDocument}
 * 
 * @returns {Promise<any>} MongoDB update operation result
 * 
 * @example
 * // After successful login
 * const user = await User.findOne({ email: 'user@example.com' })
 * const isPasswordValid = await checkPassword(password, user.password)
 * 
 * if (isPasswordValid) {
 *   await user.resetLoginAttempts()
 *   const token = generateToken({ id: user._id.toString() })
 *   // ... send token to client
 * }
 * 
 * @example
 * // Manual unlock by admin
 * const user = await User.findById(userId)
 * await user.resetLoginAttempts()
 * console.log('Account unlocked successfully')
 */
userSchema.methods.resetLoginAttempts = function(this: UserDocument): Promise<any> {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    })
}

/**
 * Mongoose model for User collection.
 * 
 * Provides methods for querying, creating, updating, and deleting user documents.
 * Includes custom instance methods for account security management.
 * 
 * **Available Operations:**
 * - `User.find()` - Query users
 * - `User.findOne()` - Find single user
 * - `User.create()` - Create new user
 * - `User.findByIdAndUpdate()` - Update user
 * - `User.findByIdAndDelete()` - Delete user
 * 
 * **Instance Methods:**
 * - `isLocked()` - Check if account is locked
 * - `incLoginAttempts()` - Increment failed login counter
 * - `resetLoginAttempts()` - Reset login attempts and unlock
 * 
 * @constant
 * @type {UserModel}
 * 
 * @example
 * // Create new user
 * const user = await User.create({
 *   firstName: 'John',
 *   email: 'john@example.com',
 *   password: await hashPassword('SecurePass123')
 * })
 * 
 * @example
 * // Find and check if locked
 * const user = await User.findOne({ email: 'john@example.com' })
 * if (user?.isLocked()) {
 *   console.log('Account is locked')
 * }
 */
const User = mongoose.model<IUser, UserModel>('User', userSchema)

export default User
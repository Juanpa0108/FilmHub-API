import mongoose, { Schema } from "mongoose"

/**
 * User schema in MongoDB.
 * Contains personal information, credentials, and login security.
 * 
 * @constant
 * @type {mongoose.Schema}
 */
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

/**
 * Checks if the user's account is locked.
 * @function isLocked
 * @memberof userSchema.methods
 * @returns {boolean} `true` if the user is locked, `false` otherwise.
 */
userSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil.getTime() > Date.now()
}

/**
 * Increments the user's failed login attempts.
 * If it reaches 5 attempts, locks the account for 15 minutes.
 * @function incLoginAttempts
 * @memberof userSchema.methods
 * @returns {Promise<mongoose.UpdateWriteOpResult>} Result of the update operation.
 */
userSchema.methods.incLoginAttempts = function() {
    if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
        return this.updateOne({
            $unset: { loginAttempts: 1, lockUntil: 1 }
        })
    }

    const newAttempts = (this.loginAttempts || 0) + 1
    
    if (newAttempts >= 5) {
        return this.updateOne({
            $set: {
                loginAttempts: newAttempts,
                lockUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minuts
            }
        })
    } else {
        return this.updateOne({
            $set: { loginAttempts: newAttempts }
        })
    }
}

/**
 * Resets failed login attempts and unlocks the account.
 * @function resetLoginAttempts
 * @memberof userSchema.methods
 * @returns {Promise<mongoose.UpdateWriteOpResult>} Result of the update operation.
 */
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    })
}

/**
 * User model based on the `userSchema`.
 * 
 * @constant
 * @type {mongoose.Model<mongoose.Document>}
 */
/** @type {IUser} */
const User = mongoose.model('User', userSchema);
export default User


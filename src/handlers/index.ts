import { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword, checkPassword, generateToken } from '../utils/auths'
import { AuthEmail } from '../emails/AuthEmail'

/**
 * Creates a new user account.
 * 
 * @async
 * @function createAccount
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const createAccount = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { email, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(409).json({ error: 'A user with that email is already registered' })
    }

    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.createdAt = new Date()
    await user.save()

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'There was a server error' })
  }
}

/**
 * User login.
 * 
 * @async
 * @function loginUser
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const loginUser = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isPasswordValid = await checkPassword(password, user.password)
    if (!isPasswordValid) {
      await user.incLoginAttempts()
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (user.loginAttempts && user.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    const token = generateToken({ id: user.id })

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000
    })

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      redirect: '/mainDashBoard.html'
    })
  } catch (error) {
    console.error('Error in loginUser:', error)
    res.status(500).json({ error: 'Try again later' })
  }
}

/**
 * Gets the current authenticated user.
 *
 * @async
 * @function getCurrentUser
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    res.status(200).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    res.status(500).json({ error: 'Error fetching user data' })
  }
}

/**
 * Checks if a user is authenticated.
 *
 * @async
 * @function verifyAuth
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const verifyAuth = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ valid: false, error: 'Invalid token' })
    }

    res.status(200).json({
      valid: true,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        email: req.user.email
      }
    })
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' })
  }
}

/**
 * Initiates the password recovery process.
 *
 * @async
 * @function forgotPassword
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void | Response> => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    const error = new Error('There is no user with that email')
    return res.status(404).json({ error: error.message })
  }

  await AuthEmail.sendConfirmationEmail({ name: user.firstName, email: user.email, id: user._id })

  res.json({ msg: 'We have sent an email with instructions' })
}

/**
 * Resets a user's password using an ID received in the query parameters.
 *
 * @async
 * @function resetPassword
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /reset-password?id=123
 * // Body: { "password": "12345678", "confirmPassword": "12345678" }
 * // Response: { "msg": "Password updated successfully" }
 */
export const resetPassword = async (req: Request, res: Response): Promise<void | Response> => {
  const { password, confirmPassword } = req.body
  const { id } = req.query

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }

  const user = await User.findById(id as string)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  user.password = await hashPassword(password)
  await user.save()
  res.json({ msg: 'Password updated successfully' })
}

/**
 * Retrieves a user by their ID from the query parameters.
 * Excludes certain sensitive fields in the response.
 *
 * @async
 * @function getUserById
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /user?id=123
 * // Response: { "user": { "_id": "123", ... } }
 */
export const getUserById = async (req: Request, res: Response): Promise<void | Response> => {
  const { id } = req.query
  try {
    const user = await User.findById(id as string).select('-firstName -lastName -age -email')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ user })
  } catch (error) {
    console.error('Error in getUserById:', error)
    res.status(500).json({ error: 'Error fetching user data' })
  }
}

/**
 * Updates the authenticated user's data.
 * Only fields that are not null, undefined, or empty strings will be updated.
 *
 * @async
 * @function updateUser
 * @param {Object} req - HTTP request object. `req.user` is expected to contain the authenticated user's ID.
 * @param {Object} res - HTTP response object.
 * @returns {Promise<void>}
 
 * @example
 * // PUT /user
 * // Body: { "firstName": "Juan", "age": 25 }
 * // Response: { "message": "User updated successfully", "user": {...} }
 */
export const updateUser = async (req: Request, res: Response): Promise<void | Response> => {
  const { id } = req.user!
  const updates = req.body

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Validate if user email already exists in DB
    if (updates.email && updates.email !== user.email) {
      const emailExists = await User.findOne({ email: updates.email })
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists in database' })
      }
    }

    // Only update if the value is not null, undefined, or an empty string
    Object.keys(updates).forEach((key) => {
      const value = updates[key]
      if (value !== null && value !== undefined && value !== '') {
        (user as any)[key] = value
      }
    })

    await user.save()
    res.status(200).json({ message: 'User updated successfully', user })
  } catch (error) {
    console.error('Error in updateUser:', error)
    res.status(500).json({ error: 'Error updating user data' })
  }
}

/**
 * Deletes the authenticated user's account and related resources.
 * Requires password confirmation.
 * 
 * @async
 * @function deleteUserAccount
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<void>}
 */
export const deleteUserAccount = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const userId = req.user?.id
    const { password } = req.body || {}

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Re-read user with password
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isValid = await checkPassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    // Here you could add logic to delete user-related data

    // Delete user
    await User.findByIdAndDelete(user._id)

    // Optional: clear session cookie if exists
    res.clearCookie?.('authToken')

    return res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error in deleteUserAccount:', error)
    return res.status(500).json({ error: 'Error deleting account' })
  }
}
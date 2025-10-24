import { Request, Response } from 'express'
import { body, param, validationResult } from 'express-validator'
import Favorite from '../models/Favorite.js'

/**
 * Validation rules for adding a movie to favorites.
 * 
 * Ensures that the movieId is provided and is a valid string.
 * 
 * @constant {Array} validateAddFavorite
 */
export const validateAddFavorite = [
  body('movieId').notEmpty().withMessage('movieId is required').isString(),
]

/**
 * Adds a movie to the user's favorites list.
 * 
 * Creates a new favorite entry or updates an existing one if it already exists.
 * Uses upsert operation to prevent duplicate favorites for the same user-movie combination.
 * 
 * @async
 * @function addFavorite
 * @param {Request} req - Express request object containing user info and movieId
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with favorite data or error
 */
export const addFavorite = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const { movieId } = req.body
    const fav = await Favorite.findOneAndUpdate(
      { user: userId, movieId },
      { $setOnInsert: { user: userId, movieId } },
      { upsert: true, new: true }
    )
    return res.status(201).json({ favorite: fav })
  } catch (e) {
    console.error('addFavorite error', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Validation rules for removing a movie from favorites.
 * 
 * Ensures that the movieId parameter is provided in the URL.
 * 
 * @constant {Array} removeFavoriteValidators
 */
export const removeFavoriteValidators = [
  param('movieId').notEmpty().withMessage('movieId param required')
]

/**
 * Removes a movie from the user's favorites list.
 * 
 * Deletes the favorite entry for the specified user and movie combination.
 * Returns 404 if the favorite doesn't exist.
 * 
 * @async
 * @function removeFavorite
 * @param {Request} req - Express request object containing user info and movieId param
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with success status or error
 */
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const { movieId } = req.params
    const result = await Favorite.deleteOne({ user: userId, movieId })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('removeFavorite error', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Retrieves all favorites for the authenticated user.
 * 
 * Returns a list of all movies that the user has marked as favorites,
 * sorted by creation date (newest first).
 * 
 * @async
 * @function listMyFavorites
 * @param {Request} req - Express request object containing user info
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with favorites array or error
 */
export const listMyFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ favorites })
  } catch (e) {
    console.error('listMyFavorites error', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

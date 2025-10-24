import { Request, Response } from 'express'
import { body, param, validationResult } from 'express-validator'
import Favorite from '../models/Favorite.js'

export const validateAddFavorite = [
  body('movieId').notEmpty().withMessage('movieId is required').isString(),
]

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

export const removeFavoriteValidators = [
  param('movieId').notEmpty().withMessage('movieId param required')
]

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

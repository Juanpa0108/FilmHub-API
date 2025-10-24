import { Request, Response } from 'express'
import { body, param, validationResult } from 'express-validator'
import Review from '../models/Review.js'

export const validateCreateReview = [
  body('movieId').notEmpty().withMessage('movieId is required').isString(),
  body('movieTitle').optional().isString(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating 1-5'),
  body('text').isString().isLength({ min: 1, max: 1000 }).withMessage('text required'),
]

export const createReview = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { movieId, movieTitle } = req.body
    // Coerce and sanitize payload defensively
    const rating = Number.parseInt(req.body?.rating as any, 10)
    const text = String(req.body?.text ?? '').trim()
    if (!movieId || !text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    let movieRef: any = undefined
    if (typeof movieId === 'string' && /^[0-9a-fA-F]{24}$/.test(movieId)) {
      movieRef = movieId
    }
    const review = await Review.create({ user: userId, movieId, movie: movieRef, movieTitle, rating, text })
    return res.status(201).json({ review })
  } catch (e) {
      const msg = (e as any)?.message || String(e)
      const stack = (e as any)?.stack
      console.error('createReview error', msg, stack)
      const detail = process.env.NODE_ENV === 'production' ? undefined : msg
    return res.status(500).json({ error: 'Server error', detail })
  }
}

export const listMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const reviews = await Review.find({ user: userId }).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ reviews })
  } catch (e) {
    console.error('listMyReviews error', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

export const listByMovie = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.query
    if (!movieId) return res.status(400).json({ error: 'movieId required' })

    const reviews = await Review.find({ movieId: String(movieId) }).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ reviews })
  } catch (e) {
    console.error('listByMovie error', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

export const deleteReviewValidators = [
  param('id').isString().isLength({ min: 1 }).withMessage('review id required')
]

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const { id } = req.params
    const review = await Review.findById(id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    if (String(review.user) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await Review.deleteOne({ _id: id })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('deleteReview error', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

export const updateReviewValidators = [
  param('id').isString().isLength({ min: 1 }).withMessage('review id required'),
  body('text').optional().isString().isLength({ min: 1, max: 1000 }).withMessage('text 1-1000'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating 1-5'),
]

export const updateReview = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const { id } = req.params
    const review = await Review.findById(id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    if (String(review.user) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const updates: any = {}
    if (typeof req.body?.text === 'string') updates.text = String(req.body.text).trim()
    if (typeof req.body?.rating !== 'undefined') updates.rating = Number.parseInt(req.body.rating, 10)
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No changes provided' })
    }
    await Review.updateOne({ _id: id }, { $set: updates })
    const updated = await Review.findById(id).lean()
    return res.status(200).json({ review: updated })
  } catch (e) {
    const msg = (e as any)?.message || String(e)
    return res.status(500).json({ error: 'Server error', detail: msg })
  }
}

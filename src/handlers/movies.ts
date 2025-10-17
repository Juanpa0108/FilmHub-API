import { Request, Response } from 'express'
import Movie from '../models/Movie'

/**
 * Get all movies with pagination and filtering.
 * 
 * @async
 * @function getMovies
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const getMovies = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const genre = req.query.genre as string
    const search = req.query.search as string
    const sortBy = (req.query.sortBy as string) || 'createdAt'
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1

    // Build filters
    const filters: any = { isActive: true }
    
    if (genre) {
      filters.genre = { $in: [genre] }
    }
    
    if (search) {
      filters.$text = { $search: search }
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder

    const skip = (page - 1) * limit

    const [movies, total] = await Promise.all([
      Movie.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title shortDescription poster genre year rating duration director'),
      Movie.countDocuments(filters)
    ])

    const totalPages = Math.ceil(total / limit)

    res.status(200).json({
      movies,
      pagination: {
        currentPage: page,
        totalPages,
        totalMovies: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error in getMovies:', error)
    res.status(500).json({ error: 'Error fetching movies' })
  }
}

/**
 * Get a single movie by ID.
 * 
 * @async
 * @function getMovieById
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const getMovieById = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid movie ID' })
    }

    const movie = await Movie.findOne({ _id: id, isActive: true })

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' })
    }

    res.status(200).json({ movie })
  } catch (error) {
    console.error('Error in getMovieById:', error)
    res.status(500).json({ error: 'Error fetching movie' })
  }
}

/**
 * Get featured movies (highest rated).
 * 
 * @async
 * @function getFeaturedMovies
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const getFeaturedMovies = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6

    const movies = await Movie.find({ isActive: true, rating: { $gte: 7 } })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .select('title shortDescription poster genre year rating')

    res.status(200).json({ movies })
  } catch (error) {
    console.error('Error in getFeaturedMovies:', error)
    res.status(500).json({ error: 'Error fetching featured movies' })
  }
}

/**
 * Get movies by genre.
 * 
 * @async
 * @function getMoviesByGenre
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const getMoviesByGenre = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { genre } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12

    const skip = (page - 1) * limit

    const [movies, total] = await Promise.all([
      Movie.find({ genre: { $in: [genre] }, isActive: true })
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title shortDescription poster genre year rating'),
      Movie.countDocuments({ genre: { $in: [genre] }, isActive: true })
    ])

    const totalPages = Math.ceil(total / limit)

    res.status(200).json({
      movies,
      genre,
      pagination: {
        currentPage: page,
        totalPages,
        totalMovies: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error in getMoviesByGenre:', error)
    res.status(500).json({ error: 'Error fetching movies by genre' })
  }
}

/**
 * Get available genres.
 * 
 * @async
 * @function getGenres
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const getGenres = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const genres = await Movie.distinct('genre', { isActive: true })
    
    res.status(200).json({ genres })
  } catch (error) {
    console.error('Error in getGenres:', error)
    res.status(500).json({ error: 'Error fetching genres' })
  }
}
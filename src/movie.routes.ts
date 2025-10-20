import { Router } from 'express'
import { 
    getMovies, 
    getMovieById, 
    getFeaturedMovies, 
    getMoviesByGenre,
    getGenres 
} from './handlers/movies.js'
import { requireAuth } from './middleware/auth.js'

/**
 * Express Router instance for movie-related endpoints.
 * 
 * This router handles all movie operations including:
 * - Listing movies with pagination and filtering
 * - Retrieving individual movie details
 * - Getting featured/highlighted movies
 * - Filtering movies by genre
 * - Retrieving available genres
 * 
 * All endpoints require authentication via JWT token.
 * 
 * @constant
 * @type {Router}
 */
const router: Router = Router()

/**
 * Get all movies with pagination, filtering, and sorting capabilities.
 * 
 * Retrieves a paginated list of movies with optional filtering by genre,
 * search term, and custom sorting. Returns metadata about pagination
 * including total count, current page, and total pages.
 * 
 * **Query Parameters:**
 * - `page`: Page number for pagination (default: 1)
 * - `limit`: Number of items per page (default: 12, max: 50)
 * - `genre`: Filter movies by specific genre
 * - `search`: Search term to filter by title or description
 * - `sortBy`: Field to sort by (e.g., 'title', 'releaseDate', 'rating', 'createdAt')
 * - `sortOrder`: Sort direction, either 'asc' or 'desc' (default: 'desc')
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies user authentication
 * 2. `getMovies` - Retrieves and returns paginated movie list
 * 
 * @route GET /api/movies
 * @access Private (requires authentication)
 * 
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=12] - Items per page
 * @param {string} [req.query.genre] - Genre filter
 * @param {string} [req.query.search] - Search term
 * @param {string} [req.query.sortBy=createdAt] - Sort field
 * @param {string} [req.query.sortOrder=desc] - Sort order (asc/desc)
 * 
 * @returns {Object} 200 - Paginated movie list with metadata
 * @returns {Object} 401 - Unauthorized (invalid or missing token)
 * @returns {Object} 400 - Invalid query parameters
 * 
 * @example
 * // Request
 * GET /api/movies?page=1&limit=12&genre=Action&sortBy=rating&sortOrder=desc
 * 
 * // Response
 * {
 *   "movies": [
 *     {
 *       "id": "507f1f77bcf86cd799439011",
 *       "title": "The Dark Knight",
 *       "genre": "Action",
 *       "rating": 9.0,
 *       "releaseDate": "2008-07-18",
 *       "poster": "https://..."
 *     }
 *   ],
 *   "pagination": {
 *     "currentPage": 1,
 *     "totalPages": 5,
 *     "totalItems": 58,
 *     "itemsPerPage": 12
 *   }
 * }
 */
router.get(
    '/api/movies',
    requireAuth,
    getMovies
)

/**
 * Get detailed information about a specific movie by its ID.
 * 
 * Retrieves complete details for a single movie including title, description,
 * cast, crew, rating, release date, runtime, and all associated metadata.
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies user authentication
 * 2. `getMovieById` - Retrieves and returns movie details
 * 
 * @route GET /api/movies/:id
 * @access Private (requires authentication)
 * 
 * @param {string} req.params.id - MongoDB ObjectId of the movie
 * 
 * @returns {Object} 200 - Movie details
 * @returns {Object} 401 - Unauthorized (invalid or missing token)
 * @returns {Object} 404 - Movie not found
 * @returns {Object} 400 - Invalid movie ID format
 * 
 * @example
 * // Request
 * GET /api/movies/507f1f77bcf86cd799439011
 * 
 * // Response
 * {
 *   "id": "507f1f77bcf86cd799439011",
 *   "title": "Inception",
 *   "description": "A thief who steals corporate secrets...",
 *   "genre": "Sci-Fi",
 *   "rating": 8.8,
 *   "releaseDate": "2010-07-16",
 *   "runtime": 148,
 *   "director": "Christopher Nolan",
 *   "cast": ["Leonardo DiCaprio", "Ellen Page"],
 *   "poster": "https://...",
 *   "trailer": "https://..."
 * }
 */
router.get(
    '/api/movies/:id',
    requireAuth,
    getMovieById
)

/**
 * Get featured movies (highest rated or most popular).
 * 
 * Retrieves a curated list of featured movies, typically the highest-rated
 * or most popular films. Useful for homepage highlights or recommendations.
 * 
 * **Query Parameters:**
 * - `limit`: Number of featured movies to return (default: 6, max: 20)
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies user authentication
 * 2. `getFeaturedMovies` - Retrieves featured movies
 * 
 * @route GET /api/movies/featured
 * @access Private (requires authentication)
 * 
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=6] - Number of featured movies
 * 
 * @returns {Object} 200 - List of featured movies
 * @returns {Object} 401 - Unauthorized (invalid or missing token)
 * 
 * @example
 * // Request
 * GET /api/movies/featured?limit=6
 * 
 * // Response
 * {
 *   "movies": [
 *     {
 *       "id": "507f1f77bcf86cd799439011",
 *       "title": "The Shawshank Redemption",
 *       "rating": 9.3,
 *       "poster": "https://...",
 *       "genre": "Drama"
 *     }
 *   ]
 * }
 */
router.get(
    '/api/movies/featured',
    requireAuth,
    getFeaturedMovies
)

/**
 * Get movies filtered by a specific genre with pagination.
 * 
 * Retrieves all movies belonging to a specific genre category.
 * Supports pagination to handle large genre collections efficiently.
 * 
 * **Path Parameters:**
 * - `genre`: Genre name (e.g., 'Action', 'Comedy', 'Drama')
 * 
 * **Query Parameters:**
 * - `page`: Page number for pagination (default: 1)
 * - `limit`: Number of items per page (default: 12, max: 50)
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies user authentication
 * 2. `getMoviesByGenre` - Retrieves movies filtered by genre
 * 
 * @route GET /api/movies/genre/:genre
 * @access Private (requires authentication)
 * 
 * @param {string} req.params.genre - Genre name to filter by
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=12] - Items per page
 * 
 * @returns {Object} 200 - Paginated list of movies in the specified genre
 * @returns {Object} 401 - Unauthorized (invalid or missing token)
 * @returns {Object} 404 - Genre not found
 * 
 * @example
 * // Request
 * GET /api/movies/genre/Action?page=1&limit=12
 * 
 * // Response
 * {
 *   "genre": "Action",
 *   "movies": [
 *     {
 *       "id": "507f1f77bcf86cd799439011",
 *       "title": "Mad Max: Fury Road",
 *       "rating": 8.1,
 *       "releaseDate": "2015-05-15"
 *     }
 *   ],
 *   "pagination": {
 *     "currentPage": 1,
 *     "totalPages": 3,
 *     "totalItems": 35
 *   }
 * }
 */
router.get(
    '/api/movies/genre/:genre',
    requireAuth,
    getMoviesByGenre
)

/**
 * Get list of all available movie genres.
 * 
 * Retrieves a complete list of all unique genres available in the database.
 * Useful for populating genre filters, navigation menus, or category pages.
 * May include movie counts per genre.
 * 
 * **Middleware Chain:**
 * 1. `requireAuth` - Verifies user authentication
 * 2. `getGenres` - Retrieves list of genres
 * 
 * @route GET /api/movies/genres
 * @access Private (requires authentication)
 * 
 * @returns {Object} 200 - List of available genres
 * @returns {Object} 401 - Unauthorized (invalid or missing token)
 * 
 * @example
 * // Request
 * GET /api/movies/genres
 * 
 * // Response
 * {
 *   "genres": [
 *     { "name": "Action", "count": 45 },
 *     { "name": "Comedy", "count": 38 },
 *     { "name": "Drama", "count": 52 },
 *     { "name": "Sci-Fi", "count": 27 }
 *   ]
 * }
 */
router.get(
    '/api/movies/genres',
    requireAuth,
    getGenres
)

export default router
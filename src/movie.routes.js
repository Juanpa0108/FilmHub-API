import { Router } from "express"
import { 
    getMovies, 
    getMovieById, 
    getFeaturedMovies, 
    getMoviesByGenre,
    getGenres 
} from "./handlers/movies.js"
import { requireAuth } from "./middleware/auth.js"

const router = Router()

/**
 * @module MovieRoutes
 * @description Movie-related routes for FlimHub API.
 */

/**
 * Get all movies with pagination and filtering.
 * @name GET /api/movies
 * @function
 * @memberof module:MovieRoutes
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 12)
 * @param {string} genre - Filter by genre
 * @param {string} search - Search term
 * @param {string} sortBy - Sort field (default: createdAt)
 * @param {string} sortOrder - Sort order (asc/desc, default: desc)
 */
router.get(
    "/api/movies",
    requireAuth,
    getMovies
)

/**
 * Get a single movie by ID.
 * @name GET /api/movies/:id
 * @function
 * @memberof module:MovieRoutes
 * @param {string} id - Movie ID
 */
router.get(
    "/api/movies/:id",
    requireAuth,
    getMovieById
)

/**
 * Get featured movies (highest rated).
 * @name GET /api/movies/featured
 * @function
 * @memberof module:MovieRoutes
 * @param {number} limit - Number of featured movies (default: 6)
 */
router.get(
    "/api/movies/featured",
    requireAuth,
    getFeaturedMovies
)

/**
 * Get movies by genre.
 * @name GET /api/movies/genre/:genre
 * @function
 * @memberof module:MovieRoutes
 * @param {string} genre - Genre name
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 12)
 */
router.get(
    "/api/movies/genre/:genre",
    requireAuth,
    getMoviesByGenre
)

/**
 * Get available genres.
 * @name GET /api/movies/genres
 * @function
 * @memberof module:MovieRoutes
 */
router.get(
    "/api/movies/genres",
    requireAuth,
    getGenres
)

export default router

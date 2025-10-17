import mongoose, { Schema, Model, HydratedDocument, CallbackWithoutResultAndOptionalError } from 'mongoose'

/**
 * Movie document interface representing the structure of a movie in the database.
 * 
 * Contains all movie information including metadata, media assets, and ratings.
 * 
 * @interface IMovie
 */
export interface IMovie {
    /** Movie title (max 100 characters) */
    title: string
    
    /** Full movie description (max 1000 characters) */
    description: string
    
    /** Brief movie synopsis (max 200 characters) */
    shortDescription: string
    
    /** URL to the movie poster image */
    poster: string
    
    /** URL to the movie backdrop/banner image (optional) */
    backdrop?: string
    
    /** Array of genre tags (e.g., ['Action', 'Sci-Fi']) */
    genre: string[]
    
    /** Release year (1900 to current year + 5) */
    year: number
    
    /** Movie duration in minutes */
    duration: number
    
    /** Movie rating from 0 to 10 (default: 0) */
    rating: number
    
    /** Director's full name */
    director: string
    
    /** Array of main cast members' names */
    cast: string[]
    
    /** URL to movie trailer video (optional) */
    trailer?: string
    
    /** Whether the movie is active/visible (default: true) */
    isActive: boolean
    
    /** Document creation timestamp */
    createdAt: Date
    
    /** Last update timestamp */
    updatedAt: Date
}

/**
 * Combined Movie document type with all Mongoose methods.
 * 
 * @typedef {HydratedDocument<IMovie>} MovieDocument
 */
export type MovieDocument = HydratedDocument<IMovie>

/**
 * Movie model type.
 * 
 * @typedef {Model<IMovie>} MovieModel
 */
type MovieModel = Model<IMovie>

/**
 * Mongoose schema definition for Movie collection.
 * 
 * Defines the structure, validation rules, indexes, and middleware for movie documents.
 * Optimized for efficient searching and filtering operations.
 * 
 * **Schema Features:**
 * - Text search indexing on title and description
 * - Optimized indexes for genre, year, and rating queries
 * - Automatic updatedAt timestamp management
 * - Comprehensive validation rules
 * 
 * **Schema Fields:**
 * - `title`: Movie title (required, max 100 chars)
 * - `description`: Full description (required, max 1000 chars)
 * - `shortDescription`: Brief synopsis (required, max 200 chars)
 * - `poster`: Poster image URL (required)
 * - `backdrop`: Banner image URL (optional)
 * - `genre`: Array of genre tags (required, can be empty)
 * - `year`: Release year (1900 to current+5)
 * - `duration`: Runtime in minutes (min 1)
 * - `rating`: Score 0-10 (default: 0)
 * - `director`: Director name (required)
 * - `cast`: Array of cast member names
 * - `trailer`: Trailer video URL (optional)
 * - `isActive`: Visibility flag (default: true)
 * - `createdAt`: Creation timestamp (auto-generated)
 * - `updatedAt`: Last update timestamp (auto-updated)
 * 
 * **Indexes:**
 * - Text index on `title` and `description` for full-text search
 * - Single field index on `genre` for genre filtering
 * - Single field index on `year` for year filtering
 * - Descending index on `rating` for sorting by rating
 * 
 * @constant
 * @type {Schema<IMovie, MovieModel>}
 */
const movieSchema = new Schema<IMovie, MovieModel>({
    title: {
        type: String,
        required: [true, 'Movie title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Movie description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    poster: {
        type: String,
        required: [true, 'Poster image is required'],
        trim: true
    },
    backdrop: {
        type: String,
        trim: true
    },
    genre: {
        type: [String],
        required: [true, 'At least one genre is required'],
        default: []
    },
    year: {
        type: Number,
        required: [true, 'Release year is required'],
        min: [1900, 'Year must be 1900 or later'],
        max: [new Date().getFullYear() + 5, 'Year cannot be more than 5 years in the future']
    },
    duration: {
        type: Number,
        required: [true, 'Movie duration is required'],
        min: [1, 'Duration must be at least 1 minute']
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [10, 'Rating cannot exceed 10'],
        default: 0
    },
    director: {
        type: String,
        required: [true, 'Director name is required'],
        trim: true
    },
    cast: {
        type: [String],
        default: []
    },
    trailer: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

/**
 * Text search index for efficient full-text search on title and description.
 * 
 * Enables MongoDB text search queries using $text operator.
 * Useful for implementing search functionality across movie titles and descriptions.
 * 
 * @index text
 * 
 * @example
 * // Search movies by text
 * const movies = await Movie.find({
 *   $text: { $search: 'space adventure' }
 * })
 */
movieSchema.index({ title: 'text', description: 'text' })

/**
 * Genre index for efficient filtering by genre.
 * 
 * Speeds up queries that filter movies by genre category.
 * 
 * @index genre
 * 
 * @example
 * // Find all action movies
 * const actionMovies = await Movie.find({ genre: 'Action' })
 */
movieSchema.index({ genre: 1 })

/**
 * Year index for efficient filtering and sorting by release year.
 * 
 * Optimizes queries that filter or sort movies by release year.
 * 
 * @index year
 * 
 * @example
 * // Find movies from 2020
 * const movies2020 = await Movie.find({ year: 2020 })
 */
movieSchema.index({ year: 1 })

/**
 * Rating index (descending) for efficient sorting by rating.
 * 
 * Optimizes queries that retrieve top-rated movies.
 * Descending order (-1) allows fast retrieval of highest-rated movies first.
 * 
 * @index rating
 * 
 * @example
 * // Get top-rated movies
 * const topMovies = await Movie.find().sort({ rating: -1 }).limit(10)
 */
movieSchema.index({ rating: -1 })

/**
 * Pre-save middleware to automatically update the `updatedAt` timestamp.
 * 
 * This middleware runs before every save operation and ensures that
 * the `updatedAt` field is always set to the current date and time.
 * 
 * **Execution Context:**
 * - Triggered on: `save()` and `create()` operations
 * - Not triggered on: `updateOne()`, `findOneAndUpdate()`, etc.
 * 
 * @middleware pre-save
 * 
 * @this {MovieDocument}
 * @param {CallbackWithoutResultAndOptionalError} next - Callback to continue middleware chain
 * 
 * @example
 * // updatedAt is automatically set when saving
 * const movie = await Movie.findById(movieId)
 * movie.title = 'Updated Title'
 * await movie.save() // updatedAt is automatically updated
 */
movieSchema.pre('save', function(this: MovieDocument, next: CallbackWithoutResultAndOptionalError): void {
    this.updatedAt = new Date()
    next()
})

/**
 * Mongoose model for Movie collection.
 * 
 * Provides methods for querying, creating, updating, and deleting movie documents.
 * Includes optimized indexes for search and filtering operations.
 * 
 * **Available Operations:**
 * - `Movie.find()` - Query movies with filters
 * - `Movie.findOne()` - Find single movie
 * - `Movie.create()` - Create new movie
 * - `Movie.findByIdAndUpdate()` - Update movie
 * - `Movie.findByIdAndDelete()` - Delete movie
 * - Text search using `$text` operator
 * 
 * **Optimized Queries:**
 * - Full-text search on title and description
 * - Filtering by genre, year, rating
 * - Sorting by rating (highest first)
 * 
 * @constant
 * @type {MovieModel}
 * 
 * @example
 * // Create new movie
 * const movie = await Movie.create({
 *   title: 'Inception',
 *   description: 'A thief who steals corporate secrets...',
 *   shortDescription: 'A mind-bending thriller',
 *   poster: 'https://example.com/poster.jpg',
 *   genre: ['Sci-Fi', 'Thriller'],
 *   year: 2010,
 *   duration: 148,
 *   rating: 8.8,
 *   director: 'Christopher Nolan',
 *   cast: ['Leonardo DiCaprio', 'Ellen Page']
 * })
 * 
 * @example
 * // Search movies by text
 * const searchResults = await Movie.find({
 *   $text: { $search: 'space adventure' }
 * }).limit(10)
 * 
 * @example
 * // Get top-rated action movies
 * const topActionMovies = await Movie.find({ 
 *   genre: 'Action',
 *   isActive: true 
 * })
 *   .sort({ rating: -1 })
 *   .limit(10)
 */
const Movie = mongoose.model<IMovie, MovieModel>('Movie', movieSchema)

export default Movie
import mongoose, { Schema, Types, Model } from 'mongoose'

/**
 * Review document interface representing the structure of a movie review in the database.
 * 
 * Contains all review information including user reference, movie details, rating, and text content.
 * 
 * @interface IReview
 */
export interface IReview {
  /** Reference to the user who wrote the review */
  user: Types.ObjectId
  /** Movie ID as string (can be external ID) */
  movieId: string
  /** Optional reference to Movie document if movieId is a valid ObjectId */
  movie?: Types.ObjectId
  /** Optional movie title for display purposes */
  movieTitle?: string
  /** Rating from 1 to 5 stars */
  rating: number
  /** Review text content (max 1000 characters) */
  text: string
  /** Review creation timestamp */
  createdAt: Date
}

/**
 * Mongoose schema definition for Review collection.
 * 
 * Defines the structure, validation rules, and indexes for movie review documents.
 * Optimized for efficient querying by user and movie.
 * 
 * **Schema Features:**
 * - User and movie references with indexes for fast lookups
 * - Rating validation (1-5 stars)
 * - Text content validation (max 1000 characters)
 * - Automatic creation timestamp
 * 
 * **Schema Fields:**
 * - `user`: Reference to User document (required, indexed)
 * - `movieId`: Movie identifier as string (required, indexed)
 * - `movie`: Optional reference to Movie document (indexed)
 * - `movieTitle`: Optional movie title for display
 * - `rating`: Star rating 1-5 (required)
 * - `text`: Review content (required, max 1000 chars)
 * - `createdAt`: Creation timestamp (auto-generated)
 * 
 * @constant
 * @type {Schema<IReview>}
 */
const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: String, required: true, index: true },
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: false, index: true },
  movieTitle: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
})

/**
 * Mongoose model for Review collection.
 * 
 * Provides methods for querying, creating, updating, and deleting review documents.
 * Includes HMR (Hot Module Replacement) support for development environments.
 * 
 * **Available Operations:**
 * - `Review.find()` - Query reviews with filters
 * - `Review.findOne()` - Find single review
 * - `Review.create()` - Create new review
 * - `Review.findByIdAndUpdate()` - Update review
 * - `Review.findByIdAndDelete()` - Delete review
 * 
 * @constant
 * @type {Model<IReview>}
 */
// avoid model overwrite in dev with HMR, preserve typing
const Review: Model<IReview> = (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>('Review', reviewSchema)
export default Review

/**
 * Maintenance function to drop obsolete database indexes.
 * 
 * Removes the old unique index `movie_1_user_1` that previously restricted
 * users to one review per movie. This allows users to write multiple reviews
 * for the same movie if needed.
 * 
 * **Usage:**
 * Call this function during application startup or maintenance to clean up
 * old database indexes that are no longer needed.
 * 
 * @async
 * @function fixReviewIndexes
 * @returns {Promise<void>}
 * 
 * @example
 * // Call during app initialization
 * await fixReviewIndexes()
 */
// Maintenance: Drop obsolete unique index that restricted 1 review per user (movie_1_user_1)
// This index likely came from a previous schema and prevents multiple reviews when movie=null.
export async function fixReviewIndexes(): Promise<void> {
  try {
    const indexes = await Review.collection.indexes().catch(() => []) as any[]
    const names = Array.isArray(indexes) ? indexes.map((i: any) => i?.name).filter(Boolean) : []
    if (names.includes('movie_1_user_1')) {
      await Review.collection.dropIndex('movie_1_user_1').catch(() => {})
      console.log('[reviews] Dropped obsolete index movie_1_user_1')
    }
  } catch (e) {
    // non-fatal
    console.warn('[reviews] fixReviewIndexes failed:', (e as any)?.message || e)
  }
}

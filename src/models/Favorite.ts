import mongoose, { Schema, Types, Model } from 'mongoose'

/**
 * Favorite document interface representing the structure of a user's favorite movie in the database.
 * 
 * Contains the relationship between a user and a movie they have marked as favorite.
 * 
 * @interface IFavorite
 */
export interface IFavorite {
  /** Reference to the user who favorited the movie */
  user: Types.ObjectId
  /** Movie ID as string (can be external ID) */
  movieId: string
  /** When the movie was added to favorites */
  createdAt: Date
}

/**
 * Mongoose schema definition for Favorite collection.
 * 
 * Defines the structure, validation rules, and indexes for user favorite movie documents.
 * Includes a unique compound index to prevent duplicate favorites.
 * 
 * **Schema Features:**
 * - User reference with index for fast lookups
 * - Movie ID storage as string (supports external IDs)
 * - Unique compound index on user+movieId to prevent duplicates
 * - Automatic creation timestamp
 * 
 * **Schema Fields:**
 * - `user`: Reference to User document (required, indexed)
 * - `movieId`: Movie identifier as string (required, indexed)
 * - `createdAt`: When favorited (auto-generated)
 * 
 * **Indexes:**
 * - Single field index on `user` for user favorites queries
 * - Single field index on `movieId` for movie popularity queries
 * - Unique compound index on `user + movieId` to prevent duplicate favorites
 * 
 * @constant
 * @type {Schema<IFavorite>}
 */
const favoriteSchema = new Schema<IFavorite>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
})

/**
 * Unique compound index to prevent duplicate favorites.
 * 
 * Ensures that a user can only favorite the same movie once.
 * 
 * @index compound unique
 */
favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true })

/**
 * Mongoose model for Favorite collection.
 * 
 * Provides methods for querying, creating, updating, and deleting favorite documents.
 * Includes HMR (Hot Module Replacement) support for development environments.
 * 
 * **Available Operations:**
 * - `Favorite.find()` - Query favorites with filters
 * - `Favorite.findOne()` - Find single favorite
 * - `Favorite.create()` - Create new favorite
 * - `Favorite.findOneAndUpdate()` - Update favorite (with upsert)
 * - `Favorite.deleteOne()` - Remove favorite
 * 
 * @constant
 * @type {Model<IFavorite>}
 */
const Favorite: Model<IFavorite> = (mongoose.models.Favorite as Model<IFavorite>) || mongoose.model<IFavorite>('Favorite', favoriteSchema)
export default Favorite

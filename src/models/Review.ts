import mongoose, { Schema, Types, Model } from 'mongoose'

export interface IReview {
  user: Types.ObjectId
  movieId: string
  movie?: Types.ObjectId
  movieTitle?: string
  rating: number
  text: string
  createdAt: Date
}

const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: String, required: true, index: true },
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: false, index: true },
  movieTitle: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
})

// avoid model overwrite in dev with HMR, preserve typing
const Review: Model<IReview> = (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>('Review', reviewSchema)
export default Review

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

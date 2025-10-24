import mongoose, { Schema, Types, Model } from 'mongoose'

export interface IFavorite {
  user: Types.ObjectId
  movieId: string
  createdAt: Date
}

const favoriteSchema = new Schema<IFavorite>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
})

favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true })

const Favorite: Model<IFavorite> = (mongoose.models.Favorite as Model<IFavorite>) || mongoose.model<IFavorite>('Favorite', favoriteSchema)
export default Favorite

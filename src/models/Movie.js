import mongoose, { Schema } from "mongoose"

/**
 * Movie schema in MongoDB.
 * Contains movie information including poster, title, description, and other metadata.
 * 
 * @constant
 * @type {mongoose.Schema}
 */
const movieSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    poster: {
        type: String,
        required: true,
        trim: true
    },
    backdrop: {
        type: String,
        trim: true
    },
    genre: {
        type: [String],
        required: true,
        default: []
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 5
    },
    duration: {
        type: Number, // in minutes
        required: true,
        min: 1
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    director: {
        type: String,
        required: true,
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
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Index para búsquedas eficientes
movieSchema.index({ title: 'text', description: 'text' })
movieSchema.index({ genre: 1 })
movieSchema.index({ year: 1 })
movieSchema.index({ rating: -1 })

// Middleware para actualizar updatedAt
movieSchema.pre('save', function(next) {
    this.updatedAt = new Date()
    next()
})

/**
 * Movie model based on the `movieSchema`.
 * 
 * @constant
 * @type {mongoose.Model<mongoose.Document>}
 */
const Movie = mongoose.model('Movie', movieSchema)

export default Movie

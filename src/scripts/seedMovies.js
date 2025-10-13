import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Movie from '../models/Movie.js'

dotenv.config()

const sampleMovies = [
  {
    title: "El Padrino",
    description: "La saga de la familia Corleone, una poderosa dinastía criminal de Nueva York. Don Vito Corleone, el patriarca, debe decidir si entregar el negocio familiar a su hijo menor Michael, quien inicialmente no quería nada que ver con los negocios familiares.",
    shortDescription: "La épica saga de la familia Corleone y su imperio criminal en Nueva York.",
    poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    genre: ["Drama", "Crimen"],
    year: 1972,
    duration: 175,
    rating: 9.2,
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall"],
    trailer: "https://www.youtube.com/watch?v=sY1S34973zA"
  },
  {
    title: "El Señor de los Anillos: La Comunidad del Anillo",
    description: "Un hobbit llamado Frodo hereda un anillo mágico que podría salvar o destruir el mundo. Con la ayuda de un grupo de amigos, emprende un viaje épico para destruir el anillo en el Monte del Destino.",
    shortDescription: "Frodo emprende un viaje épico para destruir el Anillo Único y salvar la Tierra Media.",
    poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
    genre: ["Aventura", "Fantasía", "Acción"],
    year: 2001,
    duration: 178,
    rating: 8.8,
    director: "Peter Jackson",
    cast: ["Elijah Wood", "Ian McKellen", "Orlando Bloom", "Viggo Mortensen"],
    trailer: "https://www.youtube.com/watch?v=V75dMMIW2B4"
  },
  {
    title: "Pulp Fiction",
    description: "Historias entrelazadas de criminales, boxeadores y gángsters en Los Ángeles. La película presenta múltiples narrativas no lineales que se conectan de manera sorprendente.",
    shortDescription: "Historias entrelazadas de criminales en Los Ángeles con narrativa no lineal.",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
    genre: ["Crimen", "Drama"],
    year: 1994,
    duration: 154,
    rating: 8.9,
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
    trailer: "https://www.youtube.com/watch?v=s7EdQ4FqbhY"
  },
  {
    title: "Matrix",
    description: "Un programador de computadoras descubre que la realidad que conoce es una simulación creada por máquinas inteligentes que han esclavizado a la humanidad. Debe elegir entre la verdad dolorosa y la ignorancia feliz.",
    shortDescription: "Neo descubre que la realidad es una simulación y debe luchar contra las máquinas.",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7u3pxc0K1wx32IleAkLv78MKgrw.jpg",
    genre: ["Acción", "Ciencia ficción"],
    year: 1999,
    duration: 136,
    rating: 8.7,
    director: "Lana Wachowski, Lilly Wachowski",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
    trailer: "https://www.youtube.com/watch?v=m8e-FF8MsqU"
  },
  {
    title: "Titanic",
    description: "Una joven aristócrata se enamora de un artista pobre a bordo del RMS Titanic durante su viaje inaugural. Su romance se ve interrumpido cuando el barco choca con un iceberg.",
    shortDescription: "Una historia de amor épica a bordo del Titanic durante su viaje inaugural.",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yDI6D5ZQh67e4dZkOj3t3g3T4dU.jpg",
    genre: ["Romance", "Drama"],
    year: 1997,
    duration: 194,
    rating: 7.9,
    director: "James Cameron",
    cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane", "Kathy Bates"],
    trailer: "https://www.youtube.com/watch?v=2e-eXJ6HgkQ"
  },
  {
    title: "El Rey León",
    description: "Simba, un joven león, debe aprender a asumir su destino como rey después de que su padre es asesinado por su tío Scar. Con la ayuda de nuevos amigos, regresa para reclamar su reino.",
    shortDescription: "Simba debe aprender a ser rey después de la muerte de su padre.",
    poster: "https://image.tmdb.org/t/p/w500/1M876Kp7lVl6sVvBc8X7sKp3QzO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2bXbqYdUdNVa8VIWXVfclP2ICtT.jpg",
    genre: ["Animación", "Familia", "Drama"],
    year: 1994,
    duration: 88,
    rating: 8.5,
    director: "Roger Allers, Rob Minkoff",
    cast: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones", "Moira Kelly"],
    trailer: "https://www.youtube.com/watch?v=4sj1MT05lAA"
  },
  {
    title: "Avengers: Endgame",
    description: "Después de que Thanos destruye la mitad del universo, los Vengadores restantes deben reunirse para revertir el daño y restaurar el orden en el universo.",
    shortDescription: "Los Vengadores se reúnen para revertir el daño causado por Thanos.",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    genre: ["Acción", "Aventura", "Ciencia ficción"],
    year: 2019,
    duration: 181,
    rating: 8.4,
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c"
  },
  {
    title: "Parásitos",
    description: "Una familia pobre que vive en un sótano encuentra trabajo con una familia rica, pero sus planes se complican cuando intentan infiltrarse completamente en sus vidas.",
    shortDescription: "Una familia pobre se infiltra en la vida de una familia adinerada.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    genre: ["Drama", "Thriller"],
    year: 2019,
    duration: 132,
    rating: 8.6,
    director: "Bong Joon-ho",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    trailer: "https://www.youtube.com/watch?v=isOGD_7hNIY"
  },
  {
    title: "Dune",
    description: "Paul Atreides, un joven brillante y talentoso, debe viajar al planeta más peligroso del universo para asegurar el futuro de su familia y su pueblo.",
    shortDescription: "Paul Atreides debe viajar a un planeta peligroso para asegurar el futuro de su pueblo.",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/61X2LQ6P9gW5j3E1ZJ6KzF9Z2Y8.jpg",
    genre: ["Ciencia ficción", "Aventura"],
    year: 2021,
    duration: 155,
    rating: 8.0,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin"],
    trailer: "https://www.youtube.com/watch?v=n9xhJrPXop4"
  },
  {
    title: "Top Gun: Maverick",
    description: "Después de más de treinta años de servicio, Pete 'Maverick' Mitchell sigue siendo uno de los mejores pilotos de la Armada. Debe enfrentar su pasado mientras entrena a una nueva generación de pilotos.",
    shortDescription: "Maverick regresa para entrenar a una nueva generación de pilotos de élite.",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    genre: ["Acción", "Drama"],
    year: 2022,
    duration: 130,
    rating: 8.3,
    director: "Joseph Kosinski",
    cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm"],
    trailer: "https://www.youtube.com/watch?v=qSqVVswa420"
  }
]

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flimhub')
    console.log('✅ Conectado a MongoDB')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

const seedMovies = async () => {
  try {
    await connectDB()
    
    // Limpiar películas existentes
    await Movie.deleteMany({})
    console.log('🗑️  Películas existentes eliminadas')
    
    // Insertar películas de ejemplo
    const movies = await Movie.insertMany(sampleMovies)
    console.log(`✅ ${movies.length} películas insertadas exitosamente`)
    
    // Mostrar estadísticas
    const genres = await Movie.distinct('genre')
    console.log(`📊 Géneros disponibles: ${genres.join(', ')}`)
    
    const avgRating = await Movie.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])
    console.log(`⭐ Rating promedio: ${avgRating[0]?.avgRating?.toFixed(1) || 'N/A'}`)
    
  } catch (error) {
    console.error('❌ Error sembrando películas:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Desconectado de MongoDB')
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMovies()
}

export default seedMovies

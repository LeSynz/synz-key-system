module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/synz_keys',
}
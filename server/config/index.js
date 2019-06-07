module.exports = {
    development: {
        port: process.env.PORT || 3000,
        saltingRounds: 10
    },
    production: {
        port: process.env.PORT
    },
    UserRole: {
        NORMAL: 1,
        WRITER: 2,
        SUBSCRIBER: 3,
        EDITOR: 4,
        ADMIN: 5,
    },
    NotifyPriority: {
        NORMAL: 1,      // user vs user
        IMPORTANT: 2,   // from admin
        CRITICAL: 3     // from system
    }
}
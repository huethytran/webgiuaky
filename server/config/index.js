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
    UserRequest:{
        ISNOTREQUEST: 0,
        ISREQUEST: 1 
    },
    TypeOfPost:{
        NORMAL: 0,
        PREMIUM: 1
    },
    NotifyPriority: {
        NORMAL: 1,      // user vs user
        IMPORTANT: 2,   // from admin
        CRITICAL: 3     // from system
    },
    PostState: {
        DRAFT:      1, // temp save
        WAITING:    2, // waiting for approve
        APPROVE:    3, // approved, waiting for publish
        PUBLISH:    4, // 
        REJECT:     5, // reject by editor
    }
}
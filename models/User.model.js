const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    picture: {
        type: String,
        default: "default"
    },
    money:{
        type:Number,
        default: 0
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('users', userSchema);
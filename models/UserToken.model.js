
const mongoose = require('mongoose');

const UserTokenSchema = mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: 30 * 86400
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('userTokens', UserTokenSchema);
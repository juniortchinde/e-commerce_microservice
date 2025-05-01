const mongoose = require('mongoose');

const userBalanceShema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    balance:{
        type : Number,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('user_balances', userBalanceShema);
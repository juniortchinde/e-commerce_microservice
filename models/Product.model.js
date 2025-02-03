const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    images : {
        type: Array
    },
    title:{
        type: String,
        required: true,
        index: true
    },
    price:{
        type : Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true 
    },

    category: {
        type: String,
    },
    description:{
        type: String
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('products', productSchema);
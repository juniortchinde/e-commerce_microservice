const mongoose = require('mongoose')

const categorySchema  = mongoose.Schema({
    catName: {type: String, required: true},
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('categories', categorySchema);

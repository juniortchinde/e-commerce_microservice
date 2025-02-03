const Categories = require('../models/Category.model');

module.exports.addCategory = async (req, res) => {

    try {
        await Categories.create({
            catName: req.body.catName,
        })

        return res.status(201).json({error: false, message: "Category added successfully",});

    }
    catch (error) {
        console.log(error);
        return res.status(400).json({error: true, message: "Internal Server Error"});
    }
}

module.exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Categories.find().select("catName");
        return res.status(200).json({error : false,  categories})
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({error: true, message: "Internal Server Error"});
    }
}

module.exports.deleteCategory = async (req,res) => {
    try {
        await Categories.deleteOne({_id: req.params.categoryId})
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({error: true, message: "Internal Server Error"});
    }
}
const Product = require("../models/Product.model");
const fs = require("node:fs");

module.exports.addProduct = async (req, res) => {
    try{
        console.log(req.body);
        if(!req.auth.userId){
            return res.status(401).json({message: "non autorisé"})
        }

        if(!req.imageUrls[0]){
            return res.status(400).json({message : "images not found "})
        }
        const { title, description, price,  quantity, category} = req.body;
        const product = new Product({
            userId: req.auth.userId,
            title,
            description,
            price,
            quantity,
            category,
            images : req.imageUrls
        });
        await  product.save();
        return res.status(200).json({ error: false, message: "Product added successfully." });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: true, message: "Internal Server Error" });
    }
}

module.exports.updateProduct = async (req, res) => {
    try{

        const product = await Product.findOne({ _id: req.params.productId });
        if(product.userId !== req.auth.userId){
            return res.status(401).json({ error: true, message: "non autorisé"})
        }
        const images = [];
        for (const imageUrl of req.imageUrls) {
            if(!product.images.includes(imageUrl.hash)){
                images.push(imageUrl);
            }
        }
        await Product.updateOne({_id: req.params.productId}, {...req.body, images: images});
        res.status(200).json({error: false, message: "Product updated successfully." });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

module.exports.deleteProduct =  (req, res) => {
    Product.findOne({_id: req.params.productId})
        .then(product => {
            if (product.userId !== req.auth.userId){
                res.status(401).json({message: "non autorisé"})
            }
            else {
                const filenames = product.images.map((image) => image.split("/images")[1]);
                for (const filename of filenames){
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) { res.status(200).json({})
                            console.log(err);
                        }
                        else{
                            Product.deleteOne({_id: req.params.productId})
                                .then(() => res.status(200).json({error: false, message: "Product deleted successfully."}))
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({ error: true, message: "Internal Server Error" });
                                });
                        }
                    })
                }
            }
        })
}

module.exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {$sample: { size: 10}}
        ])
        return res.status(200).json({error:false, products})
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

module.exports.getProduct =  (req, res) => {
    Product.findById(req.params.productId)
        .then(product => {
            const images = product.images.map((image) => image.imageUrl);
            const result = {
                _id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                images: images,
            }
            res.status(200).json({error: false, product: result})
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: true, message: "Internal Server Error" });
        })
}

module.exports.getProductsForUser = async (req, res) => {
    try {
        const products = await Product.find({userId: req.auth.userId})
        return res.status(200).json({error:false, products})
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

module.exports.searchProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        const filter = {};
        console.log(req.query.search);
        if (category) {
            filter.category = category;
        }

        if (minPrice) {
            filter.price = {...filter.price, $gte: Number(minPrice)};
        }

        if (maxPrice) {
            filter.price = {...filter.price, $lte: Number(maxPrice)};
        }

        if (search) {
            filter.$or = [
                {title: {$regex: search, $options: "i"},},
                {description: {$regex: search, $options: "i"}}
            ]
            console.log(search);
        }

        const products = await Product.find(filter).select("_id title price description images")

        return res.status(200).json({error: false, products})


    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

module.exports.productsForCategory = async (req, res) => {

    try {

        const products = await Product.find({category: req.params.category});
        return res.status(200).json({error: false, products})
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}
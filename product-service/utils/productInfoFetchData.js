const Products = require("../models/Product.model");

const productInfo = async (orderProductList) =>{
    try {
        const productList = []
        let i = 0;
        // pour arreter la boucle en cas d'erreur
        let error = false
        // pour capturer le message d'erreur si une erreur se produit
        let errorMsg = "";

        while(i < orderProductList.length && !error ){
            // on récupere le product correspond à l'id courant
            // à condition que celui ci existe est un stock supérieur ou égal à la quantité commandée
            const _id = orderProductList[i]._id;
            const quantity = Number(orderProductList[i].quantity);
            console.log({ _id, quantity})

            const product = await Products.findOne({
                _id,
                quantity: { $gte: quantity }
            });
            console.log(product)

            //si oui
            if(product){

                //on récupère les infos du produit
                productList.push({
                    _id: product._id,
                    title: product.title,
                    quantity: orderProductList[i].quantity,
                    price: product.price,
                    category: product.category,
                    images: product.images,
                    userId: product.userId,
                });
            }
            // si non
            else {
                error = true;
                errorMsg = `Le product ${orderProductList[i]._id} n'est plus disponible`;
            }
            i++
        }
        //S'il y'a eu une erreur on retourne le message d'erreur
        if (error){
            return errorMsg;
        }
        // sinon on retourne le tableau des produits
        else {
            return productList;
        }
    }
    catch(err){
        console.error(err);
    }
}

async  function updateProductForOrder(productList){
    try{
        for(let i = 0; i < productList.length; i++){
            const product = productList[i];
            const _id = product._id;
            const productToUpdate = await Products.findOne({_id});
            console.log(productToUpdate);
            const newQuantity = productToUpdate.quantity - product.quantity;
            await Products.updateOne({_id}, {quantity: newQuantity});
        }
    }
    catch(err){
        console.error(err);
    }
}


module.exports = {productInfo,  updateProductForOrder};
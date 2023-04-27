import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';


//@desc Show all of the listed products
//@route GET /shop/product
//@access PUBLIC
const allListedProducts = asyncHandler( async(req,res,next) => {

    try{
        // define an empty array
        let arrayProdct = [];

        // loop through the Product document for each listed products
        (await Product.find()).forEach( (doc) => {
            
            // push each of them inside the array
            arrayProdct.push(doc)
        })

        // send back the array of objects
        res.send(arrayProdct);

    } catch(err){
        next(err);
    }
});

//@desc Show a selected product
//@route GET /shop/:id
//@access PUBLIC
const selectedProduct = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the product id from the request
        const prodct_id = req.params.id

        // find the product
        const product = await Product.findOne({ _id: prodct_id })

        if(!product){
            res.status(404);
            throw new Error("Product not found")
        }else{
            
            res.status(200).json(product)
        }

    } catch(err){
        next(err)
    }
});

export { allListedProducts, selectedProduct }
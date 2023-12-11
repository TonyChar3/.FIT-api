import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

/**
 * Routes made for a possible admin panel...
 */

//@desc List a new product
//@route POST /admin/addProdct
//@acess PRIVATE + admin rights
const addNewProdct = asyncHandler( async(req,res,next) => {

    try{
        // deconstruct the product info from the request.body
        const { prodct_name, prodct_descrip, prodct_price, prodct_stock, prodct_stripe } = req.body

        // check if the product isn't already listed in the Db
        const isListed = await Product.findOne({ name: prodct_name });

        // if another product is already listed
        if(isListed){
            // 403 - Forbidden
            res.status(403);
            // Show a new error in the console for the user
            throw new Error("This product is already listed")
        }

        // Create the new product object and save it in the Db
        const product = await Product.create({
            name: prodct_name,
            description: prodct_descrip,
            stripe_ID: prodct_stripe,
            prix: prodct_price,
            stock: prodct_stock,
        })

        // if the product is created and saved
        if(product){
            // send back a success message
            res.status(201).json({ message: "New product listed" });
        } else {
            // 500 - Internal Server Error
            res.status(500);
            // Show a new error in the console for the user to see
            throw new Error("Unable to list this new product, please try again")
        }
    } catch(err){
        next(err)
    }
});

//@desc Remove a selected product
//@route DELETE /admin/removProdct
//@access PRIVATE + admin rights
const removeProdct = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the selected product id from the request.body
        const { prodct_id } = req.body

        // make sure the product is really listed inside the DB
        const isListed = await Product.findOne({ _id: prodct_id });

        // If the product is not listed
        if(!isListed){
            res.status(401);
            throw new Error("Unable to remove this product as it is not a listed product")
        }

        // delete the listed product
        const deleteProduct = await Product.deleteOne(isListed);

        // verify if the operation was successful
        if(deleteProduct){
            res.status(204).json({ message: "Listed product deleted"})
        } else {
            res.status(500);
            throw new Error("Unable to delete the given product, please try again")
        }

    } catch(err){
        next(err);
    }
})

//@desc Add Images to the listed products
//@route POST /admin/addProdctImg
//@acess PRIVATE + admin rights
const addNewImg = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the image link from the request.body
        const { img_link, prodct_id } = req.body
        // find the product with the id of the product
        const findProdct = await Product.findOne({ _id: prodct_id });
        
        // make sure it is found
        if(!findProdct){
            res.status(404);
            throw new Error("The requested product does not exist")
        }

        // look into the image array to see if the image isn't already added
        const isAdded = findProdct.images.findIndex(img => img.img_url.toString() === img_link.toString());
        // if the image is already added, throw a new error
        if(isAdded !== -1){
            res.status(401);
            throw new Error("This image was already added for this specific product")
        } else {
            // flage to check if the random id number is valid or not
            const img_flag = false;
            // variable for the id
            let random_id;

            // else generate a random id number
            do {
                // Generate a random id
                random_id = Math.floor(Math.random() * 10000)
                // make sure it is unique
                const idDuplicate = findProdct.images.findIndex(img => img._id.toString() === random_id.toString());

                // if it is not unique...
                if(idDuplicate !== -1){
                    // set the flag to true to loop on more time
                    img_flag = true;
                // if it is unique...
                } else if(idDuplicate === -1){
                    break;
                }
            } while(img_flag === true)

            // create a new image link object
            const newImg = {
                _id: random_id,
                img_url: img_link
            }
            // add it to the array
            const addNewImg = await findProdct.updateOne({
                $push: {
                    images: newImg
                }
            })
            // generate a success or failure message
            if(addNewImg){
                res.status(201).json({ message: `New image added for ${findProdct.name}`})
            } else {
                res.status(500);
                throw new Error("Unable to add new Image for the product, please try again")
            }
        }
    } catch(err){
        next(err)
    }
});

export { addNewProdct, addNewImg, removeProdct };
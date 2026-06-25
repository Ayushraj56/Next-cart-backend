import mongoose from "mongoose";
import Product from "./models/product.js";

mongoose
    .connect("mongodb://127.0.0.1:27017/ecommerce")
    .then(async () => {
        await Product.updateMany(
            {},
            {
                $set: {
                    images: ["1781775340736-refrigerator.jpeg"],
                },
            }
        );

        console.log("All products updated!");
        process.exit();
    })
    .catch((err) => {
        console.log(err);
    });
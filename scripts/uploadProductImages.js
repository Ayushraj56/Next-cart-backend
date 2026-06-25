import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import axios from "axios";
import fs from "fs";
import path from "path";
import ImageKit from "imagekit";

import Product from "../models/product.js";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Connect MongoDB
await mongoose.connect(process.env.MONGO_URI);

console.log("✅ MongoDB Connected");

// Search image from Google Images via SerpAPI
async function searchImage(productName) {
    try {
        const response = await axios.get(
            "https://serpapi.com/search.json",
            {
                params: {
                    engine: "google_images",
                    q: productName,
                    api_key: process.env.SERPAPI_KEY,
                },
            }
        );

        const imageUrl =
            response.data?.images_results?.[0]?.original;

        return imageUrl;
    } catch (error) {
        console.log(`❌ Search failed for ${productName}`);
        return null;
    }
}

// Download image locally
async function downloadImage(url, filePath) {
    const response = await axios({
        url,
        method: "GET",
        responseType: "arraybuffer",
    });

    fs.writeFileSync(filePath, response.data);
}

// Upload to ImageKit
async function uploadToImageKit(filePath, fileName) {
    const result = await imagekit.upload({
        file: fs.readFileSync(filePath),
        fileName,
        folder: "/products",
    });

    return result.url;
}

// MAIN
async function uploadImages() {
    try {
        // Test with first 5 products
        // const products = await Product.find().limit(5);

        // All products
        const products = await Product.find();

        console.log(`Found ${products.length} products`);

        for (const product of products) {
            try {
                console.log(`\n🔍 Searching image for: ${product.name}`);

                const imageUrl = await searchImage(product.name);

                if (!imageUrl) {
                    console.log(`⚠️ No image found for ${product.name}`);
                    continue;
                }

                const localPath = path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    `${product._id}.jpg`
                );

                await downloadImage(imageUrl, localPath);

                console.log("⬇️ Image downloaded");

                const imagekitUrl = await uploadToImageKit(
                    localPath,
                    `${product.name}.jpg`
                );

                console.log("☁️ Uploaded to ImageKit");

                await Product.findByIdAndUpdate(product._id, {
                    images: [imagekitUrl],
                });

                console.log(`✅ Updated ${product.name}`);

                if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath);
                }
            } catch (error) {
                console.log(
                    `❌ Failed for ${product.name}:`,
                    error.message
                );
            }
        }

        console.log("\n🎉 All products processed");

        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

uploadImages();
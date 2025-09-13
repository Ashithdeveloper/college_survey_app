import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";  // <-- add this
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadImageToImageKit = async (filePath) => {
  const file = fs.readFileSync(filePath);

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.toString("base64"),
        fileName: `${uuidv4()}${filePath.slice(filePath.lastIndexOf("."))}`,
      },
      function (error, result) {
        if (error) return reject(error);
        resolve(result.url);
      }
    );
  });
};

import Fastify from "fastify";
import axios from "axios";

const app = Fastify({ logger: true });

// Use environment variables to store sensitive information
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Define the route handler for /get-images
app.get("/get-images", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`,
      {
        auth: {
          username: CLOUDINARY_API_KEY,
          password: CLOUDINARY_API_SECRET,
        },
      }
    );
    return res.send(response.data.resources);
  } catch (error) {
    app.log.error(error);
    return res.status(500).send("Error fetching images from Cloudinary");
  }
});

// Export the serverless function handler
export default async function handler(req, res) {
  try {
    // Fastify's ready() method waits for the server to be ready to handle requests
    await app.ready();
    // Emit the request event to the Fastify server
    app.server.emit("request", req, res);
  } catch (error) {
    // Log and return any errors
    console.error("Error handling request:", error);
    res.status(500).send("Internal Server Error");
  }
}

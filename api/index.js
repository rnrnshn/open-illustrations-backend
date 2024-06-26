import Fastify from "fastify";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize the Fastify instance
const app = Fastify({ logger: true });

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enable CORS for all routes
app.addHook("onRequest", (req, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  reply.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  done();
});

// Define a root route for testing
app.get("/", async (req, res) => {
  return res.send({ message: "Welcome to the Fastify server!" });
});

// Define the route handler for /get-images with tags using Cloudinary SDK
app.get("/get-images", async (req, res) => {
  const tags = req.query.tags;

  if (!tags) {
    return res.status(400).send("Tags parameter is required");
  }

  try {
    app.log.info("Fetching images from Cloudinary by tags:", tags);
    let allResources = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.v2.api.resources_by_tag(tags, {
        max_results: 50,
        next_cursor: nextCursor,
      });
      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    app.log.info("Total images fetched:", allResources.length);
    return res.send(allResources);
  } catch (error) {
    app.log.error("Error fetching images from Cloudinary:", error.message);
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

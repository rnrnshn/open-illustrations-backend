const fastify = require("fastify")({ logger: true });
const axios = require("axios");

// Use environment variables to store sensitive information
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

fastify.get("/get-images", async (request, reply) => {
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
    return response.data.resources;
  } catch (error) {
    throw fastify.httpErrors.internalServerError(
      "Error fetching images from Cloudinary"
    );
  }
});

// Run the server
fastify.listen(3000, "0.0.0.0", (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});

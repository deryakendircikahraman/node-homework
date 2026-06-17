const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Homework API",
      version: "1.0.0",
      description: "Final project API documentation",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "jwt" },
        csrfToken: { type: "apiKey", in: "header", name: "X-CSRF-TOKEN" },
      },
    },
    security: [{ cookieAuth: [], csrfToken: [] }],
  },
  apis: ["./docs/swagger-paths.js"],
};

module.exports = swaggerJsdoc(options);

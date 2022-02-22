const controller = require("../../controllers/public/queries")
const Endpoint = require("./utils/Endpoint")

const read = [],
  write = []

/**
 * @openapi
 * /queries/search:
 *   post:
 *     summary: Search for a query based on its name.
 *     tags:
 *       - queries
 *     parameters:
 *       - $ref: '#/components/parameters/appId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/nameSearch'
 *     responses:
 *       200:
 *         description: Returns the queries found based on the search parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 queries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/query'
 *             examples:
 *               queries:
 *                 $ref: '#/components/examples/queries'
 */
read.push(new Endpoint("post", "/queries/search", controller.search))

/**
 * @openapi
 * /queries/{queryId}:
 *   post:
 *     summary: Execute a query and retrieve its response.
 *     tags:
 *       - queries
 *     parameters:
 *       - $ref: '#/components/parameters/queryId'
 *       - $ref: '#/components/parameters/appId'
 *     responses:
 *       200:
 *         description: Returns the result of the query execution.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *             examples:
 *               query:
 *                 $ref: '#/components/examples/query'
 */
write.push(new Endpoint("post", "/queries/:queryId", controller.execute))

module.exports = { read, write }
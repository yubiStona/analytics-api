const express = require("express");
const app = express();
const router = require("./routes/routes");
const cookieParser  = require("cookie-parser")
const cors = require('cors');
const path = require('path');
const enrollmentRouter = require("./routes/enrollmentRoutes")
const carrierBasedEnrollmentRouter = require("./routes/carrrierBasedEnrollmentRoutes");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const {typeDefs, resolvers} = require("./controllers/graphQlReport.controller.js");
const { tryGetConnection, pool, pool2 } = require("./config/db.js");
require("dotenv").config();

app.use(express.static('public'));
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb', extended: true }));
app.get("/", (req, res) => {
  res.send("Welcome to the Analytics API");
});

app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));
// app.get('/members', async(req, res) => {
//     const [query] = await pool.query('SELECT id FROM sso_users');
//     const [query2] = await pool2.query(`SELECT userid FROM userinfo`);
//     const result = query2.filter(item => !query.includes(item.userid));
//     console.log(result.length);

//     res.json(result);
// });
const server = new ApolloServer({ typeDefs, resolvers });

(async () => {
  await server.start();
  await tryGetConnection(pool, "pool")
  await tryGetConnection(pool2, "pool2")

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server)
);

app.use("/api", router);
app.use("/api/enrollments", enrollmentRouter );
app.use("/api/carrier", carrierBasedEnrollmentRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
})();

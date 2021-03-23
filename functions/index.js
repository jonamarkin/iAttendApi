const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
app.use(cors({ origin: true }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const authRoutes = require("./api/auth");
const attendanceRoutes = require("./api/attendance");
const eventsRoutes = require("./api/events");
const membersRoutes = require("./api/members");
const noticesRoutes = require("./api/notices");
const requestsRoutes = require("./api/requests");
const teamsRoutes = require("./api/teams");
const userRoutes = require("./api/user");

app.use("/auth", authRoutes);
app.use("/attend", attendanceRoutes);
app.use("/events", eventsRoutes);
app.use("/members", membersRoutes);
app.use("/notices", noticesRoutes);
app.use("/requests", requestsRoutes);
app.use("/teams", teamsRoutes);
app.use("/user", userRoutes);

app.get("/hello-world", (req, res) => {
    return res.status(200).send("Hello World!");
});

exports.app = functions.https.onRequest(app);
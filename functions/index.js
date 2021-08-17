const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

// Fetch the service account key JSON file contents
var serviceAccount = require("./iattendservice.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://iattend-e19c5-default-rtdb.firebaseio.com",
});

app.use(cors({ origin: true }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const authRoutes = require("./api/auth");

app.use("/auth", authRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message,
    });
});

//module.exports = app;
exports.app = functions.https.onRequest(app);
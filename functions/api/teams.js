const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const db = admin.firestore();

//Create a new team
router.post("/create", async(req, res, next) => {
    var data = req.body;
    var name = data.email;
    var description = data.description;
    var groupId = data.groupId;
    var createdBy = data.uid;

    var teamId = uuidv1();

    db.collection("teams")
        .doc(teamId)
        .set({
            name: name,
            teamId: teamId,
            description: description,
            groupId: groupId,
            createdBy: createdBy,
        })
        .then((response) => {
            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Team created successfully!",
                responseData: response,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Team creation failed!",
                responseData: error,
            });
        });
});

//Get all Teams
router.get("/getAll", async(req, res, next) => {
    db.collection("teams")
        .get()
        .then((querySnapshot) => {
            var teams = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots

                console.log(doc.id, " => ", doc.data());

                var teamObject = doc.data();
                teamObject.id = doc.id;

                teams.push(teamObject);
            });
            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Successfully retrieved teams!",
                responseData: teams,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Failed to get teams!",
                responseData: error,
            });
        });
});

router.get("/getMembers/:teamId", async(req, res, next) => {
    var teamId = req.params.teamId;
    db.collection("users")
        .where("teams", "array-contains", teamId)
        .get()
        .then((querySnapshot) => {
            var teamMembers = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots

                console.log(doc.id, " => ", doc.data());

                var teamMember = doc.data();
                teamMember.id = doc.id;

                teamMembers.push(teamMember);
            });
            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Successfully retrieved team members!",
                responseData: teamMembers,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Failed to get team members!",
                responseData: error,
            });
        });
});
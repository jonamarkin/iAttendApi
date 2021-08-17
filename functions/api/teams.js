const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
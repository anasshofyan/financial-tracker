const express = require("express");
const router = express.Router();
const useController = require("../controllers/userController");

router.post("/", useController.createUser);
router.get("/getAllUser", useController.getUsers);

module.exports = router;

const express = require("express");
const router = express.Router();
const useController = require("../controllers/userController");

router.post("/", useController.register);
router.get("/", useController.getListUser);

module.exports = router;

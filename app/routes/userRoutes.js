const express = require("express");
const router = express.Router();
const useController = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/login", useController.login);
router.post("/", useController.register);
router.get("/", verifyToken, useController.getList);
router.put("/:id", verifyToken, useController.update);
router.delete("/:id", verifyToken, useController.deleteUser);

module.exports = router;

const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const adminController = require("../controllers/admin.controller");


router.get("/users", verifyToken, adminController.getUsers);
router.delete("/users/:id", verifyToken, adminController.deleteUser);
router.get("/challenges", verifyToken, adminController.getChallenges);
router.delete("/challenges/:id", verifyToken, adminController.deleteChallenge);
router.get("/reports", verifyToken, adminController.getReports);


module.exports = router;
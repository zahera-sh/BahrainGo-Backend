const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const challengeController = require("../controllers/challenge.controller");


router.post("/", verifyToken, challengeController.createChallenge);
router.get("/", challengeController.getPublicChallenges);
router.get("/my-challenges", verifyToken, challengeController.getMyChallenges);
router.delete("/:id", verifyToken, challengeController.deleteChallanenge);


module.exports = router;
const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const participantController = require("../controllers/participant.controller");
 

router.get("/my-participants", verifyToken, participantController.getMyParticipants);
router.get("/:id", verifyToken, participantController.getParticipants);


module.exports = router;
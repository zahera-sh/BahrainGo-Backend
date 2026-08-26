const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const inviteController = require("../controllers/invite.controller")


router.post("/", verifyToken, inviteController.createInvite);
router.get("/", verifyToken, inviteController.getMyInvites);
router.put("/:id/accept", verifyToken, inviteController.acceptInvite);
router.put("/:id/reject", verifyToken, inviteController.rejectInvite);
router.put("/:id/drop", verifyToken, inviteController.dropChallenge);


module.exports = router;
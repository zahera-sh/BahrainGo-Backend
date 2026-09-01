const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const reportController = require("../controllers/report.controller");


router.post("/", verifyToken, reportController.createReport);
router.get("/", verifyToken, reportController.getReports);
router.put("/:id/solve", verifyToken, reportController.solveReport);


module.exports = router
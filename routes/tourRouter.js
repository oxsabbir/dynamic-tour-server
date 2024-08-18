const express = require("express");
const tourController = require("../controllers/tourController");
const router = express.Router();

router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTour);
router.post("/:id", tourController.deleteTour);
router.post("/", tourController.addTour);

export default router;

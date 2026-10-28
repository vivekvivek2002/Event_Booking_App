const express= require("express");
const router= express.Router();
const {protect,admin}=require("../middleware/auth");
const upload = require("../middleware/upload");

const {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent}=require("../controllers/eventController");

// get all events
router.get("/",getAllEvents);

// get event by id
router.get("/:id",getEventById);    

// create event(admin only)
router.post("/",protect,admin,upload.single("image"),createEvent);

// update event(admin only)
router.put("/:id",protect,admin,upload.single("image"),updateEvent);

// delete event(admin only)
router.delete("/:id",protect,admin,deleteEvent);

module.exports=router;
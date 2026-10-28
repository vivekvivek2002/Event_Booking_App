const Event=require("../models/Event");

exports.getAllEvents = async (req, res) => {
    try {
        const filters={};
        if(req.query.category){
            filters.category=req.query.category;
        }
        if(req.query.price === "free"){
            filters.ticketPrice = 0;
        } else if(req.query.price === "paid"){
            filters.ticketPrice = { $gt: 0 };
        } else if(req.query.ticketPrice !== undefined && req.query.ticketPrice !== ""){
            filters.ticketPrice=Number(req.query.ticketPrice);
        }

        const search = req.query.search?.trim();
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filters.$or = ["title", "description", "location", "category"].map((field) => ({
                [field]: { $regex: escapedSearch, $options: "i" }
            }));
        }

        const events = await Event.find(filters);
        res.json(events);
    }catch(error){
        res.status(500).json({error:error.message});
    }   
  }  ;

  exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(!event){
            return res.status(404).json({error:"Event not found"});
        }
        res.json(event);
    }catch(error){
        res.status(500).json({error:error.message});
    }
  };

  exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice } = req.body;
    const availableSeats = Number(req.body.availableSeats ?? totalSeats);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl ?? req.body.image ?? '');
    try {
        const event = await Event.create({  
            title,
            description,
            date,
            location,
            category,
            totalSeats, 
            availableSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id,
        });
        res.status(201).json(event);
    }catch(error){
        res.status(400).json({error:error.message});
    }
};

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice } = req.body;
    try {
        const existingEvent = await Event.findById(req.params.id);
        if(!existingEvent){
            return res.status(404).json({error:"Event not found"});
        }

        const event = await Event.findByIdAndUpdate(req.params.id, {  
            title,
            description,
            date,
            location,
            category,   
            totalSeats,
            availableSeats: Number(req.body.availableSeats ?? existingEvent.availableSeats),
            ticketPrice,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl ?? req.body.image ?? existingEvent.imageUrl),
        }, { new: true });
        res.json(event);
    }catch(error){
        res.status(500).json({error:error.message});
    }   
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if(!event){
            return res.status(404).json({error:"Event not found"});
        }
        res.json({message:"Event deleted successfully"});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

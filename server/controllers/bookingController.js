const Booking=require("../models/Bookings");
const OTP=require("../models/OTP");
const Event=require("../models/Event");
const {sendOTPEmail,SendBookingEmail}=require("../utils/email");

const generateOtp=()=>{
    return Math.floor(100000+Math.random()*900000).toString();
}

exports.sendBookingOTP=async(req,res)=>{        
    const opt=generateOtp();
    await OTP.findOneAndDelete({email:req.user.email,action:"event_booking"});
    await OTP.create({email:req.user.email,otp:opt,action:"event_booking"});
    await sendOTPEmail(req.user.email,opt,"event_booking");
    res.json({message:"OTP sent to email"});

}

exports.bookEvent=async(req,res)=>{
    const { eventId, otp } = req.body;
    const normalizedOtp = String(otp || '').trim();

    if (!eventId || !normalizedOtp) {
        return res.status(400).json({ error: 'Event ID and OTP are required' });
    }

    const otpRecord=await OTP.findOne({email:req.user.email, otp: normalizedOtp, action:"event_booking"});
    if(!otpRecord){
        return res.status(400).json({error:"Invalid or expired OTP"});
    }
    const event=await Event.findById(eventId);
    if(!event){
        return res.status(404).json({error:"Event not found"})
    }
    if(event.availableSeats <= 0){
        return res.status(400).json({error:"No seats available"});
    }
    const existingBooking=await Booking.findOne({userId:req.user._id,eventId})
    if(existingBooking){
        return res.status(400).json({
            error:'you have already booked this event'
        })
    }
    await Booking.create({
        userId:req.user._id,
        eventId,
        status:"pending",
        paymentStatus:"non_paid",
        amount:event.ticketPrice
    });

    await OTP.deleteMany({email:req.user.email,action:"event_booking"});

    res.status(201).json({message:"Booking created successfully"})
    
}

exports.confirmBooking=async(req,res)=> {
    const paymentStatus = req.body.paymentStatus;
    if(paymentStatus && !["paid","non_paid"].includes(paymentStatus)){
        return res.status(400).json({error:"Invalid payment status"});

    }
    const booking=await Booking.findById(req.params.id).populate("eventId userId");
    if(!booking){
        return res.status(404).json({error:"Booking not found"})
    }

    if(booking.status==="confirmed"){
        return res.status(400).json({
            error:"Booking is already confirmed"});
    }
    const event=await Event.findById(booking.eventId._id);
    if(event.availableSeats <=0){
        return res.status(400).json({error:"No seats available"});
    }

    booking.status="confirmed";

    if(paymentStatus){
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.availableSeats -=1;
    await event.save();

    // admin  confirm booking send email to user
    await SendBookingEmail(booking.userId.email, booking.userId.name, event.title);
    
    res.json({message:"Booking confirmed"})
}

exports.getMyBookings = async(req,res) =>{
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const bookings = await Booking.find(query).populate("eventId userId").sort({ createdAt: -1 });
    res.json(bookings);
}

exports.cancelBooking=async(req,res) =>{
    const booking=await Booking.findById(req.params.id).populate("eventId");
    if(!booking){
        return res.status(404).json({error:"Booking not found"});
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if(!isOwner && !isAdmin){
        return res.status(403).json({error:"Unauthorized"});
    }

    const wasConfirmed = booking.status === "confirmed";
    booking.status="cancelled";
    await booking.save();

    if(wasConfirmed){
        const event=await Event.findById(booking.eventId._id);
        event.availableSeats += 1;
        await event.save();
    }
    await booking.deleteOne();
    res.json({message:"Booking cancelled"})
}




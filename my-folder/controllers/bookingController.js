const Stripe = require('stripe');
const Tour = require('./../model/tourModel');
const Booking = require('./../model/bookingsModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsyn = require('./../utils/catchAsyn');
const factory = require('./handlerFactory');


console.log("Inside booking controller");

exports.getCheckoutSession = catchAsyn(async(req,res,next) =>{

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

    const tour = await Tour.findById(req.params.tourId);


    const session = await stripe.checkout.sessions.create({
    payment_method_types : ['card'],
    success_url : `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url : `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email : req.user.email,
    client_reference_id : req.params.tourId,
    line_items : [
        {
            name:`${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/image/tours/${tour.imageCover}`],
            amount: tour.price*74,
            currency:'inr',
            quantity:1


        }
    ]
});

res.status(200).json({
    status: 'success',
    session
})
next()
});

//Function to create new booking in DB

exports.createBookingCheckout = catchAsyn(async(req,res,next)=>{
    const { tour, user, price } = req.query;
    if(!tour && !user && !price) return next();

    await Booking.create({tour, user, price});
    res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBooking = factory.getAllModel(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.createOneBooking = factory.createOne(Booking);
exports.updateOneBooking = factory.updateOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
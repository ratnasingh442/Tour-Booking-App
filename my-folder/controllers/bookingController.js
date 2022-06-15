const Stripe = require('stripe');
const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsyn = require('./../utils/catchAsyn');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsyn( async(req,res,next) =>{

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

    const tour = await Tour.findById(req.params.tourId);


    const session = await stripe.checkout.sessions.create({
    payment_method_types : ['card'],
    success_url : `${req.protocol}://${req.get('host')}/`,
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
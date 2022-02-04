const mongose = require('mongoose');
const validator = require('validator');
//const User = require('./userModel');

const tourSchema = new mongose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour name must have atleast 10 characters'],
      maxlength: [30, 'A tour name must have atmost 30 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty should be either: easy, medium or difficult'
      }
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max group size']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be above or equal to 1'],
      max: [5, 'Rating should be below or equal to 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'The discount {{VALUE}} must be less than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    location: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    },
    guides: [
      {
        type: mongose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
//Embedding
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChanged'
  });
  next();
});
tourSchema.virtual('reviews',{
  ref: 'Review',
  foreignField:'tour',
  localField:'_id'
});
// tourSchema.index({price:1}); delete from mongoose as well seperately
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({startLocation:'2dsphere'});
const Tour = mongose.model('Tour', tourSchema);
module.exports = Tour;

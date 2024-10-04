const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tour must have a title"],
    },
    description: {
      type: String,
      required: [true, "Tour must have a description"],
    },
    summery: {
      type: String,
    },
    totalParticipant: {
      type: Number,
      required: [true, "Tour must have participant details"],
    },

    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    discountPrice: Number,

    coverImage: String,

    images: [String],

    totalRating: Number,

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },

    guides: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],

    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        dayNumber: Number,
        images: [String],
      },
    ],

    duration: Number,

    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
      images: [String],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    updatedAt: {
      type: Date,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ title: "text", description: "text" });

// setting the virtual populate to show the review on the tour data
// even it's located inside a different resouces
tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
});

// using document middleware to do some operation

const tourModel = mongoose.model("Tour", tourSchema);

module.exports = tourModel;

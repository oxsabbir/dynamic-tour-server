const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Tour must have a title"],
    },
    description: {
      type: String,
      require: [true, "Tour must have a description"],
    },
    summery: {
      type: String,
    },
    totalParticipant: {
      type: Number,
      require: [true, "Tour must have participant details"],
    },

    price: {
      type: Number,
      require: [true, "Tour must have a price"],
    },
    discountPrice: Number,

    coverImage: String,

    images: [String],

    totalRating: Number,
    ratingsAverage: Number,

    guides: [
      {
        type: mongoose.Schema.ObjectId,
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

const tourModel = mongoose.model("Tour", tourSchema);

module.exports = tourModel;

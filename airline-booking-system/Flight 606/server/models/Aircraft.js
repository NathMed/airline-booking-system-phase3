===== Aircraft.js =====
const mongoose = require("mongoose");

const aircraftSchema = new mongoose.Schema({
	airlineId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Airline",
		required: true
	},

	model: {
		type: String,
		required: [true, "Input aircraft model"],
		trim: true
	},

	totalSeats: {
		type: Number,
		required: [true, "Input total seat number"],
		min: [150, "Aircraft must have at least 150 seats"],
		max: [300, "Aircraft must have at most 300 seats"]
	},

	isActive: {
		type: Boolean,
		default: true
	}
	
}, { timestamps: true });



module.exports = mongoose.model("Aircraft", aircraftSchema);
===== Airline.js =====
const mongoose = require("mongoose");

const airlineSchema = new mongoose.Schema({
	name:{
		type: String,
		required: [true, "Airline name is required"],
		unique: true,
		trim: true
	},
	
	iataCode:{
		type: String,
		required: [true, "2-letter IATA code is required"],
		unique: true,
		uppercase: true,
		minlength: 2,
		maxlength: 2
	},

	logoURL:{
		type: String,
		required: true,
	},
	
	isActive: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });

module.exports = mongoose.model("Airline", airlineSchema);
===== Airport.js =====
const mongoose = require("mongoose");

const airportSchema = new mongoose.Schema({
	name:{
		type: String,
		required: [true, "Airport name is required"],
		unique: true,
		trim: true
	},

	iataCode:{
		type: String,
		required: [true, "3-letter IATA code is required"],
		unique: true,
		uppercase: true,
		minlength: 3,
		maxlength: 3
	},
	
	city:{
		type: String,
		required: [true, "City is required"],
		trim: true
	},
	
	country:{
		type: String,
		required: [true, "Country is required"],
		trim: true
	},

	isActive:{
		type: Boolean,
		default: true
	}
	
}, { timestamps: true });


module.exports = mongoose.model("Airport", airportSchema);
===== Booking.js =====
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		default: null
	}, 

	guestEmail: {
		type: String,
		default: null,		
		lowercase: true
	},

	flightId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Flight",
		required: [true, "Flight ID is required"]
	},

	bookingReference: {
		type: String,
		required: [true, "Booking Reference is Required"],
		unique: true
	},

	status: {
		type: String,
		enum: ["pending", "confirmed", "cancelled"],
		default: "pending",
	},

	totalAmount: {
		type: Number,
		min: [0, "Number must not be negative"],
		required: true
	},

	isActive: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });


module.exports = mongoose.model("Booking", bookingSchema);
===== BookingPassenger.js =====
const mongoose = require("mongoose");

const bookingPassengerSchema = new mongoose.Schema({
	bookingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Booking",
		required: [true, "Booking ID is required"]
	},

	passengerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Passenger",
		required: [true, "Passenger ID is required"]
	},

	seatId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Seat",
		required: [true, "Seat ID is required"]
	},

	ticketNumber: {
		type: String,
		unique: true,
		required: [true, "Ticket Number is required"]
	},

	isActive: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });


module.exports = mongoose.model("BookingPassenger", bookingPassengerSchema);
===== Flight.js =====
const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
	airlineId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Airline",
		required: [true, "Airline ID is required"]
	},

	aircraftId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Aircraft",
		required: [true, "Aircraft ID is required"]
	},

	originAirportId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Airport",
		required: [true, "Airport ID is required"]
	},

	destinationAirportId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Airport",
		required: [true, "Destination Airport ID is required"]
	},

	flightNumber: {
		type: String,
		required: [true, "Flight Number is required"]
	},

	departureTime: {
		type: Date,
		required: [true, "Departure time is required"]
	},

	arrivalTime: {
		type: Date,
		default: null
	},

	status: {
		type: String,
		enum: ["scheduled", "delayed", "on-time", "cancelled", "departed", "arrived"],
		default: "scheduled"
	},

	basePrice: {
		type: Number,
		required: [true, "Economy price is required"],
		min: [0, "Price must not be negative"]
	},

	businessPrice: {
		type: Number,
		required: [true, "Business class price is required"],
		min: [0, "Price must not be negative"]
	},

	originTerminal: {
		type: String,
		default: null
	},

	destinationTerminal: {
		type: String,
		default: null
	},

	isActive: {
		type: Boolean,
		default: true
	}

}, { timestamps: true });

module.exports = mongoose.model("Flight", flightSchema);
===== Itinerary.js =====
const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    guestEmail: {
        type: String,
        default: null,
        lowercase: true,
        trim: true
    },

    bookings: [{
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: [true, "Booking ID is required"]
        },

        type: {
            type: String,
            enum: ["outbound", "return", "layover"],
            required: [true, "Flight type is required"]
        },

        gate: {
            type: String,
            default: null
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Itinerary", itinerarySchema);
===== Notification.js =====
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    guestEmail: {
        type: String,
        default: null,
        lowercase: true,
        trim: true
    },

    type: {
        type: String,
        enum: ["booking_confirmed", "flight_status_change", "itinerary_created"],
        required: [true, "Notification type is required"]
    },

    message: {
        type: String,
        required: [true, "Notification message is required"]
    },

    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    referenceModel: {
        type: String,
        enum: ["Booking", "Flight", "Itinerary"],
        default: null
    },

    isRead: {
        type: Boolean,
        default: false
    },

    emailSent: {
        type: Boolean,
        default: false
    },

    emailSentAt: {
        type: Date,
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
===== Passenger.js =====
const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
	userId:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		default: null
	},

	firstName: {
		type: String,
		required: [true, "First Name is Required"]
	},

	lastName: {
		type: String,
		required: [true, "Last Name is Required"]
	},

	gender: {
	    type: String,
	    required: [true, "Gender is Required"],
	    enum: ["Male", "Female"]
	},

	dateOfBirth: {
		type: Date,
		required: [true, "Date of birth is Required"]
	},

	email: {
		type: String,
		required: [true, "Email is Required"],
		lowercase: true
	},

	nationality: {
		type: String,
		required: [true, "Nationality is Required"]
	},

	passportNumber: {
		type: String,
		required: [true, "Passport number is Required"],
		unique: true
	},

	passportExpiry: {
		type: Date,
		required: [true, "Passport expiry date is Required"]
	},
	
	phone: {
		type: String,
		required: [true, "Mobile Number is Required"],
	},

	isProfileSaved: {
		type: Boolean,
		default: false
	},

	isActive: {
	  	type: Boolean,
	  	default: true
	}

}, { timestamps: true });

module.exports = mongoose.model("Passenger", passengerSchema);
===== Payment.js =====
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		default: null
	},

	bookingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Booking",
		required: [true, "Booking ID is required"]
	},

	paymentMethod: {
		type: String,
		required: [true, "Payment method is required"],
		enum: ["credit_card", "debit_card", "gcash", "cash"]
	},

	amount: {
		type: Number,
		required: [true, "Amount is required"],
		min: [0, "Amount cannot be negative"]
	},

	status: {
		type: String,
		enum: ["pending", "paid", "failed", "refunded"],
		default: "pending"
	},

	transactionId: {
		type: String,
		default: null,
		unique: true,
		sparse: true
	},

	paidAt: {
		type: Date,
		default: null
	}
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
===== Seat.js =====
const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({

	flightId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Flight",
		required: [true, "Flight ID is required"]
	},

	seatNumber: {
		type: String,
		required: [true, "Seat number is required"],
		trim: true,
		uppercase: true
	},

	class: {
		type: String,
		enum: ["business", "economy"],
		required: [true, "Seat class is required"]
	},

	isOccupied: {
		type: Boolean,
		default: false
	},

	isActive: {
		type: Boolean,
		default: true
	}

}, { timestamps: true });

seatSchema.index({ flightId: 1, seatNumber: 1 }, { unique: true });


module.exports = mongoose.model("Seat", seatSchema);
===== User.js =====
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, "First Name is Required"]
	},

	lastName: {
		type: String,
		required: [true, "Last Name is Required"]
	},

	gender: {
	    type: String,
	    required: [true, "Gender is Required"],
	    enum: ["Male", "Female"]
	},

	email: {
		type: String,
		required: [true, "Email is Required"],
		unique: true,
		lowercase: true
	},

	password: {
		type: String,
		required: [true, "Password is Required"],
	},

	phone: {
		type: String,
		required: [true, "Mobile Number is Required"],
	},

	isAdmin: {
		type: Boolean,
		default: false
	},
	
	isActive: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
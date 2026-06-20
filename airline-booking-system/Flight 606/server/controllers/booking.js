
const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const Seat = require("../models/Seat");
const BookingPassenger = require("../models/BookingPassenger");
const { errorHandler } = require("../auth");
const { createNotification } = require("./notification");

// USER LEVEL ACCESS

module.exports.createBookingUser = (req, res) => {
    const { flightId, seatId } = req.body;

    if (!flightId) {
        return res.status(400).send({ message: "Flight ID is required" });
    }
    if (!seatId) {
        return res.status(400).send({ message: "Seat ID is required" });
    }

    return Flight.findById(flightId)
        .then(flight => {
            if (!flight) {
                return res.status(404).send({ message: "Flight not found" });
            }
            if (!flight.isActive) {
                return res.status(400).send({ message: "Cannot book an inactive flight" });
            }

            return Seat.findById(seatId)
                .then(seat => {
                    if (!seat) {
                        return res.status(404).send({ message: "Seat not found" });
                    }
                    if (String(seat.flightId) !== String(flightId)) {
                        return res.status(400).send({ message: "Seat does not belong to this flight" });
                    }
                    if (!seat.isActive) {
                        return res.status(400).send({ message: "Seat is not available" });
                    }
                    if (seat.isOccupied) {
                        return res.status(409).send({ message: "Seat is already occupied" });
                    }

                    const totalAmount = seat.class === "business"
                        ? flight.businessPrice
                        : flight.basePrice;

                    const bookingReference = "F606-" + Date.now();

                    return Booking.findOne({ bookingReference })
                        .then(existingBooking => {
                            if (existingBooking) {
                                return res.status(409).send({ message: "Booking Reference already exists" });
                            }

                            const newBooking = new Booking({
                                userId: req.user.id,
                                guestEmail: null,
                                flightId,
                                bookingReference,
                                status: "pending",
                                totalAmount,
                                isActive: true
                            });

                            return newBooking.save()
                                .then(result => {
                                    return res.status(201).send({
                                        message: "Booking created successfully",
                                        bookingReference: result.bookingReference,
                                        bookingId: result._id,
                                        flight: {
                                            flightNumber: flight.flightNumber,
                                            departureTime: flight.departureTime,
                                            arrivalTime: flight.arrivalTime,
                                            status: flight.status
                                        },
                                        seatClass: seat.class,
                                        totalAmount: result.totalAmount,
                                        status: result.status
                                    });
                                });
                        });
                });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.createBookingGuest = (req, res) => {
    const { flightId, seatId, guestEmail } = req.body;

    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }
    if (!flightId) {
        return res.status(400).send({ message: "Flight ID is required" });
    }
    if (!seatId) {
        return res.status(400).send({ message: "Seat ID is required" });
    }

    return Flight.findById(flightId)
        .then(flight => {
            if (!flight) {
                return res.status(404).send({ message: "Flight not found" });
            }
            if (!flight.isActive) {
                return res.status(400).send({ message: "Cannot book an inactive flight" });
            }

            return Seat.findById(seatId)
                .then(seat => {
                    if (!seat) {
                        return res.status(404).send({ message: "Seat not found" });
                    }
                    if (String(seat.flightId) !== String(flightId)) {
                        return res.status(400).send({ message: "Seat does not belong to this flight" });
                    }
                    if (!seat.isActive) {
                        return res.status(400).send({ message: "Seat is not available" });
                    }
                    if (seat.isOccupied) {
                        return res.status(409).send({ message: "Seat is already occupied" });
                    }

                    const totalAmount = seat.class === "business"
                        ? flight.businessPrice
                        : flight.basePrice;

                    const bookingReference = "F606-" + Date.now();

                    return Booking.findOne({ bookingReference })
                        .then(existingBooking => {
                            if (existingBooking) {
                                return res.status(409).send({ message: "Booking Reference already exists" });
                            }

                            const newBooking = new Booking({
                                userId: null,
                                guestEmail,
                                flightId,
                                bookingReference,
                                status: "pending",
                                totalAmount,
                                isActive: true
                            });

                            return newBooking.save()
                                .then(result => {
                                    return res.status(201).send({
                                        message: "Booking created successfully",
                                        bookingReference: result.bookingReference,
                                        bookingId: result._id,
                                        flight: {
                                            flightNumber: flight.flightNumber,
                                            departureTime: flight.departureTime,
                                            arrivalTime: flight.arrivalTime,
                                            status: flight.status
                                        },
                                        seatClass: seat.class,
                                        totalAmount: result.totalAmount,
                                        status: result.status
                                    });
                                });
                        });
                });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyBookingsUser = (req, res) => {
    return Booking.find({ userId: req.user.id })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No bookings found" });
            }
            return res.status(200).send({
                message: "Bookings found",
                bookings: result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyBookingsGuest = (req, res) => {
    const { guestEmail } = req.body;

    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }

    return Booking.find({ guestEmail, userId: null })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No bookings found" });
            }
            return res.status(200).send({
                message: "Bookings found",
                bookings: result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.secureGuestLookup = (req, res) => {
    const { guestEmail, bookingReference } = req.body;

    if (!guestEmail || !bookingReference) {
        return res.status(400).send({ message: "Both Email and Booking Reference are required." });
    }

    return Booking.findOne({ 
        guestEmail, 
        bookingReference, 
        userId: null, 
        isActive: true 
    })
    .populate({
        path: "flightId",
        populate: [
            { path: "originAirportId" },
            { path: "destinationAirportId" },
            { path: "airlineId" }
        ]
    })
    .then(booking => {
        if (!booking) {
            return res.status(404).send({ message: "No matching record found. Please check your details." });
        }
        return res.status(200).send({
            message: "Booking retrieved securely",
            booking
        });
    })
    .catch(err => errorHandler(err, req, res));
};


module.exports.getBookingByReference = (req, res) => {
    return Booking.findOne({
        bookingReference: req.params.bookingReference,
        isActive: true
    })
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "No booking found" });
        }
        return res.status(200).send({
            message: "Booking found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};


module.exports.cancelBookingUser = (req, res) => {
    return Booking.findOneAndUpdate(
        {
            bookingReference: req.params.bookingReference,
            userId: req.user.id,
            status: { $in: ["pending", "confirmed"] }
        },
        {
            status: "cancelled",
            isActive: false
        },
        { new: true }
    )
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Booking not found" });
        }

        // Free all seats claimed under this booking
        return BookingPassenger.find({ bookingId: result._id, isActive: true })
            .then(bkps => {
                const seatIds = bkps.map(b => b.seatId);
                return BookingPassenger.updateMany(
                    { bookingId: result._id },
                    { isActive: false }
                )
                .then(() => Seat.updateMany(
                    { _id: { $in: seatIds } },
                    { isOccupied: false }
                ))
                .then(() => res.status(200).send({
                    message: "Booking cancelled successfully",
                    result
                }));
            });
    })
    .catch(err => errorHandler(err, req, res));
};


module.exports.cancelBookingGuest = (req, res) => {
    const { guestEmail } = req.body;

    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }

    return Booking.findOneAndUpdate(
        {
            bookingReference: req.params.bookingReference,
            guestEmail,
            userId: null,
            status: { $in: ["pending", "confirmed"] }
        },
        {
            status: "cancelled",
            isActive: false
        },
        { new: true }
    )
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Booking not found" });
        }

        // Free all seats claimed under this booking
        return BookingPassenger.find({ bookingId: result._id, isActive: true })
            .then(bkps => {
                const seatIds = bkps.map(b => b.seatId);
                return BookingPassenger.updateMany(
                    { bookingId: result._id },
                    { isActive: false }
                )
                .then(() => Seat.updateMany(
                    { _id: { $in: seatIds } },
                    { isOccupied: false }
                ))
                .then(() => res.status(200).send({
                    message: "Booking cancelled successfully",
                    result
                }));
            });
    })
    .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.getAllBookings = (req, res) => {
    return Booking.find()
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No bookings found" });
            }
            return res.status(200).send({
                message: "Bookings found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.updateBooking = (req, res) => {
    const { flightId, totalAmount } = req.body;

    if (!flightId && !totalAmount) {
        return res.status(400).send({ message: "At least one field is required to update" });
    }

    if (flightId) {
        return Flight.findById(flightId)
            .then(flight => {
                if (!flight) {
                    return res.status(404).send({ message: "Flight not found" });
                }
                if (!flight.isActive) {
                    return res.status(400).send({ message: "Cannot assign an inactive flight" });
                }

                return Booking.findByIdAndUpdate(
                    req.params.id,
                    { flightId, totalAmount },
                    { new: true }
                )
                .then(result => {
                    if (!result) {
                        return res.status(404).send({ message: "Booking not found" });
                    }
                    return res.status(200).send({
                        message: "Booking updated successfully",
                        result
                    });
                });
            })
            .catch(err => errorHandler(err, req, res));
    }

    return Booking.findByIdAndUpdate(
        req.params.id,
        { totalAmount },
        { new: true }
    )
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Booking not found" });
        }
        return res.status(200).send({
            message: "Booking updated successfully",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.updateBookingStatus = (req, res) => {
    const { status } = req.body;

    const validStatus = ["pending", "confirmed", "cancelled"];
    if (!status || !validStatus.includes(status)) {
        return res.status(400).send({ message: "Valid status is required: pending, confirmed, cancelled" });
    }

    return Booking.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    )
   
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Booking not found" });
        }

        if (status === "confirmed") {
            createNotification({
                userId: result.userId,
                guestEmail: result.guestEmail,
                type: "booking_confirmed",
                message: `Your booking ${result.bookingReference} has been confirmed.`,
                referenceId: result._id,
                referenceModel: "Booking"
            }).catch(err => console.error("Notification save failed:", err));
        }

        return res.status(200).send({
            message: "Booking status updated successfully",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateBooking = (req, res) => {
    return Booking.findById(req.params.id)
        .then(booking => {
            if (!booking) {
                return res.status(404).send({ message: "Booking not found" });
            }
            if (!booking.isActive) {
                return res.status(400).send({ message: "Booking is already deactivated" });
            }

            return Booking.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Booking deactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.reactivateBooking = (req, res) => {
    return Booking.findById(req.params.id)
        .then(booking => {
            if (!booking) {
                return res.status(404).send({ message: "Booking not found" });
            }
            if (booking.isActive) {
                return res.status(400).send({ message: "Booking is already active" });
            }

            return Booking.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Booking reactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};
===== flight.js =====
const Flight = require("../models/Flight");
const Aircraft = require("../models/Aircraft");
const Airline = require("../models/Airline");
const Airport = require("../models/Airport");
const Booking = require("../models/Booking");
const Seat = require("../models/Seat");
const { createNotification } = require("./notification");
const { errorHandler } = require("../auth");



const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BUSINESS_ROWS = 2;
const SEATS_PER_ROW = 6;

const generateSeatDocuments = (flightId, totalSeats) => {
    const seats = [];

    for (let i = 0; i < totalSeats; i++) {
        const row = Math.floor(i / SEATS_PER_ROW) + 1;
        const col = COLUMNS[i % SEATS_PER_ROW];

        seats.push({
            flightId,
            seatNumber: `${row}${col}`,
            class: row <= BUSINESS_ROWS ? 'business' : 'economy',
            isOccupied: false,
            isActive: true
        });
    }

    return seats;
};


// USER LEVEL ACCESS

module.exports.searchFlights = (req, res) => {
    if (!req.query.originAirportId) {
        return res.status(400).send({ message: "Origin Airport ID required" });
    }
    if (!req.query.destinationAirportId) {
        return res.status(400).send({ message: "Destination Airport ID required" });
    }
    if (!req.query.departureDate) {
        return res.status(400).send({ message: "Departure date required" });
    }

    const startOfDay = new Date(req.query.departureDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(req.query.departureDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return Flight.find({
        originAirportId: req.query.originAirportId,
        destinationAirportId: req.query.destinationAirportId,
        departureTime: { $gte: startOfDay, $lte: endOfDay },
        isActive: true,
        status: "scheduled"
    })
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No flights found for this date" });
        }
        return res.status(200).send({
            message: "Flights found",
            flights: result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.getFlightById = (req, res) => {
    return Flight.findOne({
        _id: req.params.id,
        isActive: true
    })
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "No flight found" });
        }
        return res.status(200).send({
            message: "Flight found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.createFlight = (req, res) => {
    const { airlineId, aircraftId, originAirportId, destinationAirportId, flightNumber, departureTime, arrivalTime, basePrice, businessPrice, originTerminal, destinationTerminal } = req.body;

    if (!airlineId) {
        return res.status(400).send({ message: "Airline ID required" });
    }
    if (!aircraftId) {
        return res.status(400).send({ message: "Aircraft ID required" });
    }
    if (!originAirportId) {
        return res.status(400).send({ message: "Origin Airport ID required" });
    }
    if (!destinationAirportId) {
        return res.status(400).send({ message: "Destination Airport ID required" });
    }
    if (!flightNumber) {
        return res.status(400).send({ message: "Flight number required" });
    }
    if (!departureTime) {
        return res.status(400).send({ message: "Departure Time required" });
    }
    if (!arrivalTime) {
        return res.status(400).send({ message: "Arrival Time required" });
    }
    if (basePrice === undefined || basePrice === null) {
        return res.status(400).send({ message: "Economy price (basePrice) required" });
    }
    if (businessPrice === undefined || businessPrice === null) {
        return res.status(400).send({ message: "Business class price (businessPrice) required" });
    }
    if (businessPrice <= basePrice) {
        return res.status(400).send({ message: "Business class price must be greater than economy price" });
    }

    return Airline.findById(airlineId)
        .then(airline => {
            if (!airline) {
                return res.status(404).send({ message: "Airline not found" });
            }
            if (!airline.isActive) {
                return res.status(400).send({ message: "Cannot assign an inactive airline" });
            }

            return Aircraft.findById(aircraftId)
                .then(aircraft => {
                    if (!aircraft) {
                        return res.status(404).send({ message: "Aircraft not found" });
                    }
                    if (!aircraft.isActive) {
                        return res.status(400).send({ message: "Cannot assign an inactive aircraft" });
                    }

                    return Airport.findById(originAirportId)
                        .then(originAirport => {
                            if (!originAirport) {
                                return res.status(404).send({ message: "Origin airport not found" });
                            }
                            if (!originAirport.isActive) {
                                return res.status(400).send({ message: "Origin airport is inactive" });
                            }

                            return Airport.findById(destinationAirportId)
                                .then(destinationAirport => {
                                    if (!destinationAirport) {
                                        return res.status(404).send({ message: "Destination airport not found" });
                                    }
                                    if (!destinationAirport.isActive) {
                                        return res.status(400).send({ message: "Destination airport is inactive" });
                                    }

                                    return Flight.findOne({ flightNumber })
                                        .then(existingFlight => {
                                            if (existingFlight) {
                                                return res.status(409).send({ message: "Flight number already exists" });
                                            }

                                            const newFlight = new Flight({
                                                airlineId,
                                                aircraftId,
                                                originAirportId,
                                                destinationAirportId,
                                                flightNumber,
                                                departureTime,
                                                arrivalTime,
                                                status: "scheduled",
                                                basePrice,
                                                businessPrice,
                                                originTerminal: originTerminal || null,
                                                destinationTerminal: destinationTerminal || null,
                                                isActive: true
                                            });

                                            return newFlight.save()
                                                .then(savedFlight => {
                                                    const seatDocuments = generateSeatDocuments(
                                                        savedFlight._id,
                                                        aircraft.totalSeats
                                                    );

                                                    return Seat.insertMany(seatDocuments)
                                                        .then(seats => {
                                                            return res.status(201).send({
                                                                message: "Flight created successfully",
                                                                result: savedFlight,
                                                                seatsGenerated: seats.length
                                                            });
                                                        });
                                                });
                                        });
                                });
                        });
                });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.getAllFlights = (req, res) => {
    return Flight.find()
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No flights found" });
            }
            return res.status(200).send({
                message: "Flights found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.updateFlight = (req, res) => {
    const { airlineId, aircraftId, originAirportId, destinationAirportId, flightNumber, departureTime, arrivalTime, status, basePrice, businessPrice, originTerminal, destinationTerminal } = req.body;

    if (basePrice !== undefined && businessPrice !== undefined && businessPrice <= basePrice) {
        return res.status(400).send({ message: "Business class price must be greater than economy price" });
    }

    const updates = {};
    if (airlineId !== undefined)             updates.airlineId             = airlineId;
    if (aircraftId !== undefined)            updates.aircraftId            = aircraftId;
    if (originAirportId !== undefined)       updates.originAirportId       = originAirportId;
    if (destinationAirportId !== undefined)  updates.destinationAirportId  = destinationAirportId;
    if (flightNumber !== undefined)          updates.flightNumber          = flightNumber;
    if (departureTime !== undefined)         updates.departureTime         = departureTime;
    if (arrivalTime !== undefined)           updates.arrivalTime           = arrivalTime;
    if (status !== undefined)                updates.status                = status;
    if (basePrice !== undefined)             updates.basePrice             = basePrice;
    if (businessPrice !== undefined)         updates.businessPrice         = businessPrice;
    if (originTerminal !== undefined)        updates.originTerminal        = originTerminal || null;
    if (destinationTerminal !== undefined)   updates.destinationTerminal   = destinationTerminal || null;

    if (Object.keys(updates).length === 0) {
        return res.status(400).send({ message: "At least one field is required to update" });
    }

    return Flight.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    )
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Flight not found" });
        }

        if (status === "delayed" || status === "cancelled") {
            Booking.find({ flightId: result._id, isActive: true })
                .then(bookings => {
                    bookings.forEach(booking => {
                        createNotification({
                            userId: booking.userId,
                            guestEmail: booking.guestEmail,
                            type: "flight_status_change",
                            message: `Flight ${result.flightNumber} has been ${status}.`,
                            referenceId: result._id,
                            referenceModel: "Flight"
                        })
                        .catch(err => console.error("Notification failed:", err));
                    });
                })
                .catch(err => console.error("Booking lookup failed:", err));
        }

        return res.status(200).send({
            message: "Flight updated successfully",
            result
        });
    }) 
    .catch(err => errorHandler(err, req, res)); 
};

module.exports.deactivateFlight = (req, res) => {
    return Flight.findById(req.params.id)
        .then(flight => {
            if (!flight) {
                return res.status(404).send({ message: "Flight not found" });
            }
            if (!flight.isActive) {
                return res.status(400).send({ message: "Flight is already deactivated" });
            }

            return Flight.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => {
                return Seat.updateMany(
                    { flightId: req.params.id },
                    { isActive: false }
                )
                .then(() => {
                    return res.status(200).send({
                        message: "Flight deactivated successfully",
                        result
                    });
                });
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.reactivateFlight = (req, res) => {
    return Flight.findById(req.params.id)
        .then(flight => {
            if (!flight) {
                return res.status(404).send({ message: "Flight not found" });
            }
            if (flight.isActive) {
                return res.status(400).send({ message: "Flight is already active" });
            }

            return Flight.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
            .then(result => {
                return Seat.updateMany(
                    { flightId: req.params.id, isOccupied: false },
                    { isActive: true }
                )
                .then(() => {
                    return res.status(200).send({
                        message: "Flight reactivated successfully",
                        result
                    });
                });
            });
        })
        .catch(err => errorHandler(err, req, res));
};

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const { errorHandler } = require("../auth");
const { createNotification } = require("./notification");

// USER LEVEL ACCESS

module.exports.createPaymentUser = (req, res) => {
    const { bookingId, paymentMethod, amount } = req.body;

    if (!bookingId) {
        return res.status(400).send({ message: "Booking ID is required" });
    }
    if (!paymentMethod) {
        return res.status(400).send({ message: "Please choose your preferred payment method" });
    }
    if (amount === undefined || amount === null) {
        return res.status(400).send({ message: "Amount input is required" });
    }

    return Booking.findOne({ _id: bookingId, userId: req.user.id })
        .then(booking => {
            if (!booking) {
                return res.status(404).send({ message: "Booking not found" });
            }
            if (!booking.isActive) {
                return res.status(400).send({ message: "Cannot pay for an inactive booking" });
            }
            if (booking.status === "cancelled") {
                return res.status(400).send({ message: "Cannot pay for a cancelled booking" });
            }

            return Payment.findOne({ bookingId })
                .then(existingPayment => {
                    if (existingPayment) {
                        return res.status(409).send({ message: "Payment already exists for this booking" });
                    }

                    const newPayment = new Payment({
                        userId: req.user.id,
                        bookingId,
                        paymentMethod,
                        amount,
                        status: "paid",
                        transactionId: "TXN-" + Date.now(),
                        paidAt: new Date()
                    });

                    return newPayment.save()
                        .then(result => {
                            return Booking.findByIdAndUpdate(
                                bookingId,
                                { status: "confirmed" },
                                { new: true }
                            )
                            .then(updatedBooking => {
                                if (updatedBooking) {
                                    createNotification({
                                        userId: updatedBooking.userId,
                                        guestEmail: updatedBooking.guestEmail,
                                        type: "booking_confirmed",
                                        message: `Your booking ${updatedBooking.bookingReference} has been confirmed.`,
                                        referenceId: updatedBooking._id,
                                        referenceModel: "Booking"
                                    }).catch(err => console.error("Notification save failed:", err));
                                }
                                return res.status(201).send({
                                    message: "Payment created and booking confirmed successfully",
                                    transactionId: result.transactionId,
                                    status: result.status,
                                    bookingStatus: updatedBooking ? updatedBooking.status : null
                                });
                            });
                        });
                });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.createPaymentGuest = (req, res) => {
    const { bookingId, paymentMethod, amount, guestEmail } = req.body;

    if (!bookingId) {
        return res.status(400).send({ message: "Booking ID is required" });
    }
    if (!paymentMethod) {
        return res.status(400).send({ message: "Please choose your preferred payment method" });
    }
    if (amount === undefined || amount === null) {
        return res.status(400).send({ message: "Amount input is required" });
    }
    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }

    return Booking.findOne({ _id: bookingId, guestEmail, userId: null })
        .then(booking => {
            if (!booking) {
                return res.status(404).send({ message: "Booking not found" });
            }
            if (!booking.isActive) {
                return res.status(400).send({ message: "Cannot pay for an inactive booking" });
            }
            if (booking.status === "cancelled") {
                return res.status(400).send({ message: "Cannot pay for a cancelled booking" });
            }

            return Payment.findOne({ bookingId })
                .then(existingPayment => {
                    if (existingPayment) {
                        return res.status(409).send({ message: "Payment already exists for this booking" });
                    }

                    const newPayment = new Payment({
                        userId: null,
                        bookingId,
                        paymentMethod,
                        amount,
                        status: "paid",
                        transactionId: "TXN-" + Date.now(),
                        paidAt: new Date()
                    });

                    return newPayment.save()
                        .then(result => {
                            return Booking.findByIdAndUpdate(
                                bookingId,
                                { status: "confirmed" },
                                { new: true }
                            )
                            .then(updatedBooking => {
                                if (updatedBooking) {
                                    createNotification({
                                        userId: updatedBooking.userId,
                                        guestEmail: updatedBooking.guestEmail,
                                        type: "booking_confirmed",
                                        message: `Your booking ${updatedBooking.bookingReference} has been confirmed.`,
                                        referenceId: updatedBooking._id,
                                        referenceModel: "Booking"
                                    }).catch(err => console.error("Notification save failed:", err));
                                }
                                return res.status(201).send({
                                    message: "Payment created and booking confirmed successfully",
                                    transactionId: result.transactionId,
                                    status: result.status,
                                    bookingStatus: updatedBooking ? updatedBooking.status : null
                                });
                            });
                        });
                });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyPaymentsUser = (req, res) => {
    return Payment.find({ userId: req.user.id })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No payments found" });
            }
            return res.status(200).send({
                message: "Payments found",
                payments: result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyPaymentsGuest = (req, res) => {
    const { bookingId, guestEmail } = req.body;

    if (!bookingId) {
        return res.status(400).send({ message: "Booking ID is required" });
    }
    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }

    // Cross-check: verify the booking actually belongs to this guest
    return Booking.findOne({ _id: bookingId, guestEmail, userId: null })
        .then(booking => {
            if (!booking) {
                return res.status(404).send({ message: "Booking not found" });
            }

            return Payment.find({ bookingId })
                .then(result => {
                    if (result.length === 0) {
                        return res.status(404).send({ message: "No payments found" });
                    }
                    return res.status(200).send({
                        message: "Payments found",
                        payments: result
                    });
                });
        })
        .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.getAllPayments = (req, res) => {
    return Payment.find()
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No payments found" });
            }
            return res.status(200).send({
                message: "Payments found",
                payments: result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.getPaymentById = (req, res) => {
    return Payment.findById(req.params.id)
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "No payment found" });
            }
            return res.status(200).send({
                message: "Payment found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.updatePaymentStatus = (req, res) => {
    const { status } = req.body;

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).send({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    return Payment.findById(req.params.id)
        .then(payment => {
            if (!payment) {
                return res.status(404).send({ message: "Payment not found" });
            }
            if (payment.status === status) {
                return res.status(400).send({ message: `Payment is already marked as ${status}` });
            }

            return Payment.findByIdAndUpdate(
                req.params.id,
                {
                    status,
                    paidAt: status === "paid" ? Date.now() : null
                },
                { new: true }
            )
            .then(result => {
                if (status === "paid") {
                    return Booking.findByIdAndUpdate(
                        result.bookingId,
                        { status: "confirmed" },
                        { new: true }
                    )
                    .then(updatedBooking => {
                        if (updatedBooking) {
                            createNotification({
                                userId: updatedBooking.userId,
                                guestEmail: updatedBooking.guestEmail,
                                type: "booking_confirmed",
                                message: `Your booking ${updatedBooking.bookingReference} has been confirmed.`,
                                referenceId: updatedBooking._id,
                                referenceModel: "Booking"
                            }).catch(err => console.error("Notification save failed:", err));
                        }
                        return res.status(200).send({
                            message: "Payment marked as paid and booking confirmed",
                            result
                        });
                    });
                }

                return res.status(200).send({
                    message: "Status updated successfully",
                    result
                });
            });
        })
        .catch(err => errorHandler(err, req, res));
};
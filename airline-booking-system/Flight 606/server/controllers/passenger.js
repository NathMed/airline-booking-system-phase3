const Passenger = require("../models/Passenger");
const { errorHandler } = require("../auth");


// USER LEVEL ACCESS

module.exports.createPassengerUser = (req, res) => {
    const { firstName, lastName, dateOfBirth, nationality, passportNumber, passportExpiry, phone, gender } = req.body;

    if (!firstName || firstName.trim() === "") {
        return res.status(400).send({ message: "First name is required" });
    }
    if (!lastName || lastName.trim() === "") {
        return res.status(400).send({ message: "Last name is required" });
    }
    if (!gender) {
        return res.status(400).send({ message: "Gender is required" });
    }
    if (!dateOfBirth) {
        return res.status(400).send({ message: "Date of Birth is required" });
    }
    if (!nationality || nationality.trim() === "") {
        return res.status(400).send({ message: "Nationality is required" });
    }
    if (!passportNumber || passportNumber.trim() === "") {
        return res.status(400).send({ message: "Passport Number is required" });
    }
    if (!passportExpiry) {
        return res.status(400).send({ message: "Passport Expiry is required" });
    }
    if (!phone || phone.length !== 11) {
        return res.status(400).send({ message: "Phone number must be 11 digits" });
    }

    return Passenger.findOne({ passportNumber })
        .then(existingPassenger => {
            if (existingPassenger) {
                return res.status(409).send({ message: "Passport number already registered" });
            }

            const newPassenger = new Passenger({
                userId: req.user.id,
                firstName,
                lastName,
                gender,
                dateOfBirth,
                email: req.user.email,
                nationality,
                passportNumber,
                passportExpiry,
                phone,
                isProfileSaved: true
            });

            return newPassenger.save()
                .then(result => res.status(201).send({
                    message: "Passenger created successfully",
                    result
                }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.createPassengerGuest = (req, res) => {
    const { firstName, lastName, dateOfBirth, email, nationality, passportNumber, passportExpiry, phone, gender } = req.body;

    if (!firstName || firstName.trim() === "") {
        return res.status(400).send({ message: "First name is required" });
    }
    if (!lastName || lastName.trim() === "") {
        return res.status(400).send({ message: "Last name is required" });
    }
    if (!gender) {
        return res.status(400).send({ message: "Gender is required" });
    }
    if (!dateOfBirth) {
        return res.status(400).send({ message: "Date of Birth is required" });
    }
    if (!email || !email.includes("@")) {
        return res.status(400).send({ message: "Valid email is required" });
    }
    if (!nationality || nationality.trim() === "") {
        return res.status(400).send({ message: "Nationality is required" });
    }
    if (!passportNumber || passportNumber.trim() === "") {
        return res.status(400).send({ message: "Passport Number is required" });
    }
    if (!passportExpiry) {
        return res.status(400).send({ message: "Passport Expiry is required" });
    }
    if (!phone || phone.length !== 11) {
        return res.status(400).send({ message: "Phone number must be 11 digits" });
    }

    return Passenger.findOne({ passportNumber })
        .then(existingPassenger => {
            if (existingPassenger) {
                return res.status(409).send({ message: "Passport number already registered" });
            }

            const newPassenger = new Passenger({
                userId: null,
                firstName,
                lastName,
                gender,
                dateOfBirth,
                email,
                nationality,
                passportNumber,
                passportExpiry,
                phone,
                isProfileSaved: false
            });

            return newPassenger.save()
                .then(result => res.status(201).send({
                    message: "Passenger created successfully",
                    result
                }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyPassengers = (req, res) => {
    return Passenger.find({
        userId: req.user.id,
        isProfileSaved: true
    })
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No saved passenger profiles found" });
        }
        return res.status(200).send({
            message: "Passenger profiles found",
            passengers: result
        });
    })
    .catch(err => errorHandler(err, req, res));
};


module.exports.getPassengerForGuest = (req, res) => {
    const { passportNumber } = req.body;

    if (!passportNumber || passportNumber.trim() === "") {
        return res.status(400).send({ message: "Passport number is required for lookup" });
    }

    return Passenger.findOne({ passportNumber, userId: null })
        .then(passenger => {
            if (!passenger) {
                return res.status(404).send({ message: "No passenger found with this passport number" });
            }
            return res.status(200).send({
                message: "Passenger record retrieved successfully",
                passenger
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.updatePassenger = (req, res) => {
    const { firstName, lastName, gender, email, nationality, passportNumber, passportExpiry, phone } = req.body;

    return Passenger.findById(req.params.id)
        .then(passenger => {
            if (!passenger) {
                return res.status(404).send({ message: "Passenger not found" });
            }
            if (String(passenger.userId) !== req.user.id) {
                return res.status(403).send({ message: "Unauthorized to update this passenger" });
            }

            return Passenger.findByIdAndUpdate(
                req.params.id,
                { firstName, lastName, email, nationality, passportNumber, passportExpiry, phone, gender },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Passenger profile updated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.updatePassengerAsGuest = (req, res) => {
    const { passportNumber, firstName, lastName, email, nationality, passportExpiry, phone, gender } = req.body;

    if (!passportNumber || passportNumber.trim() === "") {
        return res.status(400).send({ message: "Passport number is required to identify the guest profile" });
    }

    return Passenger.findOneAndUpdate(
        {
            passportNumber,
            userId: null
        },
        { firstName, lastName, email, nationality, passportExpiry, phone, gender },
        { new: true }
    )
    .then(result => {
        if (!result) {
            return res.status(404).send({
                message: "Guest profile not found. Note: Profiles linked to registered accounts cannot be updated here."
            });
        }
        return res.status(200).send({
            message: "Guest passenger updated successfully",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.getAllPassengers = (req, res) => {
    return Passenger.find()
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No passengers found" });
            }
            return res.status(200).send({
                message: "Passengers found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.getPassengerById = (req, res) => {
    return Passenger.findById(req.params.id)
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "No passenger found" });
            }
            return res.status(200).send({
                message: "Passenger found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.adminUpdatePassenger = (req, res) => {
    const { firstName, lastName, gender, email, nationality, passportNumber, passportExpiry, phone } = req.body;

    return Passenger.findByIdAndUpdate(
        req.params.id,
        { firstName, lastName, gender, email, nationality, passportNumber, passportExpiry, phone },
        { new: true }
    )
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Passenger not found" });
        }
        return res.status(200).send({
            message: "Passenger profile updated successfully (Admin Action)",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.activatePassenger = (req, res) => {
    return Passenger.findById(req.params.id)
        .then(passenger => {
            if (!passenger) {
                return res.status(404).send({ message: "Passenger not found" });
            }
            if (passenger.isActive) {
                return res.status(400).send({ message: "Passenger profile is already active" });
            }

            return Passenger.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Passenger profile reactivated",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.deactivatePassenger = (req, res) => {
    return Passenger.findById(req.params.id)
        .then(passenger => {
            if (!passenger) {
                return res.status(404).send({ message: "Passenger not found" });
            }
            if (!passenger.isActive) {
                return res.status(400).send({ message: "Passenger profile is already inactive" });
            }

            return Passenger.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Passenger profile deactivated",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};

const BookingPassenger = require("../models/BookingPassenger");
const Booking = require("../models/Booking");
const Passenger = require("../models/Passenger");
const Seat = require("../models/Seat");
const { errorHandler } = require("../auth");

// USER LEVEL ACCESS

module.exports.createBookingPassenger = (req, res) => {
    const { bookingId, passengerId, seatId } = req.body;

    if (!bookingId || !passengerId) {
        return res.status(400).send({ message: "Booking ID and Passenger ID are required" });
    }
    if (!seatId) {
        return res.status(400).send({ message: "Seat ID is required" });
    }

    return Booking.findById(bookingId)
        .then(booking => {
            if (!booking) {
                return res.status(404).send({ message: "Booking not found" });
            }
            if (!booking.isActive) {
                return res.status(400).send({ message: "Cannot add passenger to an inactive booking" });
            }
            if (booking.userId && String(booking.userId) !== req.user.id) {
                return res.status(403).send({ message: "Unauthorized to add passengers to this booking" });
            }

            return Passenger.findById(passengerId)
                .then(passenger => {
                    if (!passenger) {
                        return res.status(404).send({ message: "Passenger not found" });
                    }
                    if (!passenger.isActive) {
                        return res.status(400).send({ message: "Cannot add an inactive passenger to a booking" });
                    }

                    return Seat.findById(seatId)
                        .then(seat => {
                            if (!seat) {
                                return res.status(404).send({ message: "Seat not found" });
                            }
                            if (!seat.isActive) {
                                return res.status(400).send({ message: "Seat is not available" });
                            }

                            // Verify the seat belongs to the same flight as the booking.
                            // Prevents a passenger from claiming a seat on a different flight.
                            if (String(seat.flightId) !== String(booking.flightId)) {
                                return res.status(400).send({ message: "Seat does not belong to this booking's flight" });
                            }

                            if (seat.isOccupied) {
                                return res.status(409).send({ message: "Seat is already occupied" });
                            }

                            const ticketNumber = "TKT-" + Date.now();

                            return BookingPassenger.findOne({ ticketNumber })
                                .then(existingTicketNumber => {
                                    if (existingTicketNumber) {
                                        return res.status(409).send({ message: "Ticket number already exists" });
                                    }

                                    const newBookingPassenger = new BookingPassenger({
                                        bookingId,
                                        passengerId,
                                        seatId,
                                        ticketNumber,
                                        isActive: true
                                    });

                                    return newBookingPassenger.save()
                                        .then(result => {
                                            return Seat.findByIdAndUpdate(
                                                seatId,
                                                { isOccupied: true },
                                                { new: true }
                                            )
                                            .then(() => {
                                                return res.status(201).send({
                                                    message: "Booking passenger created successfully",
                                                    result
                                                });
                                            });
                                        });
                                });
                        });
                });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.getBookingPassengerByBooking = (req, res) => {
    return BookingPassenger.find({ bookingId: req.params.bookingId })
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No passengers found for this booking" });
        }
        return res.status(200).send({
            message: "Booking Passengers found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

// ADMIN LEVEL ACCESS

module.exports.getAllBookingPassengers = (req, res) => {
    return BookingPassenger.find()
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No Booking Passengers found" });
        }
        return res.status(200).send({
            message: "Booking Passengers found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateBookingPassenger = (req, res) => {
    return BookingPassenger.findById(req.params.id)
        .then(bookingPassenger => {
            if (!bookingPassenger) {
                return res.status(404).send({ message: "Booking passenger not found" });
            }
            if (!bookingPassenger.isActive) {
                return res.status(400).send({ message: "Booking passenger is already deactivated" });
            }

            return BookingPassenger.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => {
               return Seat.findByIdAndUpdate(
                    bookingPassenger.seatId,
                    { isOccupied: false },
                    { new: true }
                )
                .then(() => {
                    return res.status(200).send({
                        message: "Booking passenger deactivated successfully",
                        result
                    });
                });
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.reactivateBookingPassenger = (req, res) => {
    return BookingPassenger.findById(req.params.id)
        .then(bookingPassenger => {
            if (!bookingPassenger) {
                return res.status(404).send({ message: "Booking passenger not found" });
            }
            if (bookingPassenger.isActive) {
                return res.status(400).send({ message: "Booking passenger is already active" });
            }

            return Seat.findById(bookingPassenger.seatId)
                .then(seat => {
                    if (!seat) {
                        return res.status(404).send({ message: "Associated seat not found" });
                    }
                    if (seat.isOccupied) {
                        return res.status(409).send({ message: "Cannot reactivate — seat has been taken by another passenger" });
                    }

                    return BookingPassenger.findByIdAndUpdate(
                        req.params.id,
                        { isActive: true },
                        { new: true }
                    )
                    .then(result => {
                        return Seat.findByIdAndUpdate(
                            bookingPassenger.seatId,
                            { isOccupied: true },
                            { new: true }
                        )
                        .then(() => {
                            return res.status(200).send({
                                message: "Booking passenger reactivated successfully",
                                result
                            });
                        });
                    });
                });
        })
        .catch(err => errorHandler(err, req, res));
};

const Seat = require("../models/Seat");
const Flight = require("../models/Flight");
const { errorHandler } = require("../auth");


// USER LEVEL ACCESS

module.exports.getSeatsByFlight = (req, res) => {
    return Flight.findOne({ _id: req.params.flightId, isActive: true })
        .then(flight => {
            if (!flight) {
                return res.status(404).send({ message: "Flight not found" });
            }

            return Seat.find({
                flightId: req.params.flightId,
                isActive: true
            })
            .sort({ seatNumber: 1 })
            .then(result => {
                if (result.length === 0) {
                    return res.status(404).send({ message: "No seats found for this flight" });
                }

                // Summary counts — useful for the frontend to display
                // "X of Y seats available" without counting client-side.
                const total    = result.length;
                const occupied = result.filter(s => s.isOccupied).length;
                const available = total - occupied;

                return res.status(200).send({
                    message: "Seats found",
                    summary: { total, occupied, available },
                    seats: result
                });
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getSeatById = (req, res) => {
    return Seat.findOne({
        _id: req.params.id,
        isActive: true
    })
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Seat not found" });
        }
        return res.status(200).send({
            message: "Seat found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.getAllSeats = (req, res) => {
    return Seat.find()
        .sort({ flightId: 1, seatNumber: 1 })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No seats found" });
            }
            return res.status(200).send({
                message: "Seats found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.updateSeatStatus = (req, res) => {
    const { isOccupied } = req.body;

    if (typeof isOccupied !== "boolean") {
        return res.status(400).send({ message: "isOccupied must be a boolean (true or false)" });
    }

    return Seat.findById(req.params.id)
        .then(seat => {
            if (!seat) {
                return res.status(404).send({ message: "Seat not found" });
            }
            if (!seat.isActive) {
                return res.status(400).send({ message: "Cannot update an inactive seat" });
            }
            if (seat.isOccupied === isOccupied) {
                return res.status(400).send({
                    message: `Seat is already marked as ${isOccupied ? "occupied" : "unoccupied"}`
                });
            }

            return Seat.findByIdAndUpdate(
                req.params.id,
                { isOccupied },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: `Seat marked as ${isOccupied ? "occupied" : "available"}`,
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateSeat = (req, res) => {
    return Seat.findById(req.params.id)
        .then(seat => {
            if (!seat) {
                return res.status(404).send({ message: "Seat not found" });
            }
            if (!seat.isActive) {
                return res.status(400).send({ message: "Seat is already deactivated" });
            }
            if (seat.isOccupied) {
                return res.status(400).send({
                    message: "Cannot deactivate an occupied seat. Free the seat first via updateSeatStatus."
                });
            }

            return Seat.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Seat deactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.reactivateSeat = (req, res) => {
    return Seat.findById(req.params.id)
        .then(seat => {
            if (!seat) {
                return res.status(404).send({ message: "Seat not found" });
            }
            if (seat.isActive) {
                return res.status(400).send({ message: "Seat is already active" });
            }

            return Seat.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Seat reactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};

const User = require("../models/User");
const { errorHandler } = require("../auth");
const bcrypt = require("bcryptjs");
const auth = require("../auth");

// USER LEVEL ACCESS

module.exports.registerUser = (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, phone, gender } = req.body;

    if (!firstName || firstName.trim() === "") {
        return res.status(400).send({ message: "First name is required" });
    }
    if (!lastName || lastName.trim() === "") {
        return res.status(400).send({ message: "Last name is required" });
    }
    if (!gender) {
        return res.status(400).send({ message: "Gender is required" });
    }
    if (!email || !email.includes("@")) {
        return res.status(400).send({ message: "Incorrect email format" });
    }
    if (!password || password.length < 8) {
        return res.status(400).send({ message: "Password must be at least 8 characters" });
    }
    if (!confirmPassword || confirmPassword !== password) {
        return res.status(400).send({ message: "Passwords do not match" });
    }
    if (!phone || phone.length !== 11) {
        return res.status(400).send({ message: "Phone number must be 11 digits" });
    }

    return User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(409).send({ message: "Email already registered" });
            }

            const newUser = new User({
                firstName,
                lastName,
                gender,
                email,
                password: bcrypt.hashSync(password, 10),
                phone,
                isAdmin: false
            });

            return newUser.save()
                .then((result) => res.status(201).send({
                    message: "User registered successfully!",
                    result
                }));
        })
        .catch((err) => errorHandler(err, req, res)); 
};

module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).send({ message: "Invalid email format"})
    }
     if (!password) {
        return res.status(400).send({ message: "Password is required" });
    }

    return User.findOne({ email })
        .then(result => {
            if (result === null) {
                return res.status(404).send({ message: "Email not found"});
            } 
            if (!result.isActive) {
                return res.status(403).send({ message: "Account is deactivated. Please contact support."})
            } 
            
            const isPasswordCorrect = bcrypt.compareSync(password, result.password);

            if (isPasswordCorrect){
                return res.status(200).send({ 
                    message: "User logged in successfully",
                    access: auth.createAccessToken(result)});
                } else {
                    return res.status(401).send({ message: "Incorrect email or password"})
                }
        })
        .catch(err => errorHandler(err, req, res));
}; 

module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "User not found"});
        } 
        if (!result.isActive) {
            return res.status(403).send({ message: "Account is deactivated. Please contact support."})
        }
        result.password = "";
        return res.status(200).send(result);
    })
        .catch(err => errorHandler(err,req,res));
};

module.exports.updateProfile = (req, res) => {
    const { firstName, lastName, phone, gender } = req.body;

    return User.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, phone, gender },
        { new: true }
    )
        .then((result) =>{
            if(!result) {
            return res.status(404).send({ message: "User not found"});
        } 
            return res.status(200).send({ 
                message: "User profile updated successfully",
                result
            });
    })
        .catch(err => errorHandler(err, req, res));
};

module.exports.updateEmail = (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).send({ message: "Incorrect email format" });
    }

    return User.findOne({ email })
        .then(existingUser => {
            if (existingUser && String(existingUser._id) !== req.user.id) {
                return res.status(409).send({ message: "Email is already in use" });
            }

            return User.findByIdAndUpdate(
                req.user.id,
                { email },
                { new: true }
            )
            .then(result => {
                if (!result) {
                    return res.status(404).send({ message: "User not found" });
                }
                return res.status(200).send({
                    message: "Email updated successfully",
                    result
                });
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.updatePassword = (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).send({ message: "Password must be at least 8 characters"});
    }

    return User.findById(req.user.id)
    .then((user) => {
        if (!user) {
            return res.status(404).send({ message: "User not found"});
        }

        const isPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).send({ message: "Incorrect current password"});
        }

        return User.findByIdAndUpdate(req.user.id,
        { password: bcrypt.hashSync(newPassword, 10)},
        { new: true }
        )
        .then(() => res.status(200).send({ message: "Password updated successfully"}));     
    })
    .catch((err) => errorHandler(err, req, res));   
};


// ADMIN LEVEL ACCESS

module.exports.getAllUsers = (req, res) => {
    return User.find()
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No users found"});
        }
        return res.status(200).send({
            message: "Users found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res)); 
};

module.exports.getUserById = (req, res) => {
    return User.findById(req.params.id)
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "No user found"});
        }
        return res.status(200).send({
            message: "User found",
            result
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.updateUserAsAdmin = (req, res) => {
    const { firstName, lastName, email, phone, gender, isAdmin } = req.body;

    return User.findByIdAndUpdate(
        req.params.id,
        { firstName, lastName, email, phone, gender, isAdmin },
        { new: true }
    )
        .then((result) =>{
            if(!result) {
            return res.status(404).send({message: "User not found"});
        } 
            return res.status(200).send({ 
                message: "User profile updated successfully",
                result
            });
        
    })
        .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateUserAsAdmin = (req, res) => {
    return User.findById(req.params.id)
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } 
            if (!user.isActive) {
                return res.status(400).send({ message: "User is already deactivated" });
            }

            return User.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then((result) =>
                res.status(200).send({
                    message: "User profile deactivated",
                    result
                })
            );
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.activateUserAsAdmin = (req, res) => {
    return User.findById(req.params.id)
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } 
            if (user.isActive) {
                return res.status(400).send({ message: "User is already active" });
            }

            return User.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
            .then((result) =>
                res.status(200).send({
                    message: "User profile reactivated",
                    result
                })
            );
        })
        .catch(err => errorHandler(err, req, res));
};

const Airport = require("../models/Airport");
const { errorHandler } = require("../auth");

// USER LEVEL ACCESS
module.exports.getAirportById = (req, res) => {
    return Airport.findById(req.params.id)
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "No airport found"});
        }
        return res.status(200).send({
            message: "Airport found",
            result
        });
    })
    .catch(err=> errorHandler(err, req, res));  
};

module.exports.getAllAirports = (req, res) => {
    return Airport.find()
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No airports found"});
        }
        return res.status(200).send({
            message: "Airports found",
            result
        });
    })
    .catch(err=> errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS 

module.exports.createAirport = (req, res) => {
    const { name, iataCode, city, country } = req.body;

    if (!name || !iataCode || !city || !country) {
        return res.status(400).send({ message: "Airport name, IATA code, city and country are required"});
    }

    return Airport.findOne({
        $or: [{ name }, { iataCode }]
    })

    .then((existingAirport)=>{
        if (existingAirport) {
            const conflict = existingAirport.name === name ? "Name" : "IATA code";
            return res.status(409).send({ message: `${conflict} is already registered` });
        }

        const newAirport = new Airport({
            name,
            iataCode,
            city,
            country,
            isActive: true
        });

        return newAirport.save()
            .then((result) => {
                return res.status(201).send({ 
                    message: "Airport registered successfully",
                    result 
                });
            });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateAirport = (req, res) => {
    return Airport.findById(req.params.id) 
        .then(airport => {
            if (!airport) {
                return res.status(404).send({ message: "Airport not found" });
            }
            if (!airport.isActive) { 
                return res.status(400).send({ message: "Airport is already deactivated" });
            }

            return Airport.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
                .then(result => res.status(200).send({ 
                    message: "Airport deactivated successfully", 
                    result 
                }));
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.reactivateAirport = (req, res) => {
    return Airport.findById(req.params.id) 
        .then(airport => {
            if (!airport) {
                return res.status(404).send({ message: "Airport not found" });
            }
            if (airport.isActive) { 
                return res.status(400).send({ message: "Airport is already active" });
            }

            return Airport.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
                .then(result => res.status(200).send({ 
                    message: "Airport reactivated successfully", 
                    result 
                }));
        })
        .catch(err => errorHandler(err, req, res));
};

const Airline = require("../models/Airline");
const { errorHandler } = require("../auth");


// ADMIN ACCESS ONLY

module.exports.createAirline = (req, res) => {
    const { name, iataCode, logoURL } = req.body;

    if (!name || !iataCode || !logoURL) {
        return res.status(400).send({ message: "Airline name, IATA Code and Logo URL are required" });
    } 

    return Airline.findOne({ 
        $or: [{ name }, { iataCode }] 
    })
    .then((existingAirline) => {
        if (existingAirline) {
            const conflict = existingAirline.name === name ? "Name" : "IATA code";
            return res.status(409).send({ message: `${conflict} is already registered` });
        }
        
        const newAirline = new Airline({
            name,
            iataCode,
            logoURL,
            isActive: true
        });

        return newAirline.save()
            .then((result) => res.status(201).send({
                message: "Airline registered successfully",
                result
            }));
    }) 
    .catch(err => errorHandler(err, req, res));
};


module.exports.getAirlineById = (req, res) => {
    return Airline.findById(req.params.id)
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "No airline found"});
        }
        return res.status(200).send({
            message: "Airline found",
            result
        });
    })
    .catch(err=> errorHandler(err, req, res));  
};

module.exports.getAllAirlines = (req, res) => {
    return Airline.find()
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No airlines found"});
        }
        return res.status(200).send({
            message: "Airlines found",
            result
        });
    })
    .catch(err=> errorHandler(err, req, res));
};

module.exports.updateAirline = (req, res) => {
    const { logoURL } = req.body;
    return Airline.findByIdAndUpdate(
        req.params.id,
        { logoURL },
        { new: true }
    )
        .then((result) =>{
            if(!result) {
            return res.status(404).send({ message: "Airline not found"});
        } else {
            return res.status(200).send({ 
                message: "Airline updated successfully",
                result
            });
        }
    })
        .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateAirline = (req, res) => {
    return Airline.findById(req.params.id)
        .then((airline) => {
            if (!airline) {
                return res.status(404).send({ message: "Airline not found" });
            } else if (!airline.isActive) {
                return res.status(400).send({ message: "Airline is already deactivated" });
            }

            return Airline.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            ).then((result) =>
                res.status(200).send({
                    message: "Airline deactivated successfully",
                    result
                })
            );
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.reactivateAirline = (req, res) => {
    return Airline.findById(req.params.id)
        .then((airline) => {
            if (!airline) {
                return res.status(404).send({ message: "Airline not found" });
            } else if (airline.isActive) {
                return res.status(400).send({ message: "Airline is already active" });
            }

            return Airline.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            ).then((result) =>
                res.status(200).send({
                    message: "Airline reactivated successfully",
                    result
                })
            );
        })
        .catch(err => errorHandler(err, req, res));
};

const Aircraft = require("../models/Aircraft");
const Airline = require("../models/Airline");
const { errorHandler } = require("../auth");


module.exports.createAircraft = (req, res) => {
    const { airlineId, model, totalSeats } = req.body;

    if (!airlineId || !model || !totalSeats) {
        return res.status(400).send({ message: "Airline ID, Model and Total Seats are required"});
    } 

    return Airline.findById(airlineId)
        .then(airline=>{
            if (!airline) {
                return res.status(404).send({ message: "Airline not found"});
            }
            if (!airline.isActive) {
                return res.status(400).send({ message: "Cannot assign aircraft to an inactive airline"})
            }
        

    return Aircraft.findOne({ model, airlineId})
        .then((existingAircraft) =>{
            if (existingAircraft) {
                return res.status(409).send({ message: "Aircraft already registered"});
            }

            const newAircraft = new Aircraft({
                airlineId,
                model,
                totalSeats,
                isActive: true,
            });

            return newAircraft.save()
            .then((result) => res.status(201).send({ 
                message: "Aircraft created successfully",
                result
            }));            
        });
    })  
        .catch(err => errorHandler(err, req, res));
};


module.exports.getAircraftById = (req, res) => {
    return Aircraft.findById(req.params.id)
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "No Aircraft found"});
        }
        return res.status(200).send({
            message: "Aircraft found",
            result
        });
    })
    .catch(err=> errorHandler(err, req, res));  
};

module.exports.getAllAircraft = (req, res) => {
    return Aircraft.find()
    .then(result => {
        if (result.length === 0) {
            return res.status(404).send({ message: "No Aircraft found"});
        }
        return res.status(200).send({
            message: "Aircraft found",
            result
        });
    })
    .catch(err=> errorHandler(err, req, res));
};

module.exports.updateAircraft = (req, res) => {
    const { airlineId, model, totalSeats } = req.body;

    if (!airlineId && !model && !totalSeats) {
        return res.status(400).send({ message: "At least one field is required to update" });
    }

    if (airlineId) {
        return Airline.findById(airlineId)
            .then(airline => {
                if (!airline) {
                    return res.status(404).send({ message: "Airline not found" });
                }
                if (!airline.isActive) {
                    return res.status(400).send({ message: "Cannot assign aircraft to an inactive airline" });
                }

                return Aircraft.findByIdAndUpdate(
                    req.params.id,
                    { airlineId, model, totalSeats },
                    { new: true }
                )
                    .then(result => {
                        if (!result) {
                            return res.status(404).send({ message: "Aircraft not found" });
                        }
                        return res.status(200).send({
                            message: "Aircraft updated successfully",
                            result
                        });
                    });
            })
            .catch(err => errorHandler(err, req, res));
    }

    return Aircraft.findByIdAndUpdate(
        req.params.id,
        { airlineId, model, totalSeats },
        { new: true }
    )
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "Aircraft not found" });
            }
            return res.status(200).send({
                message: "Aircraft updated successfully",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.deactivateAircraft = (req, res) => {
    return Aircraft.findById(req.params.id)
        .then((aircraft) => {
            if (!aircraft) {
                return res.status(404).send({ message: "Aircraft not found" });
            } else if (!aircraft.isActive) {
                return res.status(400).send({ message: "Aircraft is already deactivated" });
            }

            return Aircraft.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            ).then((result) =>
                res.status(200).send({
                    message: "Aircraft deactivated successfully",
                    result
                })
            );
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.reactivateAircraft = (req, res) => {
    return Aircraft.findById(req.params.id)
        .then((aircraft) => {
            if (!aircraft) {
                return res.status(404).send({ message: "Aircraft not found" });
            } else if (aircraft.isActive) {
                return res.status(400).send({ message: "Aircraft is already active" });
            }

            return Aircraft.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            ).then((result) =>
                res.status(200).send({
                    message: "Aircraft reactivated successfully",
                    result
                })
            );
        })
        .catch(err => errorHandler(err, req, res));
};

const Notification = require("../models/Notification");
const { errorHandler } = require("../auth");


// HELPER FUNCTION 
const simulateEmailSend = (recipient, message) => {
    console.log("─────────────────────────────────────────");
    console.log("📧 SIMULATED EMAIL SENT");
    console.log(`TO: ${recipient}`);
    console.log(`MESSAGE: ${message}`);
    console.log("─────────────────────────────────────────");
    return true;
};


//  NOTIFICATION FACTORY 
module.exports.createNotification = ({ userId, guestEmail, type, message, referenceId, referenceModel }) => {
    const recipient = guestEmail || `[User ID: ${userId}]`;

    const newNotification = new Notification({
        userId: userId || null,
        guestEmail: guestEmail || null,
        type,
        message,
        referenceId: referenceId || null,
        referenceModel: referenceModel || null,
        isRead: false,
        emailSent: true,
        emailSentAt: new Date(),
        isActive: true
    });

    simulateEmailSend(recipient, message);

    return newNotification.save();
};


//  USER LEVEL ACCESS 
module.exports.getMyNotificationsUser = (req, res) => {
    return Notification.find({ userId: req.user.id, isActive: true })
        .sort({ createdAt: -1 })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No notifications found" });
            }
            return res.status(200).send({
                message: "Notifications found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyNotificationsGuest = (req, res) => {
    const { guestEmail } = req.body;

    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }

    return Notification.find({ guestEmail, userId: null, isActive: true })
        .sort({ createdAt: -1 })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No notifications found" });
            }
            return res.status(200).send({
                message: "Notifications found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.markAsRead = (req, res) => {
    return Notification.findById(req.params.id)
        .then(notification => {
            if (!notification) {
                return res.status(404).send({ message: "Notification not found" });
            }

            const isOwner = notification.userId && String(notification.userId) === req.user.id;
            const isBroadcast = !notification.userId;
            if (!isOwner && !isBroadcast) {
                return res.status(403).send({ message: "Unauthorized to update this notification" });
            }

            if (notification.isRead) {
                return res.status(400).send({ message: "Notification is already marked as read" });
            }

            return Notification.findByIdAndUpdate(
                req.params.id,
                { isRead: true },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Notification marked as read",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.markAllAsReadUser = (req, res) => {
    return Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { isRead: true }
    )
    .then(result => res.status(200).send({
        message: "All notifications marked as read",
        result
    }))
    .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS 

module.exports.getAllNotifications = (req, res) => {
    return Notification.find()
        .sort({ createdAt: -1 })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No notifications found" });
            }
            return res.status(200).send({
                message: "Notifications found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.deactivateNotification = (req, res) => {
    return Notification.findById(req.params.id)
        .then(notification => {
            if (!notification) {
                return res.status(404).send({ message: "Notification not found" });
            }
            if (!notification.isActive) {
                return res.status(400).send({ message: "Notification is already deactivated" });
            }

            return Notification.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Notification deactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};

const mongoose = require("mongoose");
const Itinerary = require("../models/Itinerary");
const Booking = require("../models/Booking");
const { createNotification } = require("./notification");
const { errorHandler } = require("../auth");


// USER LEVEL ACCESS

module.exports.createItineraryUser = async (req, res) => {
    try {
        const { bookings } = req.body;
        
        // Ensure bookings exist
        if (!bookings || bookings.length === 0) {
            return res.status(400).send({ message: "At least one booking is required." });
        }

        // Validate each booking before creating the itinerary
        for (const segment of bookings) {
            const booking = await Booking.findOne({
                _id: segment.bookingId,
                userId: req.user.id,
                isActive: true
            });

            if (!booking) throw new Error(`Booking ${segment.bookingId} not found.`);
            if (booking.status !== "confirmed") {
                throw new Error(`Booking ${segment.bookingId} is not confirmed yet.`);
            }
        }

        // Create the itinerary
        const newItinerary = new Itinerary({
            userId: req.user.id,
            bookings: bookings,
            isActive: true
        });

        const result = await newItinerary.save();
        return res.status(201).send({ message: "Itinerary created!", result });

    } catch (err) {
        console.error("Itinerary Error:", err);
        return res.status(500).send({ message: err.message });
    }
};

module.exports.createItineraryGuest = (req, res) => {
    const { bookings, guestEmail } = req.body;

    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }
    if (!bookings || bookings.length === 0) {
        return res.status(400).send({ message: "At least one booking is required" });
    }

    const bookingChecks = bookings.map(segment => {
        return Booking.findOne({
            _id: segment.bookingId,
            guestEmail,
            userId: null,
            isActive: true
        })
        .then(booking => {
            if (!booking) {
                throw { status: 404, message: `Booking ${segment.bookingId} not found` };
            }
            if (booking.status !== "confirmed") {
                throw { status: 400, message: `Booking ${segment.bookingId} is not yet confirmed` };
            }
            return booking;
        });
    });

    return Promise.all(bookingChecks)
        .then(() => {
            const newItinerary = new Itinerary({
                userId: null,
                guestEmail,
                bookings,
                isActive: true
            });

            return newItinerary.save()
                .then(result => res.status(201).send({
                    message: "Itinerary created successfully",
                    result
                }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyItinerariesUser = (req, res) => {
    return Itinerary.find({ userId: req.user.id, isActive: true })
        .populate({
            path: "bookings.bookingId",
            populate: {
                path: "flightId",
                populate: [
                    { path: "originAirportId" },
                    { path: "destinationAirportId" },
                    { path: "airlineId" }
                ]
            }
        })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No itineraries found" });
            }
            return res.status(200).send({
                message: "Itineraries found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getMyItinerariesGuest = (req, res) => {
    const { guestEmail } = req.body;

    if (!guestEmail || !guestEmail.includes("@")) {
        return res.status(400).send({ message: "Valid guest email is required" });
    }

    return Itinerary.find({ guestEmail, userId: null, isActive: true })
        .populate({
            path: "bookings.bookingId",
            populate: {
                path: "flightId",
                populate: [
                    { path: "originAirportId" },
                    { path: "destinationAirportId" },
                    { path: "airlineId" }
                ]
            }
        })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No itineraries found" });
            }
            return res.status(200).send({
                message: "Itineraries found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getItineraryById = (req, res) => {
    return Itinerary.findById(req.params.id)
        .populate({
            path: "bookings.bookingId",
            populate: {
                path: "flightId",
                populate: [
                    { path: "originAirportId" },
                    { path: "destinationAirportId" },
                    { path: "airlineId" }
                ]
            }
        })
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "Itinerary not found" });
            }
            if (!result.isActive) {
                return res.status(400).send({ message: "Itinerary is inactive" });
            }

            const isOwner = result.userId && String(result.userId) === req.user.id;
            const isGuest = result.guestEmail && result.guestEmail === req.user.email;

            if (!isOwner && !isGuest && !req.user.isAdmin) {
                return res.status(403).send({ message: "Unauthorized to view this itinerary" });
            }

            return res.status(200).send({
                message: "Itinerary found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.addBookingToItinerary = (req, res) => {
    const { bookingId, type, gate } = req.body;

    if (!bookingId) {
        return res.status(400).send({ message: "Booking ID is required" });
    }
    if (!type) {
        return res.status(400).send({ message: "Flight type is required" });
    }

    return Itinerary.findById(req.params.id)
        .then(itinerary => {
            if (!itinerary) {
                return res.status(404).send({ message: "Itinerary not found" });
            }
            if (!itinerary.isActive) {
                return res.status(400).send({ message: "Itinerary is inactive" });
            }
            if (String(itinerary.userId) !== req.user.id) {
                return res.status(403).send({ message: "Unauthorized to update this itinerary" });
            }

            const alreadyAdded = itinerary.bookings.some(
                segment => String(segment.bookingId) === bookingId
            );
            if (alreadyAdded) {
                return res.status(409).send({ message: "Booking already added to this itinerary" });
            }

            return Booking.findOne({
                _id: bookingId,
                userId: req.user.id,
                isActive: true
            })
            .then(booking => {
                if (!booking) {
                    return res.status(404).send({ message: "Booking not found" });
                }
                if (booking.status !== "confirmed") {
                    return res.status(400).send({ message: "Booking is not yet confirmed" });
                }

                return Itinerary.findByIdAndUpdate(
                    req.params.id,
                    {
                        $push: {
                            bookings: { bookingId, type, gate: gate || null }
                        }
                    },
                    { new: true }
                )
                .then(result => res.status(200).send({
                    message: "Booking added to itinerary successfully",
                    result
                }));
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.removeBookingFromItinerary = (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).send({ message: "Booking ID is required" });
    }

    let bookingObjectId;
    try {
        bookingObjectId = new mongoose.Types.ObjectId(bookingId);
    } catch (e) {
        return res.status(400).send({ message: "Invalid Booking ID format" });
    }

    return Itinerary.findById(req.params.id)
        .then(itinerary => {
            if (!itinerary) {
                return res.status(404).send({ message: "Itinerary not found" });
            }
            if (!itinerary.isActive) {
                return res.status(400).send({ message: "Itinerary is inactive" });
            }
            if (String(itinerary.userId) !== req.user.id) {
                return res.status(403).send({ message: "Unauthorized to update this itinerary" });
            }

            const exists = itinerary.bookings.some(
                segment => String(segment.bookingId) === bookingId
            );
            if (!exists) {
                return res.status(404).send({ message: "Booking not found in this itinerary" });
            }

            if (itinerary.bookings.length === 1) {
                return res.status(400).send({ message: "Cannot remove the only booking in an itinerary. Deactivate the itinerary instead." });
            }

            return Itinerary.findByIdAndUpdate(
                req.params.id,
                {
                    $pull: {
                        bookings: { bookingId: bookingObjectId }
                    }
                },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Booking removed from itinerary successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.getAllItineraries = (req, res) => {
    return Itinerary.find()
        .populate({
            path: "bookings.bookingId",
            populate: {
                path: "flightId",
                populate: [
                    { path: "originAirportId" },
                    { path: "destinationAirportId" },
                    { path: "airlineId" }
                ]
            }
        })
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No itineraries found" });
            }
            return res.status(200).send({
                message: "Itineraries found",
                result
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.deactivateItinerary = (req, res) => {
    return Itinerary.findById(req.params.id)
        .then(itinerary => {
            if (!itinerary) {
                return res.status(404).send({ message: "Itinerary not found" });
            }
            if (!itinerary.isActive) {
                return res.status(400).send({ message: "Itinerary is already deactivated" });
            }

            return Itinerary.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Itinerary deactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.reactivateItinerary = (req, res) => {
    return Itinerary.findById(req.params.id)
        .then(itinerary => {
            if (!itinerary) {
                return res.status(404).send({ message: "Itinerary not found" });
            }
            if (itinerary.isActive) {
                return res.status(400).send({ message: "Itinerary is already active" });
            }

            return Itinerary.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            )
            .then(result => res.status(200).send({
                message: "Itinerary reactivated successfully",
                result
            }));
        })
        .catch(err => errorHandler(err, req, res));
};
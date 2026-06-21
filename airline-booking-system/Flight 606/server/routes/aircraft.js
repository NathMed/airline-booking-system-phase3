const express = require("express");
const aircraftController = require("../controllers/aircraft");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// ADMIN ONLY ACCESS

router.post("/create-aircraft", verify, verifyAdmin, aircraftController.createAircraft);

router.get("/get-aircraft/:id", verify, verifyAdmin, aircraftController.getAircraftById);

router.get("/get-all-aircraft", verify, verifyAdmin, aircraftController.getAllAircraft);

router.patch("/update-aircraft/:id", verify, verifyAdmin, aircraftController.updateAircraft);

router.patch("/deactivate-aircraft/:id", verify, verifyAdmin, aircraftController.deactivateAircraft);

router.patch("/reactivate-aircraft/:id", verify, verifyAdmin, aircraftController.reactivateAircraft);


module.exports = router;

const express = require("express");
const airlineController = require("../controllers/airline");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// ADMIN ONLY ACCESS

router.post("/create-airline", verify, verifyAdmin, airlineController.createAirline);

router.get("/get-airline/:id", verify, verifyAdmin, airlineController.getAirlineById);

router.get("/get-all-airlines", verify, verifyAdmin, airlineController.getAllAirlines);

router.patch("/update-airline/:id", verify, verifyAdmin, airlineController.updateAirline);

router.patch("/deactivate-airline/:id", verify, verifyAdmin, airlineController.deactivateAirline);

router.patch("/reactivate-airline/:id", verify, verifyAdmin, airlineController.reactivateAirline);


module.exports = router;

const express = require("express");
const airportController = require("../controllers/airport");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// USER LEVEL ACCESS

router.get("/get-airport/:id", airportController.getAirportById);

router.get("/get-all-airports", airportController.getAllAirports);


// ADMIN LEVEL ACCESS

router.post("/create-airport", verify, verifyAdmin, airportController.createAirport);

router.patch("/deactivate-airport/:id", verify, verifyAdmin, airportController.deactivateAirport);

router.patch("/reactivate-airport/:id", verify, verifyAdmin, airportController.reactivateAirport);


module.exports = router;

const express = require("express");
const bookingController = require("../controllers/booking");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();


// USER LEVEL ACCESS
router.post("/user/create-booking", verify, bookingController.createBookingUser);

router.post("/guest/create-booking", bookingController.createBookingGuest);

router.get("/user/my-bookings", verify, bookingController.getMyBookingsUser);

router.post("/guest/my-bookings", bookingController.getMyBookingsGuest);

router.post("/guest/secure-lookup", bookingController.secureGuestLookup);

router.get("/get-booking/:bookingReference", bookingController.getBookingByReference);

router.patch("/user/cancel-booking/:bookingReference", verify, bookingController.cancelBookingUser);

router.patch("/guest/cancel-booking/:bookingReference", bookingController.cancelBookingGuest);


// ADMIN LEVEL ACCESS
router.get("/get-all-bookings", verify, verifyAdmin, bookingController.getAllBookings);

router.patch("/update-booking/:id", verify, verifyAdmin, bookingController.updateBooking);

router.patch("/update-booking-status/:id", verify, verifyAdmin, bookingController.updateBookingStatus);

router.patch("/deactivate-booking/:id", verify, verifyAdmin, bookingController.deactivateBooking);

router.patch("/reactivate-booking/:id", verify, verifyAdmin, bookingController.reactivateBooking);


module.exports = router;

const express = require("express");
const bookingPassengerController = require("../controllers/bookingPassenger");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// USER LEVEL ACCESS

router.post("/create-booking-passenger", verify, bookingPassengerController.createBookingPassenger);

router.get("/get-booking-passengers/:bookingId", bookingPassengerController.getBookingPassengerByBooking);



// ADMIN LEVEL ACCESS

router.get("/get-all-booking-passengers", verify, verifyAdmin, bookingPassengerController.getAllBookingPassengers);

router.patch("/deactivate-booking-passenger/:id", verify, verifyAdmin, bookingPassengerController.deactivateBookingPassenger);

router.patch("/reactivate-booking-passenger/:id", verify, verifyAdmin, bookingPassengerController.reactivateBookingPassenger);


module.exports = router;

const express = require("express");
const flightController = require("../controllers/flight");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// USER LEVEL ACCESS

router.get("/search", flightController.searchFlights);

router.get("/get-flight/:id", flightController.getFlightById);

// ADMIN LEVEL ACCESS
router.get("/get-all-flights", verify, verifyAdmin, flightController.getAllFlights);

router.post("/create-flight", verify, verifyAdmin, flightController.createFlight);

router.patch("/update-flight/:id", verify, verifyAdmin, flightController.updateFlight);

router.patch("/deactivate-flight/:id", verify, verifyAdmin, flightController.deactivateFlight);

router.patch("/reactivate-flight/:id", verify, verifyAdmin, flightController.reactivateFlight);



module.exports = router;

const express = require("express");
const itineraryController = require("../controllers/itinerary");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// USER LEVEL ACCESS
router.post("/create-itinerary", verify, itineraryController.createItineraryUser);

router.post("/create-itinerary-guest", itineraryController.createItineraryGuest);

router.get("/my-itineraries", verify, itineraryController.getMyItinerariesUser);

router.post("/my-itineraries-guest", itineraryController.getMyItinerariesGuest);

router.get("/get-itinerary/:id", verify, itineraryController.getItineraryById);

router.patch("/add-booking/:id", verify, itineraryController.addBookingToItinerary);

router.patch("/remove-booking/:id", verify, itineraryController.removeBookingFromItinerary);

// ADMIN LEVEL ACCESS
router.get("/get-all-itineraries", verify, verifyAdmin, itineraryController.getAllItineraries);

router.patch("/deactivate-itinerary/:id", verify, verifyAdmin, itineraryController.deactivateItinerary);

router.patch("/reactivate-itinerary/:id", verify, verifyAdmin, itineraryController.reactivateItinerary);

module.exports = router;

const express = require("express");
const notificationController = require("../controllers/notification");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// USER LEVEL ACCESS
router.get("/my-notifications", verify, notificationController.getMyNotificationsUser);

router.post("/my-notifications-guest", notificationController.getMyNotificationsGuest);

router.patch("/mark-as-read/:id", verify, notificationController.markAsRead);

router.patch("/mark-all-as-read", verify, notificationController.markAllAsReadUser);

// ADMIN LEVEL ACCESS
router.get("/get-all-notifications", verify, verifyAdmin, notificationController.getAllNotifications);

router.patch("/deactivate-notification/:id", verify, verifyAdmin, notificationController.deactivateNotification);

module.exports = router;

const express = require("express");
const passengerController = require("../controllers/passenger");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();


// USER LEVEL ACCESS
router.post("/user/create-passenger", verify, passengerController.createPassengerUser);

router.post("/guest/create-passenger", passengerController.createPassengerGuest);

router.get("/user/my-passengers", verify, passengerController.getMyPassengers);

router.post("/guest/get-passenger", passengerController.getPassengerForGuest);

router.patch("/user/update-passenger/:id", verify, passengerController.updatePassenger);

router.patch("/guest/update-passenger", passengerController.updatePassengerAsGuest);


// ADMIN LEVEL ACCESS
router.get("/get-all-passengers", verify, verifyAdmin, passengerController.getAllPassengers);

router.get("/get-passenger/:id", verify, verifyAdmin, passengerController.getPassengerById);

router.put("/admin-update-passenger/:id", verify, verifyAdmin, passengerController.adminUpdatePassenger);

router.patch("/activate-passenger/:id", verify, verifyAdmin, passengerController.activatePassenger);

router.patch("/deactivate-passenger/:id", verify, verifyAdmin, passengerController.deactivatePassenger);


module.exports = router;

const express = require("express");
const paymentController = require("../controllers/payment");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();


// USER LEVEL ACCESS
router.post("/user/create-payment", verify, paymentController.createPaymentUser);

router.post("/guest/create-payment", paymentController.createPaymentGuest);

router.get("/user/my-payments", verify, paymentController.getMyPaymentsUser);

router.post("/guest/my-payments", paymentController.getMyPaymentsGuest);


// ADMIN LEVEL ACCESS
router.get("/get-all-payments", verify, verifyAdmin, paymentController.getAllPayments);

router.get("/get-payment/:id", verify, verifyAdmin, paymentController.getPaymentById);

router.patch("/update-payment-status/:id", verify, verifyAdmin, paymentController.updatePaymentStatus);


module.exports = router;

const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seat");
const { verify, verifyAdmin } = require("../auth");


// USER LEVEL ACCESS

router.get("/get-seats-by-flight/:flightId", seatController.getSeatsByFlight);

router.get("/get-seat/:id", verify, seatController.getSeatById);


// ADMIN LEVEL ACCESS

router.get("/get-all-seats", verify, verifyAdmin, seatController.getAllSeats);

router.patch("/update-seat-status/:id", verify, verifyAdmin, seatController.updateSeatStatus);

router.patch("/deactivate-seat/:id", verify, verifyAdmin, seatController.deactivateSeat);

router.patch("/reactivate-seat/:id", verify, verifyAdmin, seatController.reactivateSeat);


module.exports = router;

const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();


// USER LEVEL ACCESS
router.post("/register", userController.registerUser);

router.post("/login",userController.loginUser);

router.get("/profile", verify, userController.getProfile);

router.patch("/update-profile", verify, userController.updateProfile);

router.patch("/update-email", verify, userController.updateEmail);

router.patch("/update-password", verify, userController.updatePassword);


// ADMIN LEVEL ACCESS
router.get("/show-all-users", verify, verifyAdmin, userController.getAllUsers);

router.get("/show-user/:id", verify, verifyAdmin, userController.getUserById);

router.patch("/update-user/:id", verify, verifyAdmin, userController.updateUserAsAdmin);

router.patch("/deactivate-user/:id", verify, verifyAdmin, userController.deactivateUserAsAdmin);

router.patch("/reactivate-user/:id", verify, verifyAdmin, userController.activateUserAsAdmin);


module.exports = router;
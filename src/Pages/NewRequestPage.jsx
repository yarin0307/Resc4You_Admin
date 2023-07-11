import React, { useState, useEffect, useContext } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import Map from "../Components/Map";
import { LoadScript } from "@react-google-maps/api";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import AutoCompleteComponent from "../Components/AutoCompleteComponent";
import { KMContext } from "../Context/KMProvider";
const apiTypes = "api/Specialtys";
const apiCars = "api/Manufacturers";
const apiRegiserCitizen = "api/Citizens";
const apiInsertRequest = "api/Requests";
const apiGetUser = "GetUser";
const apiInsertVolunteerOfRequest = "InsertToVolunteerOfRequest";
const apiSendPushNotifications =
    "SendNotificationsForRelevantVolunteersFromWeb";
const apiNumberOpenRequests = "NumberCitizenOpenRequest";

const app = initializeApp(firebaseConfig);
function storeRequestInFireBase(requestId, status) {
    const db = getDatabase(app);
    const reference = ref(db, "Requests/" + requestId);
    set(reference, {
        status: status,
        phone: "",
    });
}

const NewRequestPage = () => {
    const phoneFrom = localStorage.getItem("Phone");
    const { km, setKm } = useContext(KMContext);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [carType, setCarType] = useState([]);
    const [selectedCarType, setSelectedCarType] = useState("");
    const [requestType, setRequestType] = useState([]);
    const [selectedRequestType, setSelectedRequestType] = useState("");
    const [address, setAddress] = useState("");
    const [mapCenter, setMapCenter] = useState({
        lat: 32.321457,
        lng: 34.853195,
    });
    const validLicenseNumber = /^[0-9]{7,8}$/;
    const validPhone = /^[0-9]{10}$/;

    if (window.google && window.google.maps) {
        var service = new window.google.maps.DistanceMatrixService();
    } else {
        console.error("Google Maps API is not available.");
    }


    const handleSubmit = (event) => {
        event.preventDefault();

        let requestTypeId;
        let carTypeId;

        requestType.find((item) => {
            if (item.name === selectedRequestType) {
                requestTypeId = item.id;
            }
        });

        carType.find((item) => {
            if (item.name === selectedCarType) {
                carTypeId = item.id;
            }
        });

        if (!validPhone.test(phone)) {
            toast.error("Phone Number is not valid");
            return;
        }

        if (selectedRequestType != "Stuck elevator") {
            if (!validLicenseNumber.test(licenseNumber)) {
                toast.error("License Number is not valid");
                return;
            }
        }
        const citizen = {
            Phone: phone,
            FName: firstName,
            LName: lastName,
            Password: "1",
            Email: email,
            PersonType: "C",
            Expo_push_token: "",
        };

        axios
            .get(apiGetUser + `/${phone}`)
            .then((res) => {
                if (res.data) {
                    insertRequest(requestTypeId, carTypeId);
                } else {
                    axios
                        .post(apiRegiserCitizen, citizen)
                        .then((res) => {
                            insertRequest(requestTypeId, carTypeId);
                        })
                        .catch((err) => {
                            if (err.response.status === 400) {
                                toast.error("Phone Number already exists");
                            }
                        });
                }
            })
            .catch((err) => {
                toast.error(err.response.data);
            });
    };

    const insertRequest = (requestTypeId, carTypeId) => {
        const request = {
            RequestId: 0,
            RequestAddress: address,
            RequestLongitude: mapCenter.lng,
            RequestLatitude: mapCenter.lat,
            LicenseNum: licenseNumber,
            RequestStatus: "Waiting",
            RequestDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
            RequestSummary: "",
            CitizenPhone: phone,
            WorkerPhone: phoneFrom,
            ManufacturerId: carTypeId ? carTypeId : 1,
            SpecialtyId: requestTypeId,
        };
        axios
            .get(apiNumberOpenRequests + `/${phone}`)
            .then((res) => {
                if (res.data[0].numberOfOpened === 0) {
                    axios
                        .post(apiInsertRequest, request)
                        .then((res) => {
                            console.log(request);
                            storeRequestInFireBase(res.data, "Waiting");
                            toast.success("Request was sent successfully");
                            getRelevantVolunteers(requestTypeId, res.data);
                        })
                        .catch((err) => {
                            toast.error(err.response.data);
                        });
                } else {
                    toast.error("The citizen has an open request");
                }
            })
            .catch((err) => {
                toast.error(err.response.data);
            });
    };

    const getRelevantVolunteers = (requestType, requestId) => {
        const getRelevantVolunteersApi = `GetRelevantVolunteer/${requestType}`;
        axios
            .get(getRelevantVolunteersApi)
            .then((res) => {
                console.log(res.data);
                ReducingVolunteersAccordingDistance(res.data, requestId);
            })
            .catch((err) => {
                toast.error(err.response.data);
            });
    };

    //filter the relevant volunteers according to their distance from the request
    const ReducingVolunteersAccordingDistance = (
        volunteerLocations,
        requestId
    ) => {
        service.getDistanceMatrix(
            {
                origins: [{ lat: mapCenter.lat, lng: mapCenter.lng }],
                destinations: volunteerLocations.map((volunteer) => ({
                    lat: volunteer.volunteerLatitude,
                    lng: volunteer.volunteerLongitude,
                })),
                travelMode: "DRIVING",
                unitSystem: window.google.maps.UnitSystem.METRIC,
            },
            (response, status) => {
                if (status === "OK") {
                    const results = response.rows[0].elements;
                    const nearbyVolunteers = volunteerLocations.filter((volunteer, i) => {
                        return (
                            results[i].status === "OK" && results[i].distance.value <= (km*1000)
                        ); // 50 km = 50000 meters
                    });
                    postVolunteerToVolunteerOfRequest(nearbyVolunteers, requestId);
                    console.log(nearbyVolunteers);
                } else {
                    console.error("Error:", status);
                }
            }
        );
    };

    //post the relevant volunteers according to specialty and location to volunteer of request table
    const postVolunteerToVolunteerOfRequest = (nearbyVolunteers, requestId) => {
        nearbyVolunteers.forEach((element) => {
            axios
                .post(
                    apiInsertVolunteerOfRequest +
                    `/${element.volunteerPhone}/RequestId/${requestId}`
                )
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    toast.error(err.response.data);
                });
        });
        sendPushNotificationsRelevantVolunteers(nearbyVolunteers);
    };

    //send push notofications to relevant volunteers
    const sendPushNotificationsRelevantVolunteers = (nearbyVolunteers) => {
        nearbyVolunteers.forEach((element) => {
            axios
                .post(
                    apiSendPushNotifications +
                    `/${address}/pushToken/${element.expo_push_token}`
                )
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    };
    const handleMapCenterChange = (mapCenter) => {
        setMapCenter(mapCenter);
    };
    useEffect(() => {
        axios
            .get(apiTypes)
            .then((res) => {
                console.log(res.data);
                const requestsTypeArr = res.data.map((item) => {
                    return { id: item.specialtyId, name: item.specialtyName };
                });
                setRequestType(requestsTypeArr);
            })
            .catch((err) => {
                toast.error(err.response.data);
            });

        return () => { };
    }, []);

    useEffect(() => {
        axios
            .get(apiCars)
            .then((res) => {
                console.log(res.data);
                const CarsTypeArr = res.data.map((item) => {
                    return { id: item.manufacturerId, name: item.manufacturerName };
                });
                setCarType(CarsTypeArr);
            })
            .catch((err) => {
                toast.error(err.response.data);
            });

        return () => { };
    }, []);

    return (
        <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
        >
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Card>
                            <Card.Header style={{ textAlign: "center" }}>
                                Personal Details
                            </Card.Header>
                            <Card.Body>
                                <Form.Group
                                    as={Row}
                                    controlId="formFirstName"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        First Name
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter first name"
                                            value={firstName}
                                            required={true}
                                            onChange={(event) => setFirstName(event.target.value)}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group
                                    as={Row}
                                    controlId="formLastName"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        Last Name
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter last name"
                                            value={lastName}
                                            required={true}
                                            onChange={(event) => setLastName(event.target.value)}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group
                                    as={Row}
                                    controlId="formEmail"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        Email
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            required={true}
                                            onChange={(event) => setEmail(event.target.value)}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group
                                    as={Row}
                                    controlId="formPhone"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        Phone
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter phone number"
                                            value={phone}
                                            required={true}
                                            onChange={(event) => setPhone(event.target.value)}
                                        />
                                    </Col>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card>
                            <Card.Header style={{ textAlign: "center" }}>
                                Request Details
                            </Card.Header>
                            <Card.Body>
                                <AutoCompleteComponent
                                    setMapCenter={handleMapCenterChange}
                                    address={address}
                                    setAddress={setAddress}
                                />
                                <Form.Group
                                    as={Row}
                                    controlId="formCarType"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        Car Type
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            as="select"
                                            value={selectedCarType}
                                            onChange={(event) =>
                                                setSelectedCarType(event.target.value)
                                            }
                                        >
                                            <option value="">Select car type</option>
                                            {carType.map((type, index) => (
                                                <option key={type.id} value={type.name}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                <Form.Group
                                    as={Row}
                                    controlId="formLicenseNumber"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        License Number
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter license number"
                                            value={licenseNumber}
                                            onChange={(event) => setLicenseNumber(event.target.value)}
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group
                                    as={Row}
                                    controlId="formRequestType"
                                    style={{ margin: "10px 0" }}
                                >
                                    <Form.Label column sm={3}>
                                        Request Type
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            as="select"
                                            value={selectedRequestType}
                                            required={true}
                                            onChange={(event) =>
                                                setSelectedRequestType(event.target.value)
                                            }
                                        >
                                            <option value="">Select request type</option>
                                            {requestType.map((type, index) => (
                                                <option key={type.id} value={type.name}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Button
                            variant="primary"
                            type="submit"
                            style={{ float: "right", margin: "10px" }}
                        >
                            Submit
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Card>
                            <Card.Header style={{ textAlign: "center" }}>
                                Map View
                            </Card.Header>
                            <Card.Body>
                                <Map lat={mapCenter.lat} lng={mapCenter.lng} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
            <ToastContainer />
        </LoadScript>
    );
};

export default NewRequestPage;

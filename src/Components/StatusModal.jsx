import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import firebaseConfig from "../firebaseConfig";


const apiDetailsOfReportedRequest =
    "GetDetailsOfReportedRequest/";


function StatusModal({ visible, handleClose, request }) {
    const [NumOfVolunteer, setNumOfVolunteer] = useState(0);
    const [RequestDate, setRequestDate] = useState("");
    const [origin, setOrigin] = useState({});
    const [destination, setDestination] = useState({});
    const [carLocation, setCarLocation] = useState({});
    const [VolunteerPhone, setVolunteerPhone] = useState("");

    var requestRef;
    var VolunteerRef;
    const app = initializeApp(firebaseConfig);
    function listenToRequestStatus() {
        const db = getDatabase(app);
        requestRef = ref(db, "Requests/" + request.requestId);
        onValue(requestRef, (snapshot) => {
            const request = snapshot.val();
            setVolunteerPhone(request.phone)
            listenToVolunteerLocation(request.phone);
        });
    }
    function listenToVolunteerLocation(VolunteerPhone) {
        const db = getDatabase(app);
        VolunteerRef = ref(db, "Volunteers/" + VolunteerPhone);
        onValue(VolunteerRef, (snapshot) => {
            const location = snapshot.val();
            setCarLocation({
                latitude: location.Latitude,
                longitude: location.Longitude,
            });
        });
    }

    useEffect(() => {
        if (visible) {
            listenToRequestStatus();
            const citizenPhone = request.citizen.split(" ");
            axios
                .get(apiDetailsOfReportedRequest + citizenPhone[2])
                .then((res) => {
                    setNumOfVolunteer(res.data[0].numOfRelevantVolunteer);
                    setRequestDate(new Date(res.data[0].requestDate).toDateString());
                })
                .catch((err) => {
                    alert(err.response.data);
                });

            return () => {
                if (requestRef) off(requestRef);
                if (VolunteerRef) off(VolunteerRef);
            };
        }
    }, [request])

    useEffect(() => {
        if (visible) {
            if (VolunteerPhone !== "") {
                axios
                    .get(
                        `GetRequestAndVolunteerLocation/${request.requestId}/volunteerPhone/${VolunteerPhone}`
                    )
                    .then((res) => {
                        setOrigin({
                            latitude: res.data[0].volunteerLatitude,
                            longitude: res.data[0].volunteerLongitude,
                        });
                        setDestination({
                            latitude: res.data[0].requestLatitude,
                            longitude: res.data[0].requestLongitude,
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        }
    }, [VolunteerPhone]);

    const handleOpenGoogleMaps = () => {
        const originStr = encodeURIComponent(`${carLocation.latitude},${carLocation.longitude}`);
        const destinationStr = encodeURIComponent(`${destination.latitude},${destination.longitude}`);
        const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&navigate=yes`;

        window.open(url, '_blank');
    };
    if (!visible) {
        return null;
    }
    return (
        <div
            className="modal show"
            style={{ display: 'block', position: 'fixed', zIndex: 1, left: 0, top: 0, width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
            <Modal.Dialog>
                <Modal.Header closeButton onClick={handleClose}>
                    <Modal.Title>Request Status</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Request received on {RequestDate}.<br />
                    The request has been distributed to {NumOfVolunteer} relevant volunteers.<br />
                    {request.requestStatus !== "Waiting" && (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button style={{marginTop:"2%"}} className="btn btn-primary" onClick={handleOpenGoogleMaps}>
                                Show On Map
                            </button>
                        </div>

                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={handleClose} variant="secondary">Close</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </div>
    );
}

export default StatusModal;
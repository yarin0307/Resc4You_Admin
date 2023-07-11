import React from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { Card, Form, Row, Col, Button } from "react-bootstrap";

export default function AutoCompleteComponent({
  setMapCenter,
  setAddress,
  address,
}) {
  const [autocomplete, setAutocomplete] = React.useState(null);

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };
  return (
    <Autocomplete
      onLoad={(autocomplete) => setAutocomplete(autocomplete)}
      onPlaceChanged={() => {
        if (autocomplete !== null) {
          const place = autocomplete.getPlace();
          setAddress(place.formatted_address);
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      }}
    >
      <div className="autocomplete-container">
        <Form.Group
          as={Row}
          controlId="formLocation"
          style={{ margin: "10px 0" }}
        >
          <Form.Label column sm={3}>
            Location
          </Form.Label>
          <Col sm={9}>
            <Form.Control
              type="text"
              placeholder="Enter location"
              value={address}
              required={true}
              onChange={handleAddressChange}
            />
          </Col>
        </Form.Group>
      </div>
    </Autocomplete>
  );
}

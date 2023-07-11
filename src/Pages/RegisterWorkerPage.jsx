import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import registerWorker from '../assets/registerWorker.png';
import axios from 'axios';
import { useState } from 'react';
import RegisterInputs from '../Components/RegisterInputs';
import { ToastContainer, toast } from "react-toastify";


export default function RegisterWorkerPage() {
  const apiWorker = "RegisterWorker";
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    const res = vaildWorkerDetails();
    if (res.status) {
      const worker = {
        Phone: phone,
        FName: firstName,
        LName: lastName,
        Password: password,
        Email: email,
        PersonType: "W",
        Expo_push_token: "",
        WorkerType: "R"
      };
      axios
        .post(apiWorker, worker)
        .then((res) => {
          toast.success("Representative added successfully");
        })
        .catch((err) => {
          toast.error(err.response.data);
        });

    } else {
      toast.error(res.msg);
    }
  };
  const vaildWorkerDetails = () => {
    const validPhone = /^[0-9]{10}$/;
    const validEmail = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (firstName === "")
      return { status: false, msg: "you must enter first name" };
    if (lastName === "")
      return { status: false, msg: "you must enter last name" };
    if (password === "")
      return { status: false, msg: "you must enter password" };
    if (confirmPassword === "")
      return { status: false, msg: "you must enter confirm password" };
    if (password !== confirmPassword)
      return { status: false, msg: "password doesnt match" };
    if (!validPhone.test(phone))
      return { status: false, msg: "phone should contain 10 digits" };
    if (!validEmail.test(email))
      return { status: false, msg: "incorrect email" };

    return { status: true };
  };
  return (
    <div className="container">
      <Row>
        <Col md={6}>
          <img style={{ height: "100%" }} src={registerWorker} className="img-fluid" />
        </Col>
        <Col md={6}>
          <Form style={{ marginTop: "5%" }}>
            <FormGroup>
              <RegisterInputs
                name={"First Name:"}
                type={"text"}
                label={"firstName"}
                value={firstName}
                setInputValue={setFirstName}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Last Name:"}
                type={"text"}
                label={"lastName"}
                value={lastName}
                setInputValue={setLastName}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Email:"}
                type={"email"}
                label={"email"}
                value={email}
                setInputValue={setEmail}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Password:"}
                type={"password"}
                label={"password"}
                value={password}
                setInputValue={setPassword}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Confirm Password:"}
                type={"password"}
                label={"confirmPassword"}
                value={confirmPassword}
                setInputValue={setConfirmPassword}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Phone Number:"}
                type={"text"}
                label={"phoneNumber"}
                value={phone}
                setInputValue={setPhone}
              />
            </FormGroup>

            <div className="d-flex justify-content-end">
              <Button style={{ marginBottom: "10px", fontWeight: "bold" }} color="primary" onClick={handleSignUp} className="ml-auto">Register Representative </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
};



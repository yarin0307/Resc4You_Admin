import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import registerVolunteer from "../assets/registerVolunteer.png";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import SpecialtyCheckBox from "../Components/SpecialtyCheckBox";
import LanguageCheckBox from "../Components/LanguageCheckBox";
import ExpertGroupRadio from "../Components/ExpertGroupRadio";
import RegisterInputs from "../Components/RegisterInputs";
import { ToastContainer, toast } from "react-toastify";
import emailjs from "@emailjs/browser";

export default function RegisterVolunteerPage() {
  const apiLanguage = "api/Languages";
  const apiSpecialty = "api/Specialtys";
  const apiExpertGroup = "api/ExpertGroups";
  const apiVolunteer = "api/Volunteers";
  const apiVolunteerLanguages = "VolunteerPhone/";
  const apiVolunteerSpecialty = "VolunteerPhone/";
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [languageList, setLanguagesList] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [specialtyList, setSpecialtyList] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState([]);
  const [expertGroupList, setExpertGroupList] = useState([]);
  const [selectedExpertGroup, setSelectedExpertGroup] = useState(0);

  useEffect(() => {
    axios
      .get(apiLanguage)
      .then((res) => {
        setLanguagesList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get(apiSpecialty)
      .then((res) => {
        setSpecialtyList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    axios
      .get(apiExpertGroup)
      .then((res) => {
        setExpertGroupList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleLanguageChange = (languageId) => {
    const isChecked = selectedLanguages.includes(languageId);
    if (isChecked) {
      setSelectedLanguages(
        selectedLanguages.filter((lang) => lang !== languageId)
      );
    } else {
      setSelectedLanguages([...selectedLanguages, languageId]);
    }
  };
  const handleSpecialtyChange = (specialtyId) => {
    const isChecked = selectedSpecialty.includes(specialtyId);
    if (isChecked) {
      setSelectedSpecialty(
        selectedSpecialty.filter((spc) => spc !== specialtyId)
      );
    } else {
      setSelectedSpecialty([...selectedSpecialty, specialtyId]);
    }
  };
  function sendEmail() {
    const emailObject = {
      from_name: "Resc4You",
      to_name: `${firstName} ${lastName}`,
      to_email: email,
    };
    emailjs
      .send(
        process.env.REACT_APP_Service_ID,
        process.env.REACT_APP_Template_ID,
        emailObject,
        process.env.REACT_APP_USER_ID
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  }
  const handleSignUp = () => {
    const res = vaildVolunteerDetails();
    if (res.status) {
      const volunteer = {
        Phone: phone,
        FName: firstName,
        LName: lastName,
        Password: password,
        Email: email,
        AvilabilityStatus: false,
        HoursAvailable: 0,
        MinsAvailable: 0,
        VolunteerAddress: "",
        VolunteerLongitude: 0,
        VolunteerLatitude: 0,
        PressTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        ExpertId: selectedExpertGroup,
        PersonType: "V",
        Expo_push_token: "",
      };
      axios
        .post(apiVolunteer, volunteer)
        .then((res) => {
          for (let i = 0; i < selectedLanguages.length; i++) {
            axios
              .post(
                apiVolunteerLanguages +
                  phone +
                  "/VolunteerLanguageId/" +
                  selectedLanguages[i]
              )
              .then((res) => {
                selectedLanguages = [];
              })
              .catch((err) => {
                toast.error(err.response.data);
              });
          }
          for (let i = 0; i < selectedSpecialty.length; i++) {
            axios
              .post(
                apiVolunteerSpecialty +
                  phone +
                  "/VolunteerSpecialtyId/" +
                  selectedSpecialty[i]
              )
              .then((res) => {
                selectedSpecialty = [];
              })
              .catch((err) => {
                toast.error(err.response.data);
              });
          }
          toast.success("Volunteer registered successfully");
          sendEmail();
        })
        .catch((err) => {
          toast.error(err.response.data);
        });
    } else {
      toast.error(res.msg);
    }
  };
  const vaildVolunteerDetails = () => {
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
    if (selectedLanguages.every((value) => value === false))
      return { status: false, msg: "you have to choose at least one language" };
    if (selectedSpecialty.every((value) => value === false))
      return {
        status: false,
        msg: "you have to choose at least one specialty",
      };

    return { status: true };
  };
  return (
    <div className="container-fluid">
      <Row>
        <Col md={6}>
          <img
            style={{ height: "100%" }}
            src={registerVolunteer}
            className="img-fluid"
          />
        </Col>
        <Col md={6}>
          <Form>
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
            <FormGroup>
              <Label style={{ fontWeight: "bold" }} for="language">
                Language:
              </Label>
              <br />
              <LanguageCheckBox
                languageList={languageList}
                selectedLanguages={selectedLanguages}
                handleLanguageChange={handleLanguageChange}
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: "bold" }} for="specialty">
                Specialty:
              </Label>
              <br />
              <SpecialtyCheckBox
                specialtyList={specialtyList}
                selectedSpecialty={selectedSpecialty}
                handleSpecialtyChange={handleSpecialtyChange}
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: "bold" }} for="expert">
                Expert Group:
              </Label>
              <ExpertGroupRadio
                expertGroupList={expertGroupList}
                selectedExpertGroup={selectedExpertGroup}
                setSelectedExpertGroup={setSelectedExpertGroup}
              />
            </FormGroup>
            <div className="d-flex justify-content-end">
              <Button
                style={{ marginBottom: "10px", fontWeight: "bold" }}
                color="primary"
                onClick={handleSignUp}
                className="ml-auto"
              >
                Register Volunteer
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
}

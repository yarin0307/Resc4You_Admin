import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import updateVolunteer from '../assets/updateVolunteer.png';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import SpecialtyCheckBox from '../Components/SpecialtyCheckBox';
import LanguageCheckBox from '../Components/LanguageCheckBox';
import ExpertGroupRadio from '../Components/ExpertGroupRadio';
import RegisterInputs from '../Components/RegisterInputs';
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from 'react-router-dom';


export default function UpdateDetailsVolunteerPage() {
    const apiLanguage = "api/Languages"
    const apiSpecialty = "api/Specialtys"
    const apiExpertGroup = "api/ExpertGroups"
    const apiVolunteer = "api/Volunteers"
    const apiVolunteerLanguages = "VolunteerPhone/"
    const apiVolunteerSpecialty = "VolunteerPhone/"
    const apiSelectedLanguages = "api/Languages/"
    const apiSelectedSpecialty = "api/Specialtys/"
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
    const location = useLocation();


    useEffect(() => {//bring all languages from db
        axios
            .get(apiLanguage)
            .then((res) => {
                setLanguagesList(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

    }, [])

    useEffect(() => {//bring all specialty from db
        axios
            .get(apiSpecialty)
            .then((res) => {
                setSpecialtyList(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

    }, [])


    useEffect(() => {//bring all expertGroup from db
        axios
            .get(apiExpertGroup)
            .then((res) => {
                setExpertGroupList(res.data);
                const exp = res.data.filter((exp) => exp.expertGroupName === location.state.expert);
                setSelectedExpertGroup(exp[0].expertGroupId);
            })
            .catch((err) => {
                console.log(err);
            });

    }, [])

    useEffect(() => {//set volunteer inputs from location state
        if (location.state) {
            setFirstName(location.state.fName);
            setLastName(location.state.lName);
            setEmail(location.state.email);
            setPhone(location.state.phone);
        }
    }, [])

    useEffect(() => {//set volunteer languages from db only after the phone set
        axios
            .get(apiSelectedLanguages + phone)
            .then((res) => {
                const tmp = res.data.map(lang => lang.languageId);//get only the id from the object
                setSelectedLanguages(tmp);
            })
            .catch((err) => {
                toast.error(err.response.data);
            });
        return () => {
            setSelectedLanguages([]);
        };
    }, [phone]);


    useEffect(() => {//set volunteer specialty from db only after the phone set
        axios
            .get(apiSelectedSpecialty + phone)
            .then((res) => {
                const tmp = res.data.map(spc => spc.specialtyId);//get only the id from the object
                setSelectedSpecialty(tmp);
            })
            .catch((err) => {
                toast.error(err.response.data);
            });
        return () => {
            setSelectedSpecialty([]);
        };
    }, [phone]);



    const handleLanguageChange = (languageId) => {

        const isChecked = selectedLanguages.includes(languageId);
        if (isChecked) {
            setSelectedLanguages(selectedLanguages.filter((lang) => lang !== languageId));
        } else {
            setSelectedLanguages([...selectedLanguages, languageId]);
        }
    };

    const handleSpecialtyChange = (specialtyId) => {

        const isChecked = selectedSpecialty.includes(specialtyId);
        if (isChecked) {
            setSelectedSpecialty(selectedSpecialty.filter((spc) => spc !== specialtyId));
        } else {
            setSelectedSpecialty([...selectedSpecialty, specialtyId]);
        }
    };

    const handleUpdateDetails = () => {
        console.log("update details");
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
                Expo_push_token: ""
            };
            axios
                .put(apiVolunteer, volunteer)//update volunteer details in db
                .then((res) => {
                    axios
                        .delete(apiLanguage + "/" + phone)//delete all volunteer languages from db
                        .then((res) => {
                            for (let i = 0; i < selectedLanguages.length; i++) {//add all selected languages to db
                                axios
                                    .post(apiVolunteerLanguages + phone + "/VolunteerLanguageId/" + selectedLanguages[i])
                                    .then((res) => {
                                        selectedLanguages = [];
                                    })
                                    .catch((err) => {
                                        toast.error(err.response.data)
                                    });
                            }
                            axios
                                .delete(apiSpecialty + "/" + phone)//delete all volunteer specialty from db
                                .then((res) => {
                                    for (let i = 0; i < selectedSpecialty.length; i++) {//add all selected specialty to db
                                        axios
                                            .post(apiVolunteerSpecialty + phone + "/VolunteerSpecialtyId/" + selectedSpecialty[i])
                                            .then((res) => {
                                                selectedSpecialty = [];
                                            })
                                            .catch((err) => {
                                                toast.error(err.response.data)
                                            });
                                    }
                                })
                                .catch((err) => {
                                    toast.error(err.response.data)
                                });
                        })
                        .catch((err) => {
                            toast.error(err.response.data)
                        });
                })
                .catch((err) => {
                    toast.error(err.response.data)
                });
            toast.success("Details updated successfully");
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
                    <img style={{ height: "100%" }} src={updateVolunteer} className="img-fluid" />
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
                            <div>
                                <Label style={{ fontWeight: "bold" }} for="phoneNumber">{"Phone Number:"}</Label>
                                <Input
                                    type="text"
                                    name="phoneNumber"
                                    readOnly={true}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{ backgroundColor: "lightgrey" }}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label style={{ fontWeight: "bold" }} for="language">Language:</Label><br />
                            <LanguageCheckBox
                                languageList={languageList}
                                selectedLanguages={selectedLanguages}
                                handleLanguageChange={handleLanguageChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label style={{ fontWeight: "bold" }} for="specialty">Specialty:</Label><br />
                            <SpecialtyCheckBox
                                specialtyList={specialtyList}
                                selectedSpecialty={selectedSpecialty}
                                handleSpecialtyChange={handleSpecialtyChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label style={{ fontWeight: "bold" }} for="expert">Expert Group:</Label>
                            <ExpertGroupRadio
                                expertGroupList={expertGroupList}
                                selectedExpertGroup={selectedExpertGroup}
                                setSelectedExpertGroup={setSelectedExpertGroup}
                            />
                        </FormGroup>
                        <div className="d-flex justify-content-end">
                            <Button style={{ marginBottom: "10px", fontWeight: "bold" }} color="primary" onClick={handleUpdateDetails} className="ml-auto">Update Details</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
            <ToastContainer />
        </div>
    );
};



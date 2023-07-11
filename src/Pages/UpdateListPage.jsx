import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { Spinner } from "react-bootstrap";
import { useContext } from "react";
import { KMContext } from "../Context/KMProvider";
const apiTypes = "api/Specialtys";
const apiCars = "api/Manufacturers";
const apiChangeActive = "UpdateSpecialtyActive/";
const apiInsertSpecialty = "insertNewSpecialty";
const apiInsertCar = "insertNewManufacturer";
const apiKm = "api/KMs";

const UpdateListPage = () => {
  const { km, setKm } = useContext(KMContext);
  const [carType, setCarType] = useState([]);
  const [dataCarType, setDataCarType] = useState([]);
  const [requestType, setRequestType] = useState([]);
  const [dataRequestType, setDataRequestType] = useState([]);
  const [filterTextCarType, setFilterTextCarType] = useState("");
  const [filterTextRequestType, setFilterRequestType] = useState("");
  const [newCarType, setNewCarType] = useState("");
  const [newRequestType, setNewRequestType] = useState("");
  const [loadingCarType, setLoadingCarType] = useState(true);
  const [loadingRequestType, setLoadingRequestType] = useState(true);
  const [distance, setDistance] = useState();

  useEffect(() => {
    axios
      .get(apiTypes)
      .then((res) => {
        setRequestType(res.data);
        setDataRequestType(res.data);
        setLoadingRequestType(false);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });

    return () => {};
  }, []);

  useEffect(() => {
    axios
      .get(apiCars)
      .then((res) => {
        setCarType(res.data);
        setDataCarType(res.data);
        setLoadingCarType(false);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });

    return () => {};
  }, []);

  const handleFilterCarType = (e) => {
    const value = e.target.value || "";
    setFilterTextCarType(value);
    const lowercasedValue = value.toLowerCase().trim();
    const filteredData = dataCarType.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toString().toLowerCase().includes(lowercasedValue)
      );
    });
    setCarType(filteredData);
  };

  const handleAddCarType = () => {
    const CarType = {
      ManufacturerId: 0,
      ManufacturerName: newCarType,
    };
    axios
      .post(apiInsertCar, CarType)
      .then((res) => {
        toast.success("Car Type Added Successfully");
        refreshTable();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };
  const handleAddRequestType = () => {
    const RequestType = {
      SpecialtyId: 0,
      SpecialtyName: newRequestType,
      SpecialtyIcon: "",
      IsActive: true,
    };

    axios
      .post(apiInsertSpecialty, RequestType)
      .then((res) => {
        toast.success("Request Type Added Successfully");
        refreshTable();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const handleFilterRequestType = (e) => {
    const value = e.target.value || "";
    setFilterRequestType(value);
    const lowercasedValue = value.toLowerCase().trim();
    const filteredData = dataRequestType.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toString().toLowerCase().includes(lowercasedValue)
      );
    });
    setRequestType(filteredData);
  };

  const handleActive = (rowData) => {
    axios
      .put(
        apiChangeActive + rowData.specialtyId + "/status/" + !rowData.isActive
      )
      .then((res) => {
        toast.success("Request Type Updated Successfully");
        refreshTable();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const handleKMRange = () => {
    setKm(distance);
    const Range = {
      Distance: distance,
    };
    axios
      .put(apiKm, Range)
      .then((response) => {
        toast.success("KM Range Updated Successfully");
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  };

  const refreshTable = () => {
    setLoadingRequestType(true);
    axios
      .get(apiTypes)
      .then((res) => {
        setRequestType(res.data);
        setDataRequestType(res.data);
        setLoadingRequestType(false);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const ActionCarTypeBodyTemplate = (rowData) => {
    return (
      <div className="actions">
        <InputSwitch
          checked={rowData.isActive}
          onChange={(e) => handleActive(rowData)}
        />
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col sm={6}>
          <Card style={{ marginTop: "1%" }}>
            <Card.Header style={{ textAlign: "center", fontWeight: "bold" }}>
              Request Type
            </Card.Header>
            <Card.Body>
              <Row>
                <div className="col-3 mb-3">
                  <input
                    type="text"
                    onChange={handleFilterRequestType}
                    value={filterTextRequestType}
                    placeholder="Search"
                    className="form-control"
                  />
                </div>
                <div className="col-4 mb-3">
                  <input
                    type="text"
                    onChange={(e) => setNewRequestType(e.target.value)}
                    value={newRequestType}
                    placeholder="Enter New Request Type"
                    className="form-control"
                  />
                </div>
                <div className="col-3 mb-3">
                  <input
                    type="button"
                    className="btn btn-primary"
                    value="Add Type"
                    onClick={handleAddRequestType}
                  />
                </div>
              </Row>
              <Row>
                <Col>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {loadingRequestType ? (
                      <Spinner animation="border" variant="primary" />
                    ) : (
                      <DataTable
                        value={requestType}
                        rowHover
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        rows={5}
                        responsiveLayout="stack"
                        breakpoint="960px"
                        style={{ fontSize: "14px" }}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                      >
                        <Column
                          field="specialtyName"
                          sortable
                          sortField="specialtyName"
                          header="Specialty Name"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                        <Column
                          header="Actions"
                          body={ActionCarTypeBodyTemplate}
                          style={{ textAlign: "center", width: "5%" }}
                        />
                      </DataTable>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6}>
          <Card style={{ marginTop: "1%" }}>
            <Card.Header style={{ textAlign: "center", fontWeight: "bold" }}>
              Car Type
            </Card.Header>
            <Card.Body>
              <Row>
                <div className="col-3 mb-3">
                  <input
                    type="text"
                    onChange={handleFilterCarType}
                    value={filterTextCarType}
                    placeholder="Search"
                    className="form-control"
                  />
                </div>
                <div className="col-4 mb-3">
                  <input
                    type="text"
                    onChange={(e) => setNewCarType(e.target.value)}
                    value={newCarType}
                    placeholder="Enter New Car Type"
                    className="form-control"
                  />
                </div>
                <div className="col-3 mb-3">
                  <input
                    type="button"
                    className="btn btn-primary"
                    value="Add Type"
                    onClick={handleAddCarType}
                  />
                </div>
              </Row>
              <Row>
                <Col>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {loadingCarType ? (
                      <Spinner animation="border" variant="primary" />
                    ) : (
                      <DataTable
                        value={carType}
                        rowHover
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        rows={5}
                        responsiveLayout="stack"
                        breakpoint="960px"
                        style={{ fontSize: "14px" }}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                      >
                        <Column
                          field="manufacturerName"
                          sortable
                          sortField="manufacturerName"
                          header="Manufacturer Name"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                      </DataTable>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Card style={{ marginTop: "1%" }}>
            <Card.Header style={{ textAlign: "center", fontWeight: "bold" }}>
              Current Range: {km} KM
            </Card.Header>
            <Card.Body>
              <Row>
                <div className="col-4 mb-3">
                  <input
                    type="number"
                    onChange={(e) => setDistance(e.target.value)}
                    value={distance}
                    placeholder="Enter KM Range"
                    className="form-control"
                    min="5"
                  />
                </div>
                <div className="col-3 mb-3">
                  <input
                    type="button"
                    className="btn btn-primary"
                    value="Change KM Range"
                    onClick={handleKMRange}
                  />
                </div>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
};

export default UpdateListPage;

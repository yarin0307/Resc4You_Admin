import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import SelectInput from "../Components/SelectInput";
import { InputSwitch } from "primereact/inputswitch";
import { ProgressSpinner } from "primereact/progressspinner";
import { Spinner } from "react-bootstrap";

export default function VolunteerPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [requestTypeList, setRequestTypeList] = useState([]);
  const [availablityList, setAvailablityList] = useState([
    "Available",
    "Not Available",
  ]);
  const [expertiseList, setExpertiseList] = useState([]);
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [selectedAvilablity, setSelectedAvilablity] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const volunteerApi = "GetVolunteerData";
  const requestTypeApi = "api/Specialtys ";
  const expertAPI = "api/ExpertGroups";
  const updateActiveApi = "UpdateIsActive/";

  useEffect(() => {
    axios
      .get(volunteerApi)
      .then((res) => {
        setVolunteers(res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

  useEffect(() => {
    axios
      .get(requestTypeApi)
      .then((res) => {
        const requestTypes = res.data.map(
          (requestType) => requestType.specialtyName
        );
        setRequestTypeList(requestTypes);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

  useEffect(() => {
    axios
      .get(expertAPI)
      .then((res) => {
        const expertises = res.data.map(
          (expertise) => expertise.expertGroupName
        );
        setExpertiseList(expertises);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

  const handleFilter = (e) => {
    const value = e.target.value || "";
    setFilterText(value);
    const lowercasedValue = value.toLowerCase().trim();
    const filteredData = data.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toString().toLowerCase().includes(lowercasedValue)
      );
    });
    setVolunteers(filteredData);
  };

  const editVolunteer = (volunteer) => {
    navigate("/updateDetailsVolunteer", { state: volunteer });
  };

  const handleRequestType = (value) => {
    setSelectedRequestType(value);
  };
  const handleAvailability = (value) => {
    setSelectedAvilablity(value);
  };
  const handleExpertise = (value) => {
    setSelectedExpertise(value);
  };

  const AvailabilityStatusBodyTemplate = (rowData) => {
    let classColor;
    switch (rowData.avilablity) {
      case "Available":
        classColor = "btn btn-success";
        break;
      default:
        classColor = "btn btn-danger";
    }
    return (
      <div
        className={classColor}
        style={{ cursor: "default", fontSize: "0.8em" }}
      >
        {rowData.avilablity}
      </div>
    );
  };
  const handleActive = (rowData) => {
    axios
      .put(updateActiveApi + rowData.phone + "/status/" + !rowData.isActive)
      .then((res) => {
        toast.success("Status Updated Successfully");
        refreshTable();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const ActionsBodyTemplate = (rowData) => {
    return (
      <div className="actions">
        <button className="btn mr-2" onClick={() => editVolunteer(rowData)}>
          <FaPencilAlt />
        </button>
        <InputSwitch
          checked={rowData.isActive}
          onChange={(e) => handleActive(rowData)}
        />
      </div>
    );
  };
  const SpecialtiesBodyTemplate = (rowData) => {
    const specialties = rowData.specialties.split(",");
    return specialties.map((specialty, index) => {
      return (
        <div key={`${rowData.phone}-${index}`} style={{ margin: "2%" }}>
          <Tag className="p-mr-2" severity="warning" value={specialty}></Tag>
        </div>
      );
    });
  };

  const filterInputs = () => {
    let filteredData = [...data];
    if (selectedAvilablity) {
      filteredData = filteredData.filter(
        (row) => row.avilablity === selectedAvilablity
      );
    }
    if (selectedRequestType) {
      filteredData = filteredData.filter((row) =>
        row.specialties.includes(selectedRequestType)
      );
    }
    if (selectedExpertise) {
      filteredData = filteredData.filter(
        (row) => row.expert === selectedExpertise
      );
    }

    setVolunteers(filteredData);
  };

  const refreshTable = () => {
    setLoading(true);
    axios
      .get(volunteerApi)
      .then((res) => {
        setVolunteers(res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAsExcelFile(excelBuffer, "Volunteers");
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    let EXCEL_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    let EXCEL_EXTENSION = ".xlsx";
    const data = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    saveAs(
      data,
      fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
    );
  };

  const header = (
    <div
      style={{ display: "flex", justifyContent: "flex-end" }}
      className="table-header"
    >
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
          fontSize: "30px",
        }}
      >
        Volunteers
      </span>{" "}
      {/* added flex property */}
      <Button
        style={{ backgroundColor: "#0d6efd" }}
        icon="pi pi-refresh"
        onClick={refreshTable}
      />
      <span style={{ marginLeft: "10px" }}></span>
      <Button
        type="button"
        icon="pi pi-file-excel"
        onClick={exportExcel}
        className="p-button-success p-mr-2"
        data-pr-tooltip="XLS"
      />
    </div>
  );

  return (
    <div className="container" style={{ fontSize: "1em", textAlign: "center" }}>
      <div
        className="row justify"
        style={{ marginTop: "4%", display: "flex", justifyContent: "end" }}
      >
        <div className="col-md-3 mb-3">
          <SelectInput
            type="Request Type"
            list={requestTypeList}
            setRequestType={handleRequestType}
          />
        </div>

        <div className="col-md-3 mb-3">
          <SelectInput
            type="expertise"
            list={expertiseList}
            setexpertise={handleExpertise}
          />
        </div>

        <div className="col-md-2 mb-3">
          <SelectInput
            type="Availability"
            list={availablityList}
            setAvailablity={handleAvailability}
          />
        </div>

        <div className="col-md-3 mb-3">
          <input
            type="text"
            onChange={handleFilter}
            value={filterText}
            placeholder="Search"
            className="form-control"
          />
        </div>
        <div className="col-md-1 mb-2">
          <button className="btn btn-primary" onClick={filterInputs}>
            <FaSearch />
          </button>
        </div>
      </div>
      <div className="row justify">
        <div
          className="col-12"
          style={{ display: "flex", justifyContent: "end" }}
        >
          <input
            style={{ marginBottom: "2%" }}
            type="button"
            value="Register New Volunteer"
            className="btn btn-primary"
            onClick={() => navigate("/registerVolunteer")}
          />
        </div>
      </div>
      <div>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            value={volunteers}
            header={header}
            rowHover
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 25, 50]}
            rows={10}
            responsiveLayout="stack"
            breakpoint="960px"
            style={{ fontSize: "14px" }}
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              field="fName"
              sortable
              sortField="fName"
              header="First Name"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="lName"
              sortable
              sortField="lName"
              header="Last Name"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="phone"
              sortable
              sortField="phone"
              header="Phone"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="email"
              sortable
              sortField="email"
              header="Email"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="avilablity"
              body={AvailabilityStatusBodyTemplate}
              sortable
              sortField="avilablity"
              header="Avilability Status"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="expert"
              sortable
              sortField="expert"
              header="Expert Group"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="specialties"
              body={SpecialtiesBodyTemplate}
              sortable
              sortField="specialties"
              header="Specialties"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              header="Actions"
              body={ActionsBodyTemplate}
              style={{ textAlign: "center", width: "5%" }}
            />
          </DataTable>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import SelectInput from "../Components/SelectInput";
import DateInput from "../Components/DateInput";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";
import { Spinner } from "react-bootstrap";
import StatusModal from "../Components/StatusModal";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [voluteerlist, setVolunteerList] = useState([]);
  const [requestTypeList, setRequestTypeList] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState({});

  const app = initializeApp(firebaseConfig);
  const navigate = useNavigate();
  const requestsApi = "GetAllRequestForAdmin";
  const volunteerApi = "api/Volunteers";
  const requestTypeApi = "api/Specialtys ";
  const cancelRequestApi = "api/Citizens/";

  function deleteFromFirebase(requestId) {
    const db = getDatabase(app);
    const r = remove(ref(db, "Requests/" + requestId));
  }

  useEffect(() => {
    axios
      .get(requestsApi)
      .then((res) => {
        console.log(res.data);
        setRequests(res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

  useEffect(() => {
    axios
      .get(volunteerApi)
      .then((res) => {
        setVolunteerList(res.data);
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
        console.log(requestTypes);
        setRequestTypeList(requestTypes);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

  const handleFilter = (e) => {
    console.log(data);
    const value = e.target.value || "";
    setFilterText(value);
    console.log(value);
    const lowercasedValue = value.toLowerCase().trim();
    console.log(lowercasedValue);
    const filteredData = data.filter((item) => {
      return Object.keys(item).some((key) => {
        const propertyValue = item[key];
        if (propertyValue !== null && propertyValue !== undefined) {
          return propertyValue
            .toString()
            .toLowerCase()
            .includes(lowercasedValue);
        }
        return false;
      });
    });
    setRequests(filteredData);
  };

  const cancelRequest = (requestId, requestStatus) => {
    if (requestStatus === "In Progress") {
      axios
        .post("SendCancelNotificationsForVolunteerFromWeb/" + requestId)
        .then((res) => {
          toast.success("Cancel notification sent successfully");
        })
        .catch((err) => {
          toast.error("There was an error sending the cancel notification");
        });
    }
    axios
      .delete(cancelRequestApi + `${requestId}`)
      .then((res) => {
        toast.success("Request canceled successfully");
        deleteFromFirebase(requestId);
        setRequests(
          requests.filter((request) => request.requestId !== requestId)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const editRequest = (request) => {
    navigate("/editRequest", { state: request });
  };

  const handleSelectedVolunteer = (value) => {
    setSelectedVolunteer(value);
  };

  const handleRequestType = (value) => {
    setSelectedRequestType(value);
  };

  const handleStartDate = (value) => {
    setSelectedStartDate(value);
  };

  const handleEndDate = (value) => {
    setSelectedEndDate(value);
  };
  const DateBodyTemplate = (rowData) => {
    return new Date(rowData.requestDate).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatusBodyTemplate = (rowData) => {
    let classColor;
    switch (rowData.requestStatus) {
      case "Waiting":
        classColor = "btn btn-success";
        break;
      case "In Progress":
        classColor = "btn btn-warning";
        break;
      default:
        classColor = "btn btn-danger";
    }
    return (
      <div
        className={classColor}
        style={{ cursor: "default", fontSize: "0.8em" }}
      >
        {rowData.requestStatus}
      </div>
    );
  };
  const AddressBodyTemplate = (rowData) => {
    return (
      <div style={{ position: "relative", textAlign: "center" }}>
        <span>{rowData.requestAddress}</span>
        <FaMapMarkerAlt
          style={{
            position: "absolute",
            right: "-20px",
            color: "navy",
            cursor: "pointer",
          }}
          onClick={() =>
            window.open(
              `https://www.google.com/maps?q=${encodeURIComponent(
                rowData.requestAddress
              )}`,
              "_blank"
            )
          }
        />
      </div>
    );
  };
  const ActionsBodyTemplate = (rowData) => {
    if (rowData.requestStatus !== "Closed") {
      return (
        <div className="actions">
          <button className="btn mr-2" onClick={() => editRequest(rowData)}>
            <FaPencilAlt />
          </button>
          <button
            className="btn"
            onClick={() =>
              cancelRequest(rowData.requestId, rowData.requestStatus)
            }
          >
            <FaTimes />
          </button>
          <button
            className="btn mr-2"
            onClick={() => handleRequestStatus(rowData)}
          >
            <FaInfoCircle />
          </button>
        </div>
      );
    }
    return null;
  };

  const handleRequestStatus = (request) => {
    //navigate("/request-status-a", { state: request });
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const filterInputs = () => {
    if (selectedEndDate < selectedStartDate) {
      toast.error("End date cannot be smaller than start date");
      //alert("End date cannot be smaller than start date");
      return;
    }

    let filteredData = [...data];
    if (selectedVolunteer) {
      filteredData = filteredData.filter(
        (row) => row.volunteerName === selectedVolunteer
      );
    }
    if (selectedRequestType) {
      filteredData = filteredData.filter(
        (row) => row.requestType === selectedRequestType
      );
    }
    if (selectedStartDate && selectedEndDate) {
      filteredData = filteredData.filter((row) => {
        const requestDateUTC = new Date(row.requestDate)
          .toISOString()
          .substring(0, 10);
        const startDateUTC = new Date(selectedStartDate)
          .toISOString()
          .substring(0, 10);
        const endDateUTC = new Date(selectedEndDate)
          .toISOString()
          .substring(0, 10);
        return requestDateUTC >= startDateUTC && requestDateUTC <= endDateUTC;
      });
    }
    setRequests(filteredData);
  };

  const refreshTable = () => {
    setLoading(true);
    axios
      .get(requestsApi)
      .then((res) => {
        setRequests(res.data);
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
      saveAsExcelFile(excelBuffer, "Requests");
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
        Requests
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
      <div className="row justify" style={{ marginTop: "4%" }}>
        <div className="col-md-2 mb-3">
          <SelectInput
            type="Volunteer"
            list={voluteerlist}
            setVolunteer={handleSelectedVolunteer}
          />
        </div>
        <div className="col-md-2 mb-3">
          <SelectInput
            type="Request Type"
            list={requestTypeList}
            setRequestType={handleRequestType}
          />
        </div>
        <div className="col-md-2 mb-3">
          <DateInput type="startDate" setStartDate={handleStartDate} />
        </div>
        <div className="col-md-2 mb-3">
          <DateInput type="endDate" setEndDate={handleEndDate} />
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
        <div className="col-md-1 mb-3">
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
            value="Create New Request"
            className="btn btn-primary"
            onClick={() => navigate("/new-request")}
          />
        </div>
      </div>

      <div>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            value={requests}
            header={header}
            rowHover
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 25, 50]}
            rows={10}
            responsiveLayout="stack"
            breakpoint="960px"
            style={{ fontSize: "13px" }}
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              field="requestId"
              sortable
              dataType="numeric"
              header="Request Id"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="requestType"
              sortable
              sortField="requestType"
              header="Request Type"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="citizen"
              sortable
              sortField="citizen"
              header="Citizen"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="requestDate"
              body={DateBodyTemplate}
              sortable
              filterField="requestDate"
              header="Request Date"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="requestAddress"
              body={AddressBodyTemplate}
              sortable
              filterField="requestAddress"
              header="Request Address"
              style={{ textAlign: "center", width: "20%" }}
            />
            <Column
              field="requestStatus"
              body={StatusBodyTemplate}
              sortable
              filterField="requestStatus"
              header="Request Status"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              field="volunteerName"
              sortable
              filterField="volunteerName"
              header="Request Volunteer"
              style={{ textAlign: "center", width: "12.5%" }}
            />
            <Column
              header="Actions"
              body={ActionsBodyTemplate}
              style={{ textAlign: "center", width: "5%" }}
            />
          </DataTable>
        )}
        <StatusModal
          visible={isModalOpen}
          handleClose={handleCloseModal}
          request={selectedRequest}
        />
      </div>
      <ToastContainer />
    </div>
  );
}

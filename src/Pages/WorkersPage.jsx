import React, { useState, useEffect } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Spinner } from "react-bootstrap";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const workersApi = "GetWorkersDetails";
  const apiChangeActive = "UpdateWorkerActive/";

  useEffect(() => {
    axios
      .get(workersApi)
      .then((res) => {
        setWorkers(res.data);
        setData(res.data);
        setLoading(false);
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
    setWorkers(filteredData);
  };

  const editWorker = (worker) => {
    navigate("/updateDetailsWorker", { state: worker });
  };

  const handleActive = (rowData) => {
    axios
      .put(apiChangeActive + rowData.phone + "/status/" + !rowData.isActive)
      .then((res) => {
        toast.success("Updated Successfully");
        refreshTable();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const ActionsBodyTemplate = (rowData) => {
    return (
      <div className="actions">
        <button
          style={{ marginTop: "-10%" }}
          className="btn"
          onClick={() => editWorker(rowData)}
        >
          <FaPencilAlt />
        </button>
        <InputSwitch
          checked={rowData.isActive}
          onChange={(e) => handleActive(rowData)}
        />
      </div>
    );
  };

  const refreshTable = () => {
    setLoading(true);
    axios
      .get(workersApi)
      .then((res) => {
        setWorkers(res.data);
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
      saveAsExcelFile(excelBuffer, "Workers");
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
        Representatives
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
          <input
            type="text"
            onChange={handleFilter}
            value={filterText}
            placeholder="Search"
            className="form-control"
          />
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
            value="Register New Representative"
            className="btn btn-primary"
            onClick={() => navigate("/registerWorker")}
          />
        </div>
      </div>
      <div>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            value={workers}
            header={header}
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
              field="fName"
              sortable
              sortField="fName"
              header="First Name"
              style={{ textAlign: "center", width: "20%" }}
            />
            <Column
              field="lName"
              sortable
              sortField="lName"
              header="Last Name"
              style={{ textAlign: "center", width: "20%" }}
            />
            <Column
              field="phone"
              sortable
              sortField="phone"
              header="Phone"
              style={{ textAlign: "center", width: "20%" }}
            />
            <Column
              field="email"
              sortable
              sortField="email"
              header="Email"
              style={{ textAlign: "center", width: "20%" }}
            />
            <Column
              header="Actions"
              body={ActionsBodyTemplate}
              style={{ textAlign: "center", width: "20%" }}
            />
          </DataTable>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

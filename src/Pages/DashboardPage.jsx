import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import SelectInput from "../Components/SelectInput";
import DateInput from "../Components/DateInput";
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";
import { Chart } from "primereact/chart";
import Rating from "../Components/Rating";

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [requestsCount, setRequestsCount] = useState([]);
  const [pieLabels, setPieLabels] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [voluteerlist, setVolunteerList] = useState([]);
  const [requestTypeList, setRequestTypeList] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [numOfWatingRequests, setNumOfWatingRequests] = useState(0);
  const [numOfInProgressRequests, setNumOfInProgressRequests] = useState(0);
  const [citiesCount, setCitiesCount] = useState(new Map());
  const [barLabels, setBarLabels] = useState([]);
  const [barData, setBarData] = useState([]);
  const [bar, setBar] = useState({});
  const [barOptions, setBarOptions] = useState({});
  const [timeToPickupByVolunteer, setTimeToPickupByVolunteer] = useState(0);
  const [timeOpenToClose, setTimeOpenToClose] = useState(0);
  const [timeTakenToClose, setTimeTakenToClose] = useState(0);
  const [rating, setRating] = useState(0);

  const navigate = useNavigate();
  const requestsApi = "GetAllRequestForAdmin";
  const volunteerApi = "api/Volunteers";
  const requestTypeApi = "api/Specialtys ";

  useEffect(() => {
    axios
      .get(requestsApi)
      .then((res) => {
        setRequests(res.data);
        setData(res.data);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

  const colorArray = useMemo(() => {
    const colors = [];
    for (let i = 0; i < pieLabels.length; i++) {
      const color = `hsl(${i * 100}, 90%, 50%)`;
      colors.push(color);
    }
    return colors;
  }, [pieLabels]);

  const pieTypes = useMemo(() => {
    return {
      labels: pieLabels,
      datasets: [
        {
          data: pieData,
          backgroundColor: colorArray,
        },
      ],
    };
  }, [pieLabels, pieData, colorArray]);

  useEffect(() => {
    const requestCounts = requests.reduce((acc, curr) => {
      //acc represnt the accumulator and curr represent the current value
      if (acc[curr.requestType]) {
        //if the request type is already in the accumulator
        acc[curr.requestType]++;
      } else {
        acc[curr.requestType] = 1;
      }
      return acc;
    }, {});
    setRequestsCount(requestCounts);
    showNumOfWatingRequests();
    showNumOfInProgressRequests();
    handleTimeToPickupByVolunteer();
    handleTimeOpenToClose();
    handleTimetakenToClose();
    handleRating();
  }, [requests]);

  useEffect(() => {
    setPieLabels(Object.keys(requestsCount));
    setPieData(Object.values(requestsCount));
  }, [requestsCount]);

  useEffect(() => {
    const data = {
      labels: barLabels,
      datasets: [
        {
          label: "Requets",
          data: barData,
          backgroundColor: [
            "rgba(255, 159, 64, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(220, 99, 132, 0.2)",
          ],
          borderWidth: 1,
        },
      ],
    };
    const options = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
    setBar(data);
    setBarOptions(options);
  }, [barLabels, barData]);

  useEffect(() => {
    const cityNames = requests.map(async (address) => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address.requestAddress
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const city = data.results[0].address_components.find((component) =>
        component.types.includes("locality")
      );
      return city ? city.long_name : null;
    });
    Promise.all(cityNames).then((cities) => {
      const cityCounts = cities.reduce((counts, city) => {
        if (city) {
          counts.set(city, (counts.get(city) || 0) + 1);
        }
        return counts;
      }, new Map());

      // Sort the map by values in descending order
      const sortedCounts = [...cityCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      );

      // Extract the top 5 entries
      const top5Entries = sortedCounts.slice(0, 5);

      // Create a new map with the top 5 entries
      const top5Map = new Map(top5Entries);

      setCitiesCount(top5Map);
    });
  }, [requests]);

  useEffect(() => {
    setBarLabels(Array.from(citiesCount.keys()));
    setBarData(Array.from(citiesCount.values()));
  }, [citiesCount]);

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
        setRequestTypeList(requestTypes);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  }, []);

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

  const showNumOfWatingRequests = () => {
    const WatingRequests = requests.filter(
      (request) => request.requestStatus === "Waiting"
    ).length;
    setNumOfWatingRequests(WatingRequests);
  };

  const showNumOfInProgressRequests = () => {
    const InProgressRequests = requests.filter(
      (request) => request.requestStatus === "In Progress"
    ).length;
    setNumOfInProgressRequests(InProgressRequests);
  };
  const handleTimeToPickupByVolunteer = () => {
    let totalTime = 0;
    let count = 0;

    requests.forEach((request) => {
      if (request.takenRequestDate != null) {
        const requestDate = new Date(request.requestDate);
        const takenRequestDate = new Date(request.takenRequestDate);
        const timeToPickup = (takenRequestDate - requestDate) / (1000 * 60); // time difference in minutes
        totalTime += timeToPickup;
        count++;
      }
    });

    const averageTime = count > 0 ? Math.floor(totalTime / count) : 0;
    setTimeToPickupByVolunteer(averageTime);
  };

  const handleTimeOpenToClose = () => {
    let totalTime = 0;
    let count = 0;

    requests.forEach((request) => {
      if (request.closeRequestDate != null) {
        const requestDate = new Date(request.requestDate);
        const closeRequestDate = new Date(request.closeRequestDate);
        const timeOpenToClose = (closeRequestDate - requestDate) / (1000 * 60); // time difference in minutes
        totalTime += timeOpenToClose;
        count++;
      }
    });

    const averageTime = count > 0 ? Math.floor(totalTime / count) : 0;
    setTimeOpenToClose(averageTime);
  };
  const handleTimetakenToClose = () => {
    let totalTime = 0;
    let count = 0;

    requests.forEach((request) => {
      if (
        request.closeRequestDate != null &&
        request.takenRequestDate != null
      ) {
        const takenRequestDate = new Date(request.takenRequestDate);
        const closeRequestDate = new Date(request.closeRequestDate);
        const timeTakenToClose =
          (closeRequestDate - takenRequestDate) / (1000 * 60); // time difference in minutes
        totalTime += timeTakenToClose;
        count++;
      }
    });

    const averageTime = count > 0 ? Math.floor(totalTime / count) : 0;
    setTimeTakenToClose(averageTime);
  };

  const handleRating = () => {
    let totalRating = 0;
    let count = 0;
    requests.forEach((request) => {
      if (request.requestRating != null) {
        totalRating += request.requestRating;
        count++;
      }
    });

    const averageRating = count > 0 ? Math.round(totalRating / count) : 0;
    setRating(averageRating);
  };
  return (
    <div className="container" style={{ fontSize: "1em", textAlign: "center" }}>
      <div className="row justify" style={{ marginTop: "4%" }}>
        <Row>
          <div className="col-md-2 mb-3">
            <SelectInput
              type="Volunteer"
              list={voluteerlist}
              setVolunteer={handleSelectedVolunteer}
            />
          </div>
          <div className="col-md-3 mb-3">
            <SelectInput
              type="Request Type"
              list={requestTypeList}
              setRequestType={handleRequestType}
            />
          </div>
          <div className="col-md-3 mb-3">
            <DateInput type="startDate" setStartDate={handleStartDate} />
          </div>
          <div className="col-md-3 mb-3">
            <DateInput type="endDate" setEndDate={handleEndDate} />
          </div>
          <div className="col-md-1 mb-3">
            <button className="btn btn-primary" onClick={filterInputs}>
              <FaSearch />
            </button>
          </div>
        </Row>
        <Row>
          <div
            className="card col-md-5 mb-3"
            style={{
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              marginTop: "2%",
              marginBottom: "2%",
            }}
          >
            <h3>Waiting Requests</h3>
            <h4>{numOfWatingRequests}</h4>
          </div>
          <div className="col-md-2 mb-3"></div>
          <div
            className="card col-md-5 mb-3"
            style={{
              backgroundColor: "rgba(46, 204, 113, 0.2)",
              marginTop: "2%",
              marginBottom: "2%",
            }}
          >
            <h3>In Progress Requests</h3>
            <h4>{numOfInProgressRequests}</h4>
          </div>
        </Row>
        <Row>
          <div
            className="card col-md-5 mb-3"
            style={{
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              marginTop: "1%",
              marginBottom: "1%",
            }}
          >
            <h3>Time To Pickup By Volunteer</h3>
            <h4>{timeToPickupByVolunteer} Minutes</h4>
          </div>
          <div className="col-md-2 mb-3"></div>
          <div
            className="card col-md-5 mb-3"
            style={{
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              marginTop: "1%",
              marginBottom: "1%",
            }}
          >
            <h3>Request Duration From Open To Close</h3>
            <h4>{timeOpenToClose} Minutes</h4>
          </div>
        </Row>
        <Row>
          <div
            className="card col-md-5 mb-3"
            style={{
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              marginTop: "1%",
              marginBottom: "1%",
            }}
          >
            <h3>Request Pick-up To Closure Time</h3>
            <h4>{timeTakenToClose} Minutes</h4>
          </div>
          <div className="col-md-2 mb-3"></div>
          <Rating rating={rating} />
        </Row>
        <Row>
          <div
            className="col-md-6"
            style={{ height: "400px", marginTop: "5%" }}
          >
            <h1 style={{marginRight:"25%"}}>Divison Into Request</h1>
            <Chart
              style={{ width: "100%", height: "100%", marginTop: "2%" }}
              type="pie"
              data={pieTypes}
            />
          </div>

          <div
            className="col-md-6"
            style={{ height: "600px", marginTop: "5%" }}
          >
            <h1>Top 5 Locations</h1>
            <Chart
              style={{ width: "100%", height: "100%", marginTop: "2%" }}
              type="bar"
              data={bar}
            />
          </div>
        </Row>
      </div>
      <ToastContainer />
    </div>
  );
}

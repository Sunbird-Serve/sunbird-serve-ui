import React, { useEffect, useState, useMemo } from "react";
import "./Nominations.css";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import InfoIcon from "@mui/icons-material/Info";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DoneIcon from "@mui/icons-material/Done";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { TextField } from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const configData = require("../../configure.js");

// Function to format time without timezone conversion
const formatTime = (timeString) => {
  if (!timeString) return "";
  // Extract time portion from ISO string (HH:mm format)
  const timeMatch = timeString.match(/(\d{2}):(\d{2}):/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }
  return timeString;
};

// Function to create dayjs object from time string without timezone conversion
const createTimeFromString = (timeString) => {
  if (!timeString) return null;
  // Extract time portion from ISO string
  const timeMatch = timeString.match(/(\d{2}):(\d{2}):/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    // Create a dayjs object with today's date and the extracted time
    return dayjs().hour(hours).minute(minutes).second(0).millisecond(0);
  }
  return null;
};

const Nominations = ({ needData, openPopup }) => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isNAdmin = userRole?.[0] === "nAdmin" ? true : false;

  const [activeTab, setActiveTab] = useState("tabN");
  const [responseFlag, setResponseFlag] = useState(false);
  const [userSelectedTab, setUserSelectedTab] = useState(false); // Track if user manually selected a tab

  const [rejectPopup, setRejectPopup] = useState(false); //reject nomination
  const [acceptPopup, setAcceptPopup] = useState(false); //accept nomination
  //need to which nomination is done
  const needId = needData.need.id;
  //update nominations for the need
  const [nomsList, setNomsList] = useState([]);
  useEffect(() => {
    axios
      .get(`${configData.NEED_SEARCH}/${needId}/nominate`)
      .then((response) => {
        setNomsList(response.data);
      });
  }, [dispatch, activeTab, acceptPopup, rejectPopup, openPopup, responseFlag]);

  // Set default tab based on nomination status (only on initial load)
  useEffect(() => {
    if (nomsList.length > 0 && !userSelectedTab) {
      const hasAcceptedNominations = nomsList.some(item => item.nominationStatus === "Approved");
      if (hasAcceptedNominations && activeTab === "tabN") {
        setActiveTab("tabA");
      } else if (!hasAcceptedNominations && activeTab === "tabA") {
        setActiveTab("tabN");
      }
    }
  }, [nomsList, userSelectedTab]);

  // const nomsList = useSelector((state) => state.nominationbynid.data);
  //filter nominations as per active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setUserSelectedTab(true); // Mark that user has manually selected a tab
  };
  const [dataNoms, setDataNoms] = useState([]);
  useEffect(() => {
    if (activeTab === "tabA") {
      setDataNoms(
        nomsList.filter((item) => item.nominationStatus === "Approved")
      );
    } else if (activeTab === "tabR") {
      setDataNoms(
        nomsList.filter((item) => item.nominationStatus === "Rejected")
      );
    } else if (activeTab === "tabN") {
      setDataNoms(
        nomsList.filter((item) => item.nominationStatus === "Nominated")
      );
    }
  }, [activeTab, nomsList]);

  const [rowData, setRowData] = useState({});
  const [reason, setReason] = useState("");
  const [infoPopup, setInfoPopup] = useState(false);
  const [volunteerHistory, setVolunteerHistory] = useState([]);

  if (acceptPopup) {
    axios
      .post(
        `${configData.NOMINATION_CONFIRM}/${rowData.nominatedUserId}/confirm/${rowData.id}?status=Approved`
      )
      .then(function (response) {
        setResponseFlag(!responseFlag);
      }, openPopup("accept"))
      .catch(function (error) {
        console.log("error");
      });
    setAcceptPopup(false);
  }

  const confirmRejection = (rejectionStatus) => {
    axios
      .post(
        `${configData.NOMINATION_CONFIRM}/${rowData.nominatedUserId}/confirm/${rowData.id}?status=${rejectionStatus}`
      )
      .then(
        function (response) {
          setResponseFlag(!responseFlag);
        },
        openPopup("reject"),
        setRejectPopup(false),
        setReason("")
      )
      .catch(function (error) {
        console.log("error");
      });
  };

  const [gotoDelivs, setGotoDelivs] = useState(false);
  const [fulfillment, setFulfillment] = useState([]);

  const COLUMNS = [
    {
      Header: "Volunteer Name",
      accessor: "userInfo.identityDetails.fullname",
      width: 150,
    },
    { Header: "Location", accessor: "userInfo.contactDetails.address.city" },
    { Header: "Phone Number", accessor: "userInfo.contactDetails.mobile" },
    { Header: "Email", accessor: "userInfo.contactDetails.email" },
    { Header: "Status", accessor: "userInfo.status" },
  ];

  if (!isNAdmin || activeTab === "tabA") {
    COLUMNS.push({
      Header: "Actions",
      Cell: ({ row }) => {
        const handleAccept = () => {
          setRowData(row.original);
          setAcceptPopup(true);
        };
        const handleReject = () => {
          setRejectPopup(true);
          setRowData(row.original);
        };
        const handleInfo = () => {
          setRowData(row.original);
          setInfoPopup(true);
          // Fetch volunteer's nomination history
          axios
            .get(`${configData.SERVE_FULFILL}/nomination/${row.original.nominatedUserId}?page=0&size=10`)
            .then((response) => {
              const nominations = response.data;
              // Fetch entity names for each nomination through the chain: need → entity → entity name
              const fetchEntityNames = async () => {
                const nominationsWithEntities = await Promise.all(
                  nominations.map(async (nomination) => {
                    try {
                      // Step 1: Get need details to get entityId
                      const needResponse = await axios.get(`${configData.NEED_GET}/${nomination.needId}`);
                      
                      // Check if response is an array and has data
                      if (Array.isArray(needResponse.data) && needResponse.data.length > 0) {
                        const needData = needResponse.data[0];
                        const entityId = needData?.entityId;
                        
                        if (entityId) {
                          // Step 2: Get entity details to get entity name
                          const entityResponse = await axios.get(`${configData.ENTITY_GET}/${entityId}`);
                          
                          // Try different possible data structures for entity name
                          let entityName = 'Unknown Entity';
                          if (entityResponse.data) {
                            if (Array.isArray(entityResponse.data) && entityResponse.data.length > 0) {
                              entityName = entityResponse.data[0]?.name || entityResponse.data[0]?.entityName || 'Unknown Entity';
                            } else if (typeof entityResponse.data === 'object') {
                              entityName = entityResponse.data.name || entityResponse.data.entityName || entityResponse.data.title || 'Unknown Entity';
                            }
                          }
                          
                          return {
                            ...nomination,
                            entityName: entityName
                          };
                        } else {
                          return {
                            ...nomination,
                            entityName: 'Unknown Entity'
                          };
                        }
                      } else if (typeof needResponse.data === 'object' && needResponse.data !== null) {
                        // Handle direct object response
                        const needData = needResponse.data;
                        const entityId = needData?.entityId;
                        
                        if (entityId) {
                          // Step 2: Get entity details to get entity name
                          const entityResponse = await axios.get(`${configData.ENTITY_GET}/${entityId}`);
                          
                          // Try different possible data structures for entity name
                          let entityName = 'Unknown Entity';
                          if (entityResponse.data) {
                            if (Array.isArray(entityResponse.data) && entityResponse.data.length > 0) {
                              entityName = entityResponse.data[0]?.name || entityResponse.data[0]?.entityName || 'Unknown Entity';
                            } else if (typeof entityResponse.data === 'object') {
                              entityName = entityResponse.data.name || entityResponse.data.entityName || entityResponse.data.title || 'Unknown Entity';
                            }
                          }
                          
                          return {
                            ...nomination,
                            entityName: entityName
                          };
                        } else {
                          return {
                            ...nomination,
                            entityName: 'Unknown Entity'
                          };
                        }
                      } else {
                        return {
                          ...nomination,
                          entityName: 'Unknown Entity'
                        };
                      }
                    } catch (error) {
                      return {
                        ...nomination,
                        entityName: 'Unknown Entity'
                      };
                    }
                  })
                );
                setVolunteerHistory(nominationsWithEntities);
              };
              fetchEntityNames();
            })
            .catch((error) => {
              console.log("Error fetching volunteer history:", error);
              setVolunteerHistory([]);
            });
        };
        const viewDeliverable = () => {
          setRowData(row.original);
          axios
            .get(
              `${configData.SERVE_FULFILL}/fulfillment/volunteer-read/${row.original.nominatedUserId}?page=0&size=10`
            )
            .then((response) => {
              setFulfillment(response.data);
            })
            .catch((error) => {
              console.log("error");
            });
          setGotoDelivs(true);
        };

        return (
          <div className="actionsCell">
            {activeTab === "tabN" && !isNAdmin && (
              <>
                <button className="acceptNomin" onClick={handleAccept} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px", padding: "12px 20px", cursor: "pointer", fontSize: "16px", fontWeight: "500", minWidth: "120px", justifyContent: "center" }}>
                  <CheckIcon
                    style={{
                      height: "20px",
                      width: "20px",
                      color: "white",
                    }}
                  />
                  Confirm
                </button>
                <button className="rejectNomin" onClick={handleReject} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f44336", color: "white", border: "none", borderRadius: "6px", padding: "12px 20px", cursor: "pointer", fontSize: "16px", fontWeight: "500", minWidth: "120px", justifyContent: "center" }}>
                  <ClearIcon
                    style={{
                      height: "20px",
                      width: "20px",
                      color: "white",
                    }}
                  />
                  Reject
                </button>
                <button className="infoNomin" onClick={handleInfo} style={{ display: "flex", alignItems: "center", gap: "4px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", fontWeight: "500", minWidth: "80px", justifyContent: "center" }}>
                  <InfoIcon
                    style={{
                      height: "16px",
                      width: "16px",
                      color: "white",
                    }}
                  />
                  Info
                </button>
              </>
            )}
            {activeTab === "tabA" && (
              <div style={{ display: "flex", gap: "5px" }}>
                <button className="styled-button" onClick={viewDeliverable}>
                  View Deliverables
                </button>
                <button className="styled-button" onClick={handleReject}>
                  Drop Volunteer
                </button>
              </div>
            )}
          </div>
        );
      },
      width: 400,
    });
  }

  const columns = useMemo(() => COLUMNS, [activeTab]);

  const [planId, setPlanId] = useState("");
  const [deliverables, setDeliverables] = useState([]);
  const [inParas, setInParas] = useState([]);
  useEffect(() => {
    if (fulfillment.length > 0) {
      const selectedFulfil = fulfillment.filter(
        (item) => item.needId === rowData.needId
      )[0];
      if (selectedFulfil) {
        setPlanId(selectedFulfil.needPlanId);
      }
    }
  }, [fulfillment]);

  const [isSubmit, setIsSubmit] = useState(false);
  useEffect(() => {
    if (planId) {
      axios
        .get(`${configData.SERVE_NEED}/need-deliverable/${planId}`)
        .then((response) => {
          setDeliverables(response.data.needDeliverable);
          setInParas(response.data.inputParameters);
          if (response.data.inputParameters.length > 0) {
            setPlanData({
              planPlatform: "",
              planLink: "",
              planStartTime: response.data.inputParameters[0].startTime || "",
              planEndTime: response.data.inputParameters[0].endTime || "",
            });
          }
        })
        .catch((error) => {
          console.log("error");
        });
    }
  }, [planId, isSubmit]);

  const userList = useSelector((state) => state.userlist.data);
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    const nomDetails = dataNoms.map((nomination) => {
      const user = userList.find(
        (user) => user.osid === nomination.nominatedUserId
      );
      if (user) {
        return { ...nomination, userInfo: user };
      }
      return nomination;
    });
    setTableData(nomDetails);
  }, [dataNoms]);

  const data = useMemo(() => tableData, [tableData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    state,
    setGlobalFilter,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    prepareRow,
    setFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;
  const [filterValue, setFilterValue] = useState("");
  const currentDate = format(new Date(), "yyyy-MM-dd");

  const handleReason = (e) => {
    setReason(e.target.value);
  };

  const handleRowClick = (rowData) => {
    // setRowData(rowData);
    // setShowPopup(!showPopup);
  };

  const [editIndex, setEditIndex] = useState("");
  const handleEditDeliverable = (item, index) => {
    setEditIndex(index);
  };
  const handleDoneDeliverable = (index) => {
    // Validation: Check if required fields are filled
    const currentData = formData[index];
    
    // Check if status is selected
    if (!currentData.status || currentData.status === '') {
      alert('Please select a status');
      return;
    }
    
    // Check if comments are provided when status is Completed, Cancelled, or Offline
    if ((currentData.status === 'Completed' || currentData.status === 'Cancelled' || currentData.status === 'Offline') && 
        (!currentData.comments || currentData.comments.trim() === '')) {
      alert('Please provide comments for ' + currentData.status + ' status');
      return;
    }
    
    // Check if number of students is provided
    if (!currentData.numStudents || currentData.numStudents === '' || currentData.numStudents < 0) {
      alert('Please enter the number of students');
      return;
    }
    
    // If all validations pass, proceed with submission
    setEditIndex("");
    axios.put(
      `${configData.SERVE_NEED}/deliverable-details/update/${formData[index].deliverableId}`,
      {
        inputUrl: formData[index].inputUrl,
        softwarePlatform: formData[index].softwarePlatform,
        startTime: formData[index].startTime,
        endTime: formData[index].endTime,
      }
    );
    axios.post(`${configData.SERVE_NEED}/deliverable-output/create`, {
      needDeliverableId: formData[index].deliverableId,
      numberOfAttendees: formData[index].numStudents,
      submittedUrl: "",
      remarks: "",
    });
    axios
      .put(
        `${configData.NEEDPLAN_DELIVERABLES}/update/${formData[index].deliverableId}`,
        {
          needPlanId: planId,
          comments: formData[index].comments,
          status: formData[index].status,
          deliverableDate: formData[index].deliverableDate,
        }
      )
      .then((response) => {})
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const [formData, setFormData] = useState([]);

  useEffect(() => {
    const initialFormData = deliverables.map((item, index) => ({
      deliverableId: item.id,
      deliverableDate: item.deliverableDate,
      startTime: inParas[index]?.startTime || "",
      endTime: inParas[index]?.endTime || "",
      softwarePlatform: inParas[index]?.softwarePlatform || "",
      inputUrl: inParas[index]?.inputUrl || "",
      status: item.status,
      comments: item.comments,
      numStudents: item.numStudents || "",
    }));
    setFormData(initialFormData);
  }, [deliverables, inParas]);

  const handleDeliverableChange = (e, index, field) => {
    const { value } = e.target;
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      newFormData[index][field] = value;
      return newFormData;
    });
  };
  const [planData, setPlanData] = useState({
    planPlatform: "",
    planLink: "",
    planStartTime: inParas[0]?.startTime || "",
    planEndTime: inParas[0]?.endTime || "",
  });
  const { planPlatform, planLink, planStartTime, planEndTime } = planData;
  const handleComnInfo = (e) => {
    setPlanData({ ...planData, [e.target.name]: e.target.value });
  };
  const submitComnInfo = () => {
    axios
      .put(
        `${configData.SERVE_NEED}/all-deliverable-details/update/${planId}`,
        {
          inputUrl: planData.planLink,
          softwarePlatform: planData.planPlatform,
          startTime: planData.planStartTime,
          endTime: planData.planEndTime,
        }
      )
      .then((response) => {
        setIsSubmit(!isSubmit);
        setPlanData({ ...planData, planPlatform: "", planLink: "" });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div className="wrapNominations">
        {!gotoDelivs && (
          <div className="wrapTopbarNominations">
            <div className="topbarNominations">
              <div className="leftBarNomination">
                <div
                  className={`${activeTab === "tabN" ? "selectNomin" : ""}`}
                  onClick={() => handleTabClick("tabN")}
                >
                  Nominated
                </div>
                <div
                  className={`${activeTab === "tabA" ? "selectNomin" : ""}`}
                  onClick={() => handleTabClick("tabA")}
                >
                  Accepted
                </div>
                <div
                  className={`${activeTab === "tabR" ? "selectNomin" : ""}`}
                  onClick={() => handleTabClick("tabR")}
                >
                  Rejected
                </div>
              </div>
              <div className="rightBarNomination">
                <div className="search-filters-container">
                  <div className="boxSearchNomins">
                    <i>
                      <SearchIcon style={{ height: "18px", width: "18px" }} />
                    </i>
                    <input
                      type="search"
                      name="nsearch"
                      placeholder="Search"
                      value={globalFilter || ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                    ></input>
                  </div>
                  <div className="searchLocNomins">
                    <input
                      type="text"
                      placeholder="Location"
                      onChange={(e) => {
                        setFilter(
                          "userInfo.contactDetails.address.city",
                          e.target.value || undefined
                        );
                      }}
                    ></input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* table for reading list of nominations*/}
        {!gotoDelivs && (
          <div className="nominations-table-responsive">
            <table className="tableNominations">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.length > 0 ? (
                  page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        onClick={() => handleRowClick(row.original)}
                      >
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            style={{ width: cell.column.width }}
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: "center" }}>
                      No Data Available!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* reject pop-up */}
        {rejectPopup && (
          <div className="popupReject">
            <div className="rejectBox">
              <div className="rbTopBar">
                <span>
                  {activeTab === "tabA"
                    ? "Reason for Dropping"
                    : "Reason for Rejection"}
                </span>
                <button onClick={() => setRejectPopup(false)}>X</button>
              </div>
              <div className="rbNomin">
                <div className="nameRN">
                  {rowData.userInfo.identityDetails.fullname}
                </div>
                <div className="emailRN">
                  {rowData.userInfo.contactDetails.email}
                </div>
              </div>
              <div className="rejectReason">
                <label>Reason</label>
                <textarea
                  placeholder={`Write a reason for ${
                    activeTab === "tabA" ? "dropping" : "rejecting"
                  } the nominee`}
                  name="reason"
                  value={reason}
                  onChange={handleReason}
                />
              </div>
              <div className="wrapBtnsRN">
                <div
                  className="cancelBtnRN"
                  onClick={() => setRejectPopup(false)}
                >
                  Cancel
                </div>
                <div
                  className="confirmBtnRN"
                  onClick={() =>
                    confirmRejection(
                      activeTab === "tabA" ? "Backfill" : "Rejected"
                    )
                  }
                >
                  Confirm
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Popup */}
        {infoPopup && (
          <div className="wrap-popup">
            <div className="inwrap-popup">
              <div className="popup">
                <div className="topbar-popup">
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0080BC' }}>Nomination History</div>
                  <div>
                    <button
                      className="cancel-button"
                      onClick={() => setInfoPopup(false)}
                    >
                      <div className="close-popup">
                        <CloseIcon style={{ height: "20px" }} />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="info-content" style={{ padding: '24px', maxHeight: '500px', overflowY: 'auto' }}>
                  {volunteerHistory.length > 0 ? (
                    <div>
                      {(() => {
                        const backfilledCount = volunteerHistory.filter(nom => nom.nominationStatus === 'Backfill').length;
                        const approvedCount = volunteerHistory.filter(nom => nom.nominationStatus === 'Approved').length;
                        const rejectedCount = volunteerHistory.filter(nom => nom.nominationStatus === 'Rejected').length;
                        
                        return (
                          <>
                            <div style={{ 
                              marginBottom: '20px', 
                              padding: '16px', 
                              background: '#f8f9fa', 
                              borderRadius: '8px', 
                              border: '1px solid #e9ecef' 
                            }}>
                              <div style={{ 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                color: '#dc3545', 
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <div style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  borderRadius: '50%', 
                                  background: '#dc3545' 
                                }}></div>
                                Backfilled (Dropped): {backfilledCount} times
                              </div>
                              {backfilledCount > 0 && (
                                <div style={{ marginLeft: '20px' }}>
                                  {volunteerHistory
                                    .filter(nom => nom.nominationStatus === 'Backfill')
                                    .map((nom, index) => (
                                      <div key={index} style={{ 
                                        fontSize: '14px', 
                                        color: '#495057', 
                                        marginBottom: '6px',
                                        padding: '8px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6'
                                      }}>
                                        <strong>{nom.entityName}</strong>
                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                          Nominated: {nom.createdAt ? new Date(nom.createdAt).toLocaleDateString() : 'N/A'} | 
                                          Backfilled: {nom.updatedAt ? new Date(nom.updatedAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                            
                            <div style={{ 
                              marginBottom: '20px', 
                              padding: '16px', 
                              background: '#f8f9fa', 
                              borderRadius: '8px', 
                              border: '1px solid #e9ecef' 
                            }}>
                              <div style={{ 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                color: '#28a745', 
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <div style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  borderRadius: '50%', 
                                  background: '#28a745' 
                                }}></div>
                                Approved (Assigned): {approvedCount} times
                              </div>
                              {approvedCount > 0 && (
                                <div style={{ marginLeft: '20px' }}>
                                  {volunteerHistory
                                    .filter(nom => nom.nominationStatus === 'Approved')
                                    .map((nom, index) => (
                                      <div key={index} style={{ 
                                        fontSize: '14px', 
                                        color: '#495057', 
                                        marginBottom: '6px',
                                        padding: '8px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6'
                                      }}>
                                        <strong>{nom.entityName}</strong>
                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                          Nominated: {nom.createdAt ? new Date(nom.createdAt).toLocaleDateString() : 'N/A'} | 
                                          Approved: {nom.updatedAt ? new Date(nom.updatedAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                            
                            <div style={{ 
                              marginBottom: '20px', 
                              padding: '16px', 
                              background: '#f8f9fa', 
                              borderRadius: '8px', 
                              border: '1px solid #e9ecef' 
                            }}>
                              <div style={{ 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                color: '#ffc107', 
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <div style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  borderRadius: '50%', 
                                  background: '#ffc107' 
                                }}></div>
                                Rejected: {rejectedCount} times
                              </div>
                              {rejectedCount > 0 && (
                                <div style={{ marginLeft: '20px' }}>
                                  {volunteerHistory
                                    .filter(nom => nom.nominationStatus === 'Rejected')
                                    .map((nom, index) => (
                                      <div key={index} style={{ 
                                        fontSize: '14px', 
                                        color: '#495057', 
                                        marginBottom: '6px',
                                        padding: '8px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6'
                                      }}>
                                        <strong>{nom.entityName}</strong>
                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                          Nominated: {nom.createdAt ? new Date(nom.createdAt).toLocaleDateString() : 'N/A'} | 
                                          Rejected: {nom.updatedAt ? new Date(nom.updatedAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ 
                      color: '#6c757d', 
                      fontStyle: 'italic', 
                      textAlign: 'center',
                      padding: '40px 20px',
                      fontSize: '16px'
                    }}>
                      No nomination history found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

          {/*  */}
          {gotoDelivs && (
            <div className="wrap-NCDeliverables">
              <div className="backToNoms" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 20, color: '#0080BC', marginBottom: 2 }}>Need Deliverables</span>
                  {rowData?.userInfo && (() => {
                    const schoolName = rowData.userInfo.genericDetails?.affiliation || rowData.userInfo.genericDetails?.schoolName || rowData.userInfo.genericDetails?.school || rowData.userInfo.affiliation || null;
                    return schoolName ? (
                      <span style={{ fontWeight: 500, fontSize: 15, color: '#555', marginBottom: 2 }}>School: <b>{schoolName}</b></span>
                    ) : null;
                  })()}
                </div>
                <button
                  aria-label="Back to Nominations"
                  title="Back to Nominations"
                  style={{ marginLeft: 'auto', fontSize: 18, background: '#0080BC', color: 'white', borderRadius: '50%', width: 40, height: 40, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setGotoDelivs(false)}
                >
                  <ArrowBackIcon />
                </button>
              </div>
              <div className="table-NCDeliverables">
                <div className="common-info-section" style={{ background: '#f4faff', border: '1.5px solid #0080BC', borderRadius: 10, marginBottom: 18, boxShadow: '0 2px 8px rgba(0,128,188,0.07)', padding: 18 }}>
                  <div className="title-common-info" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: '#0080BC' }}>Common Details For All Deliverables</div>
                  <div className="common-info-delivs" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ minWidth: 180 }}>
                      <label htmlFor="planPlatform" style={{ fontWeight: 500, color: '#333', marginBottom: 4, display: 'block' }}>Platform</label>
                      <select
                        id="planPlatform"
                        name="planPlatform"
                        value={planPlatform}
                        onChange={handleComnInfo}
                        aria-label="Platform"
                        title="Select the platform for all deliverables"
                        style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d3d4d5', fontSize: 14 }}
                      >
                        <option value="">Select Platform</option>
                        <option value="GMEET">GMEET</option>
                        <option value="SKYPE">SKYPE</option>
                        <option value="WEBEX">WEBEX</option>
                        <option value="TEAMS">TEAMS</option>
                      </select>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>e.g. Google Meet, Skype, Webex, Teams</div>
                    </div>
                    <div style={{ minWidth: 220 }}>
                      <label htmlFor="planLink" style={{ fontWeight: 500, color: '#333', marginBottom: 4, display: 'block' }}>Link</label>
                      <input
                        id="planLink"
                        type="text"
                        name="planLink"
                        value={planLink}
                        onChange={handleComnInfo}
                        aria-label="Common Link"
                        title="Enter the common link for all deliverables"
                        placeholder="Paste meeting/class link"
                        style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d3d4d5', fontSize: 14 }}
                      />
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Paste the online class/meeting link</div>
                    </div>
                    <div style={{ alignSelf: 'flex-end' }}>
                      <button
                        onClick={submitComnInfo}
                        aria-label="Submit Common Details"
                        style={{ background: '#0080BC', color: 'white', border: 'none', borderRadius: 5, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,128,188,0.08)' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
                <div className="deliverable-head">
                  <div className="deliv-serial">S.No.</div>
                  <div className="deliv-date">Date</div>
                  <div className="deliv-time">Time</div>
                  <div className="deliv-url">Link</div>
                  <div className="deliv-status">Status</div>
                  {!!inParas.length && !isNAdmin && <div className="deliv-action">Action</div>}
                </div>
                {formData.length ? (
                  formData.map((data, index) => {
                    const isEditing = index === editIndex;
                    return (
                      <div
                        className="deliverable-item"
                        key={index}
                        style={{
                          border: isEditing ? '2px solid #0080BC' : '1px solid #d3d3d3',
                          background: isEditing ? '#e6f7ff' : '#f9f9f9',
                          boxShadow: isEditing ? '0 2px 8px rgba(0,128,188,0.08)' : 'none',
                          marginBottom: 16,
                          borderRadius: 8,
                          padding: 12,
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                        aria-label={`Deliverable ${index + 1}`}
                      >
                        <div className="deliv-serial">{index + 1}</div>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <div className="deliv-date">
                            {isEditing ? (
                              <DatePicker
                                value={data.deliverableDate ? dayjs(data.deliverableDate) : null}
                                onChange={(newValue) =>
                                  handleDeliverableChange(
                                    { target: { value: newValue ? dayjs(newValue).format('YYYY-MM-DD') : '' } },
                                    index,
                                    'deliverableDate'
                                  )
                                }
                                renderInput={(params) => <TextField {...params} size="small" aria-label="Date" title="Select date" />}
                              />
                            ) : (
                              <span title="Deliverable Date">{data.deliverableDate || <span style={{ color: '#aaa' }}>No date</span>}</span>
                            )}
                          </div>
                          <div className="deliv-time">
                            {isEditing ? (
                              <>
                                <TimePicker
                                  value={createTimeFromString(data.startTime)}
                                  onChange={(newValue) =>
                                    handleDeliverableChange(
                                      { target: { value: newValue } },
                                      index,
                                      'startTime'
                                    )
                                  }
                                  renderInput={(params) => <TextField {...params} size="small" aria-label="Start Time" title="Start time" />}
                                />
                                {" - "}
                                <TimePicker
                                  value={createTimeFromString(data.endTime)}
                                  onChange={(newValue) =>
                                    handleDeliverableChange(
                                      { target: { value: newValue } },
                                      index,
                                      'endTime'
                                    )
                                  }
                                  renderInput={(params) => <TextField {...params} size="small" aria-label="End Time" title="End time" />}
                                />
                              </>
                            ) : (
                              <span title="Time">
                                {formatTime(data.startTime) +
                                  ' - ' +
                                  formatTime(data.endTime)}
                              </span>
                            )}
                          </div>
                        </LocalizationProvider>
                        <div className="deliv-url">
                          {isEditing ? (
                            <input
                              type="text"
                              value={data.inputUrl}
                              onChange={(e) => handleDeliverableChange(e, index, 'inputUrl')}
                              className="link-input"
                              aria-label="Class Link"
                              title="Paste the class/meeting link"
                              placeholder="Paste class/meeting link"
                            />
                          ) : data.inputUrl.toLowerCase() === 'to be added soon'.toLowerCase() ? (
                            <span style={{ color: '#aaa' }}>To be Added</span>
                          ) : (
                            <a
                              href={data.inputUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Class Link"
                              title={data.inputUrl}
                            >
                              Class Link
                            </a>
                          )}
                        </div>
                        <div className="deliv-status">
                          {isEditing ? (
                            <>
                              <div className="field-group">
                                <select
                                  id={`status-${index}`}
                                  value={data.status}
                                  onChange={(e) => handleDeliverableChange(e, index, 'status')}
                                  className="link-input"
                                  aria-label="Status"
                                  title="Select status"
                                  required
                                >
                                  <option value="Planned">Planned</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Offline">Offline</option>
                                </select>
                              </div>
                              {data.status === 'Completed' && (
                                <div className="field-group">
                                  <input
                                    id={`comments-${index}`}
                                    value={data.comments || ''}
                                    onChange={(e) => handleDeliverableChange(e, index, 'comments')}
                                    className="link-input"
                                    placeholder="Add comments"
                                    aria-label="Comments"
                                    title="Add comments"
                                    required
                                  />
                                </div>
                              )}
                              {data.status === 'Cancelled' && (
                                <div className="field-group">
                                  <select
                                    id={`comments-${index}`}
                                    value={data.comments || ''}
                                    onChange={(e) => handleDeliverableChange(e, index, 'comments')}
                                    className="link-input"
                                    required
                                  >
                                    <option value="">Select Reason</option>
                                    <option value="Network Issue">Network Issue</option>
                                    <option value="Power Cut">Power Cut</option>
                                    <option value="Students Not Available">Students Not Available</option>
                                    <option value="Volunteer Not Available">Volunteer Not Available</option>
                                  </select>
                                </div>
                              )}
                              {data.status === 'Offline' && (
                                <div className="field-group">
                                  <select
                                    id={`comments-${index}`}
                                    value={data.comments || ''}
                                    onChange={(e) => handleDeliverableChange(e, index, 'comments')}
                                    className="link-input"
                                    required
                                  >
                                    <option value="">Select Reason</option>
                                    <option value="Network Issue">Network Issue</option>
                                    <option value="Power Cut">Power Cut</option>
                                    <option value="Students Not Available">Students Not Available</option>
                                    <option value="Volunteer Not Available">Volunteer Not Available</option>
                                  </select>
                                </div>
                              )}
                              <div className="field-group">
                                <input
                                  id={`students-${index}`}
                                  type="number"
                                  min={0}
                                  value={data.numStudents || ''}
                                  onChange={(e) => handleDeliverableChange(e, index, 'numStudents')}
                                  className="link-input"
                                  placeholder="Students Number"
                                  aria-label="Number of Students"
                                  title="Enter number of students"
                                  required
                                />
                              </div>
                            </>
                          ) : (
                            <div>{data.status}</div>
                          )}
                        </div>
                        {!!inParas.length && !isNAdmin && (
                          <div className="deliv-action" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleDoneDeliverable(index)}
                                  aria-label="Save Deliverable"
                                  title="Save changes"
                                  style={{ background: '#0080BC', color: 'white', borderRadius: 4, padding: '8px 20px', marginBottom: 4, fontWeight: 500, fontSize: 15, border: 'none', boxShadow: '0 1px 4px rgba(0,128,188,0.08)' }}
                                >
                                  <DoneIcon className="done-icon" /> Save
                                </button>
                                <button
                                  onClick={() => setEditIndex('')}
                                  aria-label="Cancel Edit"
                                  title="Cancel editing"
                                  style={{ background: '#aaa', color: 'white', borderRadius: 4, padding: '8px 20px', fontWeight: 500, fontSize: 15, border: 'none' }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setEditIndex(index)}
                                aria-label="Edit Deliverable"
                                title="Edit deliverable"
                                style={{ background: '#0080BC', color: 'white', borderRadius: 4, padding: '6px 12px', fontWeight: 600, fontSize: 14, border: 'none', boxShadow: '0 1px 4px rgba(0,128,188,0.08)', minWidth: 0 }}
                              >
                                <ModeEditIcon className="edit-icon" style={{ fontSize: 18, marginRight: 4 }} /> Edit
                              </button>
                            )}
                          </div>
                        )}
                        {/* Feedback message area */}
                        {isEditing && (
                          <div style={{ position: 'absolute', bottom: 8, right: 16, color: '#0080BC', fontSize: 12 }}>
                            {/* Add feedback here if needed */}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>
                    No deliverables found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

export default Nominations;

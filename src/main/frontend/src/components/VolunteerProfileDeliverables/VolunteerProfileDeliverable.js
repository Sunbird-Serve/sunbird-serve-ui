import React, { useEffect, useRef, useState } from "react";
import "./VolunteerProfileDeliverable.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NeedsImage from "../../assets/fileIcon.png";
import { format } from "date-fns";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { formatEntityName } from "../../utils/entityNameFormatter";

const configData = require("../../configure.js");
const currentDate = format(new Date(), "yyyy-MM-dd");

const VolunteerProfileDeliverable = (props) => {
  // For need section, fetch needId wise information
  const needsList = useSelector((state) => state.need.data);

  //maps of need, entity, occurance by needId
  const needById = {};
  const entityById = {};
  const occurrenceById = {};
  needsList.forEach((item) => {
    if (item && item.need) {
      const { id, name, needTypeId, description } = item.need;
      needById[id] = { name, needTypeId, description };
    }
    if (item && item.entity) {
      entityById[item.need.id] = item.entity.name;
    }
    if (item && item.occurrence) {
      const { startDate, endDate } = item.occurrence;
      occurrenceById[item.need.id] = { startDate, endDate };
    }
  });

  //map of need type with its id
  const needtypeList = useSelector((state) => state.needtype.data.content);
  const needTypeById = {};
  needtypeList.forEach((item) => {
    if (item) {
      needTypeById[item.id] = item.name;
    }
  });

  // get fulfillments of particular volunteerId, ie. assignedId
  // filter fulfillments by needId passed here
  // for each needPlanId in the filtered fullfilments, get deliverables and make list

  const userId = useSelector((state) => state.user.data.osid);
  const [volunteerHrs, setVolunteerHrs] = useState(0);
  const [fulfils, setFulfils] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    axios
      .get(
        `${configData.SERVE_FULFILL}/fulfillment/volunteer-read/${userId}?page=0&size=10`
      )
      .then((response) => {
        setFulfils(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch current volunteer hours
    axios
      .get(`${configData.VOLUNTEER_HOURS}/${userId}`)
      .then((response) => {
        console.log("Fetching Vol Hours");
        console.log(response.data.totalHours);
        setVolunteerHrs(response.data.totalHours);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [userId]);

  const needFulfils = fulfils
    ? fulfils.filter((item) => item.needId === props.needId)
    : [];

  const userList = useSelector((state) => state.userlist.data);
  const ncoordInfo = needFulfils.length
    ? userList.filter((item) => item.osid === needFulfils[0].coordUserId)
    : [];

  // considering only one fulfilment for a (nomination)needId+volunteerId
  const planId = needFulfils[0] ? needFulfils[0].needPlanId : "";
  // const planId = '0e09a476-bac3-4256-8ff6-e2ba1192bd4f'

  const [deliverables, setDeliverables] = useState([]);
  const [inParas, setInParas] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clickMarker, setClickMarker] = useState(false); //for three dots
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cancelPopup, setCancelPopup] = useState("");
  const [completePopup, setCompletePopup] = useState("");
  const [reschedulePopup, setReschedulePopup] = useState("");
  const [rejection, setRejection] = useState("");
  const [sessionData, setSessionData] = useState();
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState("");

  const [todoDeliverables, setTodoDeliverables] = useState(null);
  const [completedDeliverables, setCompletedDeliverables] = useState(null);
  const [cancelledDeliverables, setCancelledDeliverables] = useState(null);
  const [rescheduledDeliverables, setRescheduledDeliverables] = useState(null);
  const [dstat, setDstat] = useState(false);
  const [rejectionError, setRejectionError] = useState("");

  const filterDeliverablesByMonth = (deliverables, month) => {
    if (!month) return deliverables;
    return deliverables.filter((item) => {
      const deliverableMonth = new Date(item.deliverableDate).getMonth();
      return deliverableMonth === parseInt(month, 10);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${configData.NEEDPLAN_DELIVERABLES}/${planId}`
        );
        console.log("Need Plan Deliverables Response:", response.data);
        console.log("Input Parameters:", response.data.inputParameters);
        console.log("Need Deliverables:", response.data.needDeliverable);
        setDeliverables(response.data.needDeliverable);
        setInParas(response.data.inputParameters);
      } catch (error) {
        console.error("Error fetching need deliverables");
      }
    };
    fetchData();
  }, [planId, rejection, cancelPopup, completePopup, reschedulePopup, dstat]);

  useEffect(() => {
    const filteredDeliverables = filterDeliverablesByMonth(
      deliverables,
      selectedMonth
    );
    const sortedDeliverables = filteredDeliverables
      ?.filter(
        (item) => item.status === "NotStarted" || item.status === "Planned"
      )
      .sort(
        (a, b) => new Date(a.deliverableDate) - new Date(b.deliverableDate)
      );

    setTodoDeliverables(sortedDeliverables);

    setCompletedDeliverables(
      filteredDeliverables &&
        filteredDeliverables.filter((item) => item.status === "Completed")
    );
    setCancelledDeliverables(
      filteredDeliverables &&
        filteredDeliverables.filter((item) => item.status === "Cancelled")
    );
    setRescheduledDeliverables(
      filteredDeliverables &&
        filteredDeliverables.filter((item) => 
          item.status === "Rescheduled" || 
          item.status === "InProgress"
        )
    );
  }, [deliverables, selectedMonth, dstat]); // Depend on both deliverables and selectedMonth

  const handleMonthFilter = (e) => {
    setSelectedMonth(e.target.value);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => (
    <option key={i} value={i}>
      {new Date(0, i).toLocaleString("default", { month: "long" })}
    </option>
  ));

  const [cindex, setCIndex] = useState(""); //display on popup

  const handleCancel = (item, index) => {
    console.log("Cancel clicked for item:", item);
    console.log("Setting cancelPopup to:", item);
    console.log("Setting cindex to:", index);
    
    // Reset all dropdown states immediately
    setClickMarker(false);
    setIsDropdownOpen(false);
    setSelectedIndex(null);
    
    // Set modal states
    setCancelPopup(item);
    setCIndex(index);
    setSessionData(item);
    
    console.log("States set, cancelPopup should now be:", item);
  };
  const handleChange = (e) => {
    setRejection(e.target.value);
  };
  //const confirmRejection = (item) => {}
  const confirmRejection = (item) => {
    console.log("confirmRejection called with item:", item);
    console.log("Current rejection value:", rejection);
    
    if (!rejection) {
      setRejectionError("Please select a reason for cancelling.");
      return;
    }
    
    console.log({
      needPlanId: planId,
      comments: sessionData.comments,
      status: "Cancelled",
      deliverableDate: sessionData.deliverableDate,
    });
    
    axios
      .put(`${configData.NEEDPLAN_DELIVERABLES}/update/${sessionData.id}`, {
        needPlanId: planId,
        comments: rejection,
        status: "Cancelled",
        deliverableDate: sessionData.deliverableDate,
      })
      .then((response) => {
        console.log("Deliverable Cancelled");
        setRejection("");
        setCancelPopup("");
        setDstat(!dstat);
      })
      .catch((error) => {
        console.log("Error marking deliverable cancelled");
        setRejectionError("Failed to cancel session. Please try again.");
      });
  };

  const [numBenefics, setNumBenefics] = useState(null);
  const handleBenefics = (e) => {
    setNumBenefics(e.target.value);
  };
  const [notes, setNotes] = useState(null);
  const handleNotes = (e) => {
    setNotes(e.target.value);
  };

  const handleCompleted = (item, index) => {
    console.log("Complete clicked for item:", item);
    console.log("Setting completePopup to:", item);
    console.log("Setting cindex to:", index);
    
    // Reset all dropdown states immediately
    setClickMarker(false);
    setIsDropdownOpen(false);
    setSelectedIndex(null);
    
    // Set modal states
    setCompletePopup(item);
    setCIndex(index);
    setSessionData(item);
    
    console.log("States set, completePopup should now be:", item);
  };

  const handleReschedule = (item, index) => {
    console.log("Reschedule clicked for item:", item);
    console.log("Setting reschedulePopup to:", item);
    console.log("Setting cindex to:", index);
    
    // Reset all dropdown states immediately
    setClickMarker(false);
    setIsDropdownOpen(false);
    setSelectedIndex(null);
    
    // Set modal states
    setReschedulePopup(item);
    setCIndex(index);
    setSessionData(item);
    setRescheduleDate("");
    setRescheduleError("");
    setRescheduleSuccess("");
    
    console.log("States set, reschedulePopup should now be:", item);
  };

  const confirmCompleted = () => {
    setRejection("");
    setCompletePopup("");

    axios
      .post(`${configData.SERVE_NEED}/deliverable-output/create`, {
        needDeliverableId: sessionData.id,
        numberOfAttendees: numBenefics,
        submittedUrl: "",
        remarks: notes,
      })
      .then((response) => {
        console.log("Deliverable output created");
        return axios.put(
          `${configData.NEEDPLAN_DELIVERABLES}/update/${sessionData.id}`,
          {
            needPlanId: planId,
            comments: notes,
            status: "Completed",
            deliverableDate: sessionData.deliverableDate,
          }
        );
      })
      .then(async (response) => {
        setVolunteerHrs(volunteerHrs + 1); // Update local state
        setDstat(!dstat); // Trigger re-render to reflect changes

        const needPlanResponse = await axios.get(
          `${configData.SERVE_NEED}/need-plan/read/${completePopup.needPlanId}`
        );
        const needPlanData = needPlanResponse.data;

        return axios.post(`${configData.VOLUNTEER_HOURS}/`, {
          userId: userId,
          needId: needPlanData.plan.needId,
          deliveryHours: 1,
          deliveryDate: new Date().toISOString(),
          needDeliverableId: sessionData.id,
        });
      })
      .catch((error) => {
        console.log(
          "Error completing deliverable or updating volunteer hours",
          error
        );
      });
  };

  const confirmReschedule = () => {
    console.log("confirmReschedule called with date:", rescheduleDate);
    console.log("sessionData:", sessionData);
    
    if (!rescheduleDate) {
      setRescheduleError("Please select a rescheduled date.");
      return;
    }

    const selectedDate = new Date(rescheduleDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= currentDate) {
      setRescheduleError("Please select a future date for rescheduling.");
      return;
    }

    setRescheduleError("");
    setReschedulePopup("");

    // First, update the original session to "InProgress" status
    axios
      .put(`${configData.NEEDPLAN_DELIVERABLES}/update/${sessionData.id}`, {
        needPlanId: planId,
        comments: `Session rescheduled to ${rescheduleDate}`,
        status: "Rescheduled", // Change original session to InProgress
        deliverableDate: sessionData.deliverableDate, // Keep original date unchanged
      })
      .then((response) => {
        console.log("Original session updated to Rescheduled status");
        
        // Then, create a new need deliverable with status "Planned"
        return axios.post(`${configData.NEEDPLAN_DELIVERABLES}/create`, {
          needPlanId: planId,
          comments: `Rescheduled session from ${sessionData.deliverableDate}`,
          status: "Planned",
          deliverableDate: rescheduleDate,
        });
      })
      .then((response) => {
        console.log("New deliverable created for rescheduled session");
        const newDeliverable = response.data;
        
        // Then, create input parameters for the new session
        return axios.post(`${configData.SERVE_NEED}/deliverable-input/create`, {
          needDeliverableId: newDeliverable.id,
          startTime: `${rescheduleDate}T00:00:00.000Z`,
          endTime: `${rescheduleDate}T23:59:59.000Z`
        });
      })
      .then((response) => {
        console.log("Input parameters created for rescheduled session");
        
        // Show success message
        setRescheduleSuccess("Session rescheduled successfully!");
        
        // Refresh the data to show the changes
        setDstat(!dstat);
        
        // Clear success message after 3 seconds
        setTimeout(() => setRescheduleSuccess(""), 3000);
      })
      .catch((error) => {
        console.log("Error rescheduling session", error);
        setRescheduleError("Failed to reschedule session. Please try again.");
      });
  };

  const divRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (divRef.current && !divRef.current.contains(event.target)) {
        // Reset all dropdown states
        setClickMarker(false);
        setIsDropdownOpen(false);
        setSelectedIndex(null);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTime = (dateTimeString) => {
    let hours = parseInt(dateTimeString.slice(11, 13));
    const ampm = hours >= 12 ? " PM" : " AM";
    hours = hours % 12;
    hours = hours ? hours.toString().padStart(2, "0") : "12"; // the hour '0' should be '12'
    return hours + dateTimeString.slice(13, 16) + ampm;
  };

  // Helper function to format entity name and separate UDISE codes
  const REJECTION_REASONS = [
    "Network Issue",
    "Power Cut",
    "Students Not Available",
    "Volunteer Not Available"
  ];

  // Helper function to check if a date is in the future
  const isFutureDate = (dateString) => {
    if (!dateString) return false;
    const deliverableDate = new Date(dateString);
    const currentDate = new Date();
    // Reset time to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    deliverableDate.setHours(0, 0, 0, 0);
    return deliverableDate > currentDate;
  };

  // Helper to safely show description without trimming content
  const formatDescription = (htmlString) => {
    if (!htmlString) return "";
    // Remove wrapping <p> tags if present, but keep full text
    return htmlString.replace(/^<p>/i, "").replace(/<\/p>$/i, "").trim();
  };

  const [beneficsError, setBeneficsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if data is loaded
  const isDataLoaded = needsList.length > 0 && needFulfils.length > 0;

  return (
    <div>

      
      {!isDataLoaded ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading need information...</p>
        </div>
      ) : (
        <>
          {/* NEED INFORMATION */}
          <div className="detailsNeedVoluntProfile">
            {/* Header Section */}
            <div className="need-header-section">
              <div className="need-title-section">
                <div className="nameNVP">{needById[props.needId]?.name}</div>
                <div className="typeNVP">
                  {needTypeById[needById[props.needId]?.needTypeId]}
                </div>
              </div>
              <div className="aboutNVP">
                {formatDescription(needById[props.needId]?.description)}
              </div>
            </div>

            {/* Information Grid */}
            <div className="need-info-grid">
              {/* Basic Details Section */}
              <div className="info-section">
                <div className="info-section-title">Basic Details</div>
                <div className="info-item">
                  <span className="info-label">Entity Name:</span>
                  <span className="info-value">
                    {formatEntityName(entityById[props.needId]) || "Not Available"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Start Date:</span>
                  <span className="info-value">
                    {occurrenceById[props.needId]?.startDate
                      ? occurrenceById[props.needId].startDate.slice(0, 10)
                      : "Not Available"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">End Date:</span>
                  <span className="info-value">
                    {occurrenceById[props.needId]?.endDate
                      ? occurrenceById[props.needId].endDate.slice(0, 10)
                      : "Not Available"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Time:</span>
                  <span className="info-value">
                    {inParas.length && inParas[0]?.startTime && inParas[0]?.endTime
                      ? formatTime(inParas[0].startTime) +
                        " - " +
                        formatTime(inParas[0].endTime)
                      : "Not Available"}
                  </span>
                </div>
              </div>

              {/* Coordinator Information Section */}
              <div className="info-section">
                <div className="info-section-title">Coordinator Information</div>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">
                    {ncoordInfo.length && ncoordInfo[0]?.identityDetails?.fullname 
                      ? ncoordInfo[0].identityDetails.fullname 
                      : "Not Available"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value email">
                    {ncoordInfo.length && ncoordInfo[0]?.contactDetails?.email 
                      ? ncoordInfo[0].contactDetails.email 
                      : "Not Available"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mobile:</span>
                  <span className="info-value mobile">
                    {ncoordInfo.length && ncoordInfo[0]?.contactDetails?.mobile 
                      ? ncoordInfo[0].contactDetails.mobile 
                      : "Not Available"}
                  </span>
                </div>
              </div>

              {/* Session Details Section */}
              <div className="info-section">
                <div className="info-section-title">Session Details</div>
                <div className="info-item">
                  <span className="info-label">Platform:</span>
                  <span className="info-value">
                    {inParas.length && inParas[0]?.softwarePlatform
                      ? inParas[0].softwarePlatform
                      : "Available Shortly"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Session URL:</span>
                  <span className="info-value">
                    {inParas.length && inParas[0]?.inputUrl && inParas[0].inputUrl !== "To be added soon" ? (
                      <a
                        href={inParas[0].inputUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Session Link
                      </a>
                    ) : (
                      "Available Shortly"
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Content:</span>
                  <span className="info-value">
                    {inParas.length && inParas[0]?.resourceUrl ? (
                      <a
                        href={inParas[0]?.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Resource Link
                      </a>
                    ) : (
                      <a 
                        href="https://serve-jcms.evean.net/home/view_course/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Course
                      </a>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NEED PLAN DELIVERABLES*/}
          <div className="deliverablesNeedVolunteerProfile">
            {/*DNVP refer to Need Plan Deliverables from Volunteer Profile*/}
            <div className="headDNVP">
              Need Plan Deliverables
              <div className="monthFilterContainer">
                <div className="selectMonth">
                  <i className="nSortDateIcon">
                    <CalendarTodayIcon
                      style={{ fontSize: "18px", margin: "0px 3px" }}
                    />
                  </i>
                  <select
                    className="selectMonthType"
                    value={selectedMonth}
                    onChange={handleMonthFilter}
                  >
                    <option value="">All Months</option>
                    {monthOptions}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {deliverables.length ? (
            <div className="listDNVP">
              <div className="listDNVPbox">
                <button className="todoDNVP">To-Do</button>
                {todoDeliverables && todoDeliverables.length > 0 && (
                  <div className="column-count">{todoDeliverables.length}</div>
                )}
                <div>
                  {todoDeliverables &&
                    todoDeliverables.map((item, index) => (
                      <div key={index} className="deliverable-container">
                        <div className="deliverable-title">
                          <div>
                            <img
                              src={NeedsImage}
                              alt="Nominated Needs"
                              width="20px"
                            />
                          </div>
                          <div>
                            {needById[props.needId].name}: Session {index + 1}
                          </div>
                        </div>
                        <div className="date-deliverable">
                          <div>Due {item.deliverableDate}</div>
                          {item.comments && item.comments.includes("Rescheduled session from") && (
                            <div className="reschedule-comment">
                              {item.comments}
                            </div>
                          )}
                          <div>
                            <button
                              className={`button-dstat ${isFutureDate(item.deliverableDate) ? 'future-date-disabled' : ''}`}
                              onClick={() => {
                                if (!isFutureDate(item.deliverableDate)) {
                                  // If clicking on the same item, toggle the dropdown
                                  if (selectedIndex === index && isDropdownOpen) {
                                    setIsDropdownOpen(false);
                                    setClickMarker(false);
                                  } else {
                                    setSelectedIndex(index);
                                    setIsDropdownOpen(true);
                                    setClickMarker(true);
                                  }
                                }
                              }}
                              title={isFutureDate(item.deliverableDate) ? "Cannot update future schedules" : "More options"}
                            >
                              <MoreVertIcon
                                style={{ 
                                  color: isFutureDate(item.deliverableDate) ? "#ccc" : "black", 
                                  fontSize: "16px" 
                                }}
                              />
                            </button>
                          </div>
                        </div>
                        {index === selectedIndex && isDropdownOpen && (
                          <div ref={divRef} className="status-ticker">
                            {isFutureDate(item.deliverableDate) ? (
                              <div className="future-date-warning">
                                Cannot update future schedules
                              </div>
                            ) : (
                              <>
                                <button
                                  className="delstat-complete"
                                  onClick={() => handleCompleted(item, index + 1)}
                                >
                                  Mark as Completed
                                </button>
                                <button
                                  className="delstat-reschedule"
                                  onClick={() => handleReschedule(item, index + 1)}
                                >
                                  Reschedule
                                </button>
                                <button
                                  className="delstat-cancel"
                                  onClick={() => handleCancel(item, index + 1)}
                                >
                                  Cancel Plan
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        
                      </div>
                    ))}
                </div>
              </div>
              <div className="listDNVPbox">
                <button className="completedDNVP">Completed</button>
                {completedDeliverables && completedDeliverables.length > 0 && (
                  <div className="column-count">{completedDeliverables.length}</div>
                )}
                <div>
                  {completedDeliverables &&
                    completedDeliverables.map((item, index) => (
                      <div key={index} className="deliverable-container">
                        <div className="deliverable-title">
                          <div>
                            <img
                              src={NeedsImage}
                              alt="Nominated Needs"
                              width="20px"
                            />
                          </div>
                          <div>
                            {needById[props.needId].name}: Session {index + 1}
                          </div>
                        </div>
                        <div className="date-completed-deliverable">
                          Completed on {item.deliverableDate}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="listDNVPbox">
                <button className="canceledDNVP">Canceled</button>
                {cancelledDeliverables && cancelledDeliverables.length > 0 && (
                  <div className="column-count">{cancelledDeliverables.length}</div>
                )}
                {cancelledDeliverables &&
                  cancelledDeliverables.map((item, index) => (
                    <div key={index} className="deliverable-container">
                      <div className="deliverable-title">
                        <div>
                          <img
                            src={NeedsImage}
                            alt="Nominated Needs"
                            width="20px"
                          />
                        </div>
                        <div>
                          {needById[props.needId].name}: Session {index + 1}
                        </div>
                      </div>
                      <div className="date-completed-deliverable">
                        Cancelled on {item.deliverableDate}
                      </div>
                    </div>
                  ))}
              </div>
              {rescheduledDeliverables && rescheduledDeliverables.length > 0 && (
                <div className="listDNVPbox">
                  <button className="rescheduledDNVP">Rescheduled</button>
                  <div className="column-count">{rescheduledDeliverables.length}</div>
                  {rescheduledDeliverables.map((item, index) => (
                    <div key={index} className="deliverable-container">
                      <div className="deliverable-title">
                        <div>
                          <img
                            src={NeedsImage}
                            alt="Nominated Needs"
                            width="20px"
                          />
                        </div>
                        <div>
                          {needById[props.needId].name}: Session {index + 1}
                        </div>
                      </div>
                      <div className="date-completed-deliverable">
                        {item.status === "Rescheduled" 
                          ? `Rescheduled to ${item.comments ? item.comments.replace("Session rescheduled to ", "") : item.deliverableDate}` 
                          : `Rescheduled on ${item.deliverableDate}`}
                      </div>
                      {item.status === "Rescheduled" && item.comments && item.comments.includes("Session rescheduled to") && (
                        <div className="original-session-info">
                          Original: {item.deliverableDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                             )}
             </div>
           ) : (
             <div className="deliverable-unapproved">
               Need is yet to be approved, Coordinator will get in touch with you
               soon
             </div>
           )}

           {/* MODALS - Rendered at component level */}
           
           {/* CANCEL popup */}
           {cancelPopup && (
             <div className="wrap-cpopup">
               <div className="inwrap-cpopup">
                 <div className="cpopup">
                   <div className="topbar-cpopup">
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Reason for Cancelling</div>
                     <div>
                       <button
                         className="cancel-button"
                         onClick={() => setCancelPopup("")}
                       >
                         <div className="close-cpopup">
                           <CloseIcon style={{ height: "20px" }} />
                         </div>
                       </button>
                     </div>
                   </div>
                   <div className="title-cancel">
                     {needById[props.needId].name}: Session {cindex}
                   </div>
                   <div className="wrap-reasonbox">
                     <label>Reason</label>
                     <select
                       className="reject-reason"
                       value={rejection}
                       onChange={e => { setRejection(e.target.value); setRejectionError(""); }}
                       required
                     >
                       <option value="">Select Reason</option>
                       {REJECTION_REASONS.map((reason) => (
                         <option key={reason} value={reason}>{reason}</option>
                       ))}
                     </select>
                    {rejectionError && (
                      <div style={{ color: 'red', marginTop: 4, fontSize: '0.95rem' }}>{rejectionError}</div>
                    )}
                   </div>
                   <div className="cancel-buttons">
                     <button
                       className="reject-cancel-button"
                       onClick={() => setCancelPopup("")}
                     >
                       Cancel
                     </button>
                     <button
                       className="reject-confirm-button"
                       onClick={() => {
                         if (!rejection) {
                           setRejectionError("Please select a reason for cancelling.");
                           return;
                         }
                         confirmRejection();
                       }}
                     >
                       Confirm
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* COMPLETE popup */}
           {completePopup && (
             <div className="wrap-cpopup">
               <div className="inwrap-cpopup">
                 <div className="cpopup">
                   <div className="topbar-cpopup">
                     <label>Confirmation</label>
                     <div>
                       <button
                         className="cancel-button"
                         onClick={() => setCompletePopup("")}
                       >
                         <div className="close-cpopup">
                           <CloseIcon style={{ height: "20px" }} />
                         </div>
                       </button>
                     </div>
                   </div>
                   <div className="title-cancel">
                     {needById[props.needId].name}: Session {cindex}
                   </div>
                   <div className="wrap-reasonbox">
                     <label>Comments/Notes</label>
                     <textarea
                       className="reject-reason"
                       value={notes}
                       onChange={handleNotes}
                       rows={4}
                       cols={60}
                       placeholder="Write comments or notes on the need plan deliverable"
                     ></textarea>
                   </div>
                   <div className="wrap-beneficbox">
                     <label>Students attended</label>
                     <input
                       type="number"
                       name="numBenfics"
                       value={numBenefics || ""}
                       onChange={e => { setNumBenefics(e.target.value); setBeneficsError(""); }}
                       min={0}
                       required
                     />
                     {beneficsError && (
                       <div style={{ color: 'red', marginTop: 4, fontSize: '0.95rem' }}>{beneficsError}</div>
                     )}
                   </div>
                   <div className="cancel-buttons">
                     <button
                       className="reject-cancel-button"
                       onClick={() => setCompletePopup("")}
                     >
                       Cancel
                     </button>
                     <button
                       className="reject-confirm-button"
                       onClick={() => {
                         if (!numBenefics || isNaN(numBenefics) || Number(numBenefics) < 0) {
                           setBeneficsError("Please enter the number of students attended.");
                           return;
                         }
                         confirmCompleted();
                       }}
                     >
                       Confirm
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* RESCHEDULE popup */}
           {reschedulePopup && (
             <div className="wrap-cpopup">
               <div className="inwrap-cpopup">
                 <div className="cpopup">
                   <div className="topbar-cpopup">
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Reschedule Session</div>
                     <div>
                       <button
                         className="cancel-button"
                         onClick={() => setReschedulePopup("")}
                       >
                         <div className="close-cpopup">
                           <CloseIcon style={{ height: "20px" }} />
                         </div>
                       </button>
                     </div>
                   </div>
                   <div className="title-cancel">
                     {needById[props.needId].name}: Session {cindex}
                   </div>
                   <div className="wrap-reasonbox">
                     <label>New Date</label>
                     <input
                       type="date"
                       className="reject-reason"
                       value={rescheduleDate}
                       onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleError(""); }}
                       min={new Date().toISOString().split('T')[0]}
                       required
                     />
                     {rescheduleError && (
                       <div style={{ color: 'red', marginTop: 4, fontSize: '0.95rem' }}>{rescheduleError}</div>
                     )}
                     {rescheduleSuccess && (
                       <div style={{ color: 'green', marginTop: 4, fontSize: '0.95rem' }}>{rescheduleSuccess}</div>
                     )}
                   </div>
                   <div className="cancel-buttons">
                     <button
                       className="reject-cancel-button"
                       onClick={() => setReschedulePopup("")}
                     >
                       Cancel
                     </button>
                     <button
                       className="reject-confirm-button"
                       onClick={confirmReschedule}
                     >
                       Reschedule
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </>
       )}
     </div>
   );
 };

export default VolunteerProfileDeliverable;

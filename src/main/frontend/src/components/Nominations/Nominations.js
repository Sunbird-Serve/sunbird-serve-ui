import React, { useEffect, useState, useMemo } from "react";
import "./Nominations.css";
import axios from "axios";
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
import { useSelector, useDispatch } from "react-redux";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DoneIcon from "@mui/icons-material/Done";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { format } from "date-fns";

const configData = require("../../configure.js");

const Nominations = ({ needData, openPopup }) => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isNAdmin = userRole?.[0] === "nAdmin" ? true : false;

  const [activeTab, setActiveTab] = useState("tabN");
  const [responseFlag, setResponseFlag] = useState(false);

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

  // const nomsList = useSelector((state) => state.nominationbynid.data);
  //filter nominations as per active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
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

  if (acceptPopup) {
    console.log(rowData.id); //nominationId
    console.log(rowData.nominatedUserId); //nominatedUserId
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

  const confirmRejection = (e) => {
    axios
      .post(
        `${configData.NOMINATION_CONFIRM}/${rowData.nominatedUserId}/confirm/${rowData.id}?status=Rejected`
      )
      .then(
        function (response) {
          setResponseFlag(!responseFlag);
        },
        openPopup("reject"),
        setRejectPopup(false)
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
        const viewDeliverable = () => {
          console.log(row.original);
          setRowData(row.original);
          axios
            .get(
              `${configData.SERVE_FULFILL}/fulfillment/volunteer-read/${row.original.nominatedUserId}?page=0&size=10`
            )
            .then((response) => {
              setFulfillment(response.data);
              console.log(response.data);
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
                <button className="acceptNomin" onClick={handleAccept}>
                  <CheckIcon
                    style={{
                      height: "20px",
                      width: "20px",
                      marginLeft: "-5px",
                      marginBottom: "3px",
                      color: "green",
                    }}
                  />
                </button>
                <button className="rejectNomin" onClick={handleReject}>
                  <ClearIcon
                    style={{
                      height: "20px",
                      width: "20px",
                      marginLeft: "-4.5px",
                      marginBottom: "3px",
                      color: "red",
                    }}
                  />
                </button>
              </>
            )}
            {activeTab === "tabA" && (
              <button className="styled-button" onClick={viewDeliverable}>
                View Deliverables
              </button>
            )}
          </div>
        );
      },
      width: 250,
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
          console.log(response.data);
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
    console.log(item);
    setEditIndex(index);
  };
  const handleDoneDeliverable = (index) => {
    setEditIndex("");
    console.log(formData[index].deliverableId);
    console.log({
      inputUrl: formData[index].inputUrl,
      softwarePlatform: formData[index].softwarePlatform,
      startTime: formData[index].startTime,
      endTime: formData[index].endTime,
    });
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
      .then((response) => {
        console.log("Status updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const [formData, setFormData] = useState([]);

  useEffect(() => {
    const initialFormData = deliverables.map((item, index) => ({
      deliverableId: item.id,
      deliverableDate: item.deliverableDate,
      startTime: inParas.length ? inParas[index].startTime : "",
      endTime: inParas.length ? inParas[index].endTime : "",
      softwarePlatform: inParas.length ? inParas[index].softwarePlatform : "",
      inputUrl: inParas.length ? inParas[index].inputUrl : "",
      status: item.status,
      comments: item.comments,
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
    console.log({
      inputUrl: planData.planLink,
      softwarePlatform: planData.planPlatform,
      startTime: planData.planStartTime,
      endTime: planData.planEndTime,
    });
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
      )}
      {/* table for reading list of nominations*/}
      {!gotoDelivs && (
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
      )}
      {/* reject pop-up */}
      {rejectPopup && (
        <div className="popupReject">
          <div className="rejectBox">
            <div className="rbTopBar">
              <span>Reason for Rejection</span>
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
                placeholder="Write a reason for rejecting the nominee"
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
              <div className="confirmBtnRN" onClick={confirmRejection}>
                Confirm
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  */}
      {gotoDelivs && (
        <div className="wrap-NCDeliverables">
          <div className="backToNoms">
            <span> Need Deliverable Details</span>
            <button onClick={() => setGotoDelivs(false)}>
              <ArrowBackIcon />
            </button>
          </div>
          <div className="table-NCDeliverables">
            <div className="common-info-section">
              <div className="title-common-info">
                Common Details For All Deliverables
              </div>
              <div className="common-info-delivs">
                <div>
                  <span>Platform</span>
                  <select
                    name="planPlatform"
                    value={planPlatform}
                    onChange={handleComnInfo}
                  >
                    <option value="">Select Platform</option>
                    <option value="GMEET">GMEET</option>
                    <option value="SKYPE">SKYPE</option>
                    <option value="WEBEX">WEBEX</option>
                    <option value="TEAMS">TEAMS</option>
                  </select>
                </div>
                <div>
                  <span>Link</span>
                  <input
                    type="text"
                    name="planLink"
                    value={planLink}
                    onChange={handleComnInfo}
                  />
                </div>
                <div>
                  <button onClick={submitComnInfo}>Submit</button>
                </div>
              </div>
            </div>
            <div className="deliverable-head">
              <div className="deliv-serial">S.No.</div>
              <div className="deliv-date">Date</div>
              <div className="deliv-time">Time</div>
              <div className="deliv-url">Link</div>
              <div className="deliv-status">Status</div>
              {!!inParas.length && !isNAdmin && (
                <div className="deliv-action">Action</div>
              )}
            </div>
            {formData.length &&
              formData.map((data, index) => (
                <div className="deliverable-item" key={index}>
                  <div className="deliv-serial">{index + 1}</div>
                  <div className="deliv-date">{data.deliverableDate}</div>
                  <div className="deliv-time">
                    {data.startTime ? data.startTime.slice(11, 16) : ""} -{" "}
                    {data.endTime ? data.endTime.slice(11, 16) : ""}
                  </div>
                  <div className="deliv-url">
                    {index === editIndex ? (
                      <input
                        type="text"
                        value={data.inputUrl}
                        onChange={(e) =>
                          handleDeliverableChange(e, index, "inputUrl")
                        }
                        className="link-input"
                      />
                    ) : data.inputUrl.toLowerCase() ===
                      "to be added soon".toLowerCase() ? (
                      <span>To be Added</span>
                    ) : (
                      <a
                        href={data.inputUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Class Link
                      </a>
                    )}
                  </div>

                  <div className="deliv-status">
                    {index === editIndex ? (
                      <>
                        <div className="field-group">
                          <select
                            id={`status-${index}`}
                            value={data.status}
                            onChange={(e) =>
                              handleDeliverableChange(e, index, "status")
                            }
                            className="link-input"
                          >
                            <option value="Planned">Planned</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="field-group">
                          <input
                            id={`comments-${index}`}
                            value={data.comments || ""}
                            onChange={(e) =>
                              handleDeliverableChange(e, index, "comments")
                            }
                            className="link-input"
                            placeholder="Add comments"
                          />
                        </div>
                        <div className="field-group">
                          <input
                            id={`students-${index}`}
                            type="number"
                            value={data.numStudents || ""}
                            onChange={(e) =>
                              handleDeliverableChange(e, index, "numStudents")
                            }
                            className="link-input"
                            placeholder="Students Number"
                          />
                        </div>
                      </>
                    ) : (
                      <div>{data.status}</div>
                    )}
                  </div>
                  {!!inParas.length && !isNAdmin && (
                    <div className="deliv-action">
                      {index === editIndex ? (
                        <button onClick={() => handleDoneDeliverable(index)}>
                          <DoneIcon className="done-icon" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditDeliverable(data, index)}
                        >
                          <ModeEditIcon className="edit-icon" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Nominations;

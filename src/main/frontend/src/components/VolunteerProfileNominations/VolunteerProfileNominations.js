import React, { useEffect, useState } from "react";
import "./VolunteerProfileNominations.css";
import VolunteerNeedsNominated from "../../assets/needsNominated.png";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
import VolunteerNeedsInProgress from "../../assets/needsInProgress.png";
import VolunteerPlansDelivered from "../../assets/plansDelivered.png";
import VolunteerHrs from "../../assets/volunteerHrs.png";
import axios from "axios";
import NeedsImage from "../../assets/fileIcon.png";
import VolunteerProfileDeliverable from "../VolunteerProfileDeliverables/VolunteerProfileDeliverable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { useSelector, useDispatch } from "react-redux";

const configData = require("../../configure.js");

function VPNominations() {
  //create needId maps to get data from need
  const needTypes = useSelector((state) => state.needtype.data.content);
  const mapNType = {};
  needTypes.forEach((item) => {
    mapNType[item.id] = item.name;
  });
  const needsList = useSelector((state) => state.need.data);
  const needById = {};
  const dateById = {};
  const typeById = {};
  console.log(needsList);
  needsList.forEach((item) => {
    if (item && item.need) {
      const { id, name } = item.need;
      needById[id] = name;
      if (item.occurrence != null) {
        dateById[id] = item.occurrence.startDate;
      } else {
        dateById[id] = new Date();
      }
      typeById[id] = item.need.needTypeId;
    }
  });

  //get userId
  const userId = useSelector((state) => state.user.data.osid);
  console.log(userId);

  const [totalCompletedSessions, setTotalCompletedSessions] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedSessions = async () => {
      //setLoading(true);
      try {
        // Fetch fulfillments to get needPlanIds
        const fulfillmentResponse = await axios.get(
          `${configData.SERVE_FULFILL}/fulfillment/volunteer-read/${userId}?page=0&size=10`
        );
        const fulfillments = fulfillmentResponse.data;

        // Extract needPlanIds
        const needPlanIds = fulfillments.map((item) => item.needPlanId);

        // Fetch need deliverables for each needPlanId
        const deliverablePromises = needPlanIds.map((needPlanId) =>
          axios.get(`${configData.SERVE_NEED}/need-deliverable/${needPlanId}`)
        );

        const deliverableResponses = await Promise.all(deliverablePromises);

        // Count completed statuses from needDeliverable
        let completedCount = 0;
        deliverableResponses.forEach((response) => {
          const needDeliverables = response.data.needDeliverable || [];
          completedCount += needDeliverables.filter(
            (deliverable) => deliverable.status === "Completed"
          ).length;
        });

        // Step 4: Update state with the total completed sessions
        setTotalCompletedSessions(completedCount);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        //setLoading(false);
      }
    };

    fetchCompletedSessions();
  }, [userId]);

  //get nominations by nominated userId
  const [nominations, setNominations] = useState([]);
  const [volunteerHrs, setVolunteerHrs] = useState(null);
  useEffect(() => {
    axios
      .get(`${configData.NOMINATIONS_GET}/${userId}?page=0&size=1000`)
      .then((response) => {
        setNominations(Object.values(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

    axios
      .get(`${configData.VOLUNTEER_HOURS}/${userId}`)
      .then((response) => {
        console.log(response.data);
        // Extract the numerical value from the response string
        const hrsMatch = response.data.match(
          /Total volunteer hours for .+ is (\d+(\.\d+)?)/
        );
        if (hrsMatch) {
          setVolunteerHrs(hrsMatch[1]); // Set only the matched number part, e.g., 1.0
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [userId]);

  //filter nominations by tabs @ nomination status
  const [activeTab, setActiveTab] = useState("tabN");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const [nomsByTab, setNomsByTab] = useState([]);
  useEffect(() => {
    if (activeTab === "tabN") {
      setNomsByTab(
        nominations.filter((item) => item.nominationStatus === "Nominated")
      );
    } else if (activeTab === "tabA") {
      setNomsByTab(
        nominations.filter((item) => item.nominationStatus === "Approved")
      );
    } else if (activeTab === "tabP") {
      setNomsByTab(
        nominations.filter((item) => item.nominationStatus === "Inprogress")
      );
    } else {
      setNomsByTab(nominations);
    }
  }, [nominations, activeTab]);

  const [sortingOrder, setSortingOrder] = useState("ascending");
  const [nomsByDate, setNomsByDate] = useState([]);
  useEffect(() => {
    // Clone the needList to avoid modifying the original array
    const sortedList = [...nomsByTab];
    if (sortingOrder === "ascending") {
      sortedList.sort(
        (a, b) => new Date(dateById[a.needId]) - new Date(dateById[b.needId])
      );
    } else {
      sortedList.sort(
        (a, b) => new Date(dateById[b.needId]) - new Date(dateById[a.needId])
      );
    }
    setNomsByDate(sortedList);
  }, [sortingOrder, nomsByTab]);

  console.log(nomsByDate);

  //nomsFiltered is the final displayed Nominations after filter by needType
  const [nomsFiltered, setNomsFiltered] = useState(null);
  const [needTypeId, setNeedTypeId] = useState("");
  const handleNeedTypeFilter = (e) => {
    setNeedTypeId(e.target.value);
  };
  useEffect(() => {
    let filtered = nomsByDate;
    if (needTypeId) {
      console.log(needTypeId);
      const filtered = nomsByDate.filter(
        (item) => typeById[item.needId] === needTypeId
      );
      setNomsFiltered(filtered);
    } else {
      setNomsFiltered(filtered);
    }
  }, [needTypeId, nomsByDate]);

  console.log(nomsFiltered);

  //hadle view nomination details
  const [fullDetails, setFullDetails] = useState(false);
  const [needId, setNeedId] = useState(null);
  const handleDetail = (needid) => {
    setFullDetails(!fullDetails);
    setNeedId(needid);
  };

  return (
    <div>
      {/* NOMINATIONS by VOLUNTEER */}
      {!fullDetails && (
        <div>
          {/* Title */}
          <div className="headerVPNoms">
            <div className="titleVPNoms"> Nominations</div>
            <div className="tagVPNoms">Check your nominations and metrics</div>
          </div>
          {/* stats */}
          <div className="statsVPNoms">
            <div className="statsVPNomsItem">
              <div className="statsVPNomsCount">
                <img
                  src={VolunteerNeedsNominated}
                  alt="Nominated Needs"
                  height="35px"
                />
                <span>
                  {
                    nominations.filter(
                      (item) => item.nominationStatus === "Nominated"
                    ).length
                  }
                </span>
              </div>
              <div className="statsVPNomsName">Needs Nominated</div>
            </div>
            <div className="statsVPNomsItem">
              <div className="statsVPNomsCount">
                <img
                  src={VolunteerNeedsApproved}
                  alt="Approved Needs"
                  height="35px"
                />
                <span>
                  {
                    nominations.filter(
                      (item) => item.nominationStatus === "Approved"
                    ).length
                  }
                </span>
              </div>
              <div className="statsVPNomsName">Needs Approved</div>
            </div>
            <div className="statsVPNomsItem">
              <div className="statsVPNomsCount">
                <img
                  src={VolunteerPlansDelivered}
                  alt="Nominated Needs"
                  height="35px"
                />
                <span>{volunteerHrs}</span>
              </div>
              <div className="statsVPNomsName">Total Volunteer Hrs</div>
            </div>
            <div className="statsVPNomsItem">
              <div className="statsVPNomsCount">
                <img src={VolunteerHrs} alt="Nominated Needs" height="35px" />
                <span>{totalCompletedSessions}</span>
              </div>
              <div className="statsVPNomsName">Sessions Delivered</div>
            </div>
          </div>

          <div className="vNomFilters">
            {/* Tabs */}
            <div className="vnomTabs">
              <div
                className={`${activeTab === "tabN" ? "VNomTabN selectedVNomTab" : "VNomTabN"}`}
                onClick={() => handleTabClick("tabN")}
              >
                Nominated
              </div>
              <div
                className={`${activeTab === "tabA" ? "VNomTabA selectedVNomTab" : "VNomTabA"}`}
                onClick={() => handleTabClick("tabA")}
              >
                Approved
              </div>
            </div>

            <div className="selectDateAndNeed">
              <div className="selectDate">
                <i className="nSortDateIcon">
                  <CalendarTodayIcon
                    style={{ fontSize: "18px", margin: "0px 3px" }}
                  />
                </i>
                <select onChange={(e) => setSortingOrder(e.target.value)}>
                  <option value="" disabled hidden select>
                    Sort By
                  </option>
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>

              <div className="selectNeed">
                <select
                  className="selectNeedType"
                  name="needTypeId"
                  value={needTypeId}
                  onChange={handleNeedTypeFilter}
                >
                  <option value="" defaultValue>
                    All Need Types
                  </option>
                  {needTypes.map((ntype) => (
                    <option key={ntype.osid} value={ntype.id}>
                      {ntype.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {activeTab === "tabN" &&
            nominations.filter((item) => item.nominationStatus === "Nominated")
              .length === 0 && (
              <div className="emptyState">
                No nominated needs available. Please check the{" "}
                <strong>Approved</strong> tab.
              </div>
            )}
          {/* Nominations Display */}
          <div className="nomination-grid">
            {nomsFiltered &&
              nomsFiltered.map((nomination) => (
                <div key={nomination.id} className="nomination-item">
                  <div className="needItemVolunteer">
                    <img src={NeedsImage} alt="Nominated Needs" width="20px" />
                    <p className="needNameVP">{needById[nomination.needId]}</p>
                    <button
                      className="viewFull"
                      onClick={() => handleDetail(nomination.needId)}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* DETAILS OF A NOMINATION */}
      {fullDetails && (
        <div>
          <button
            className="backBtnVDeliverable"
            onClick={() => handleDetail()}
          >
            <ArrowBackIcon /> Back
          </button>
          <VolunteerProfileDeliverable needId={needId} />
        </div>
      )}
    </div>
  );
}

export default VPNominations;

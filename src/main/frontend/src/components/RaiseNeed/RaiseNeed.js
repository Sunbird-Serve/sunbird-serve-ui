import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import "./RaiseNeed.css";
import { useHistory } from "react-router";
import UploadImageBG from "../../assets/bgImgUpload.png";
import MultiSelect from "./MultiSelect";
import MonoSelect from "./MonoSelect";
import { useSelector, useDispatch } from "react-redux";
import { fetchNeedsByUid } from "../../state/needByUidSlice";
import dayjs from "dayjs";

const configData = require("../../configure.js");

const RaiseNeed = (props) => {
  const dispatch = useDispatch();

  const history = useHistory();
  const uid = useSelector((state) => state.user.data.osid);
  // const entities = useSelector((state) => state.entity.data.content);
  const needTypes = useSelector((state) => state.needtype.data.content);

  // fields to enter in the raise need form
  const [timeslotsArray, setTimeslotsArray] = useState([]);
  // Find the id for 'Online Teaching' need type
  const getOnlineTeachingId = () => {
    const onlineType = needTypes.find((nt) => nt.name === "Online Teaching");
    return onlineType ? onlineType.id : "";
  };
  const [data, setData] = useState({
    needTypeId: "",
    name: "",
    needPurpose: "",
    description: "",
    status: "New",
    userId: uid,
    entityId: "",
    //requirementId: '',
  });
  const [reccurrence, setReccurrence] = useState("off");
  const [selectedDays, setSelectedDays] = useState([]);
  const [dataOccurrence, setDataOccurrence] = useState({
    startDate: "",
    endDate: "",
    days: "",
    frequency: reccurrence,
    timeSlots: selectedDays,
  });
  const [dataOther, setDataOther] = useState({
    skillDetails: "",
    volunteersRequired: "",
    occurrence: dataOccurrence,
    priority: "",
  });
  const {
    needTypeId,
    name,
    needPurpose,
    description,
    status,
    userId,
    entityId,
  } = data;
  const { startDate, endDate, days, frequency, timeSlots } = dataOccurrence;
  const { skillDetails, volunteersRequired, occurrence, priority } = dataOther;
  const [entities, setEntities] = useState([]);

  // Set default needTypeId to Online Teaching when needTypes are loaded
  useEffect(() => {
    const onlineId = getOnlineTeachingId();
    if (onlineId && data.needTypeId !== onlineId) {
      setData((prev) => ({ ...prev, needTypeId: onlineId }));
    }
  }, [needTypes]);

  useEffect(() => {
    const getEntityDetails = async () => {
      try {
        if (uid) {
          const response = await axios.get(
            `${configData.ENTITY_DETAILS_GET}/${uid}?page=0&size=1000`
          );
          const entities =
            response.data?.content
              // ?.filter((entity) => entity.status === "Active")
              ?.map((entity) => ({
                id: entity.id,
                name: entity.name,
              })) || [];
          setEntities(entities);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getEntityDetails();
  }, [uid]);
  //need name and purpose updated by change handler
  //default Handlers to update input fields //
  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (e.target.name === "needTypeId") {
      console.log("Selected Need Type ID:", e.target.value);
    }
  };
  const changeHandlerOther = (e) => {
    setDataOther({ ...dataOther, [e.target.name]: e.target.value });
  };
  const changeFrequency = (e) => {
    setDataOccurrence({ ...dataOccurrence, frequency: e.target.value });
    setReccurrence(e.target.value);
  };

  // need description - configure rich text options //
  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
  ];
  const module = {
    toolbar: toolbarOptions,
  };
  const handleQuillEdit = (value) => {
    setData({ ...data, description: value });
  };

  //get from input in YearMonthDay format then convert to datetime before updating
  const [startYMD, setStartYMD] = useState("2025-07-01");
  const [endYMD, setEndYMD] = useState("2025-12-31");
  const handleEndDate = (e) => {
    setDataOccurrence({
      ...dataOccurrence,
      endDate: e.target.value + "T17:00:00.000Z",
    });
    setEndYMD(e.target.value);
  };
  const handleStartDate = (e) => {
    setDataOccurrence({
      ...dataOccurrence,
      startDate: e.target.value + "T09:00:00.000Z",
    });
    setStartYMD(e.target.value);
  };
  // Handler to update selected event days
  //selected dayTime passed back in object format and convert to UTC
  const objToUTC = (timeObj) => {
    const timeValue = timeObj.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    return timeValue.substr(0, 16) + ":00.000Z";
  };
  const handleSelectedDaysChange = (selected) => {
    setSelectedDays(
      selected &&
        selected.map((item) => ({
          day: item.day,
          startTime: objToUTC(item.startTime),
          endTime: objToUTC(item.endTime),
        }))
    );
  };
  //initialising day and time selection in obj format and pass to select
  const scheduleTime = [
    {
      day: "Monday",
      startTime: dayjs("2025-07-01T10:00:00"),
      endTime: dayjs("2025-07-01T11:00:00"),
    },
    {
      day: "Tuesday",
      startTime: dayjs("2025-07-01T10:00:00"),
      endTime: dayjs("2025-07-01T11:00:00"),
    },
  ];

  // get skills for all need types
  const [skillMap, setSkillMap] = useState([]);
  async function getReq(needTypeId) {
    try {
      // Use the configData constant for the skill details API
      const response = await axios.get(
        `${configData.SKILL_DETAILS}/${needTypeId}?page=0&size=10`
      );

      // Extract skills from the API response
      const skillData = response.data.content;

      // Map skillName to label and value for react-select
      return skillData.map((skill) => ({
        label: skill.skillName,
        value: skill.skillName,
      }));
    } catch (error) {
      console.error("Error fetching skills:", error);
      return [];
    }
  }
  useEffect(() => {
    async function fetchNeedRequirements() {
      const responseMap = {};
      await Promise.all(
        needTypes.map(async (needType) => {
          const skillsReq = await getReq(needType.id); // Update to use needType.id
          responseMap[needType.id] = skillsReq || [];
        })
      );
      setSkillMap(responseMap);
    }
    fetchNeedRequirements();
  }, [needTypes]);
  //when needType is set, fetch curresponding requirements ans set to options
  const [options, setOptions] = useState([]);
  useEffect(() => {
    setOptions(skillMap[needTypeId]); // Update options when needTypeId changes
  }, [needTypeId]);

  const [manualSkill, setManualSkill] = useState("");
  const handleManualSkillAdd = (e) => {
    if (e.key === "Enter" && manualSkill.trim() !== "") {
      // Create a new skill object and add it to the selectedOptions array
      const newSkill = { label: manualSkill, value: manualSkill };
      setSelectedOptions([...selectedOptions, newSkill]);

      // Clear the manualSkill input field
      setManualSkill("");
    }
  };

  //handle skills details change
  const [selectedOptions, setSelectedOptions] = useState([]);
  const handleChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);
  };
  const styleTokenInput = {
    control: (provided) => ({
      ...provided,
      minHeight: "30px",
      padding: "0px",
    }),
    multiValue: (provided, state) => {
      const color = state.data.color || "#ccc";
      return {
        ...provided,
        backgroundColor: "#FAFAFA",
        borderRadius: "3px",
      };
    },
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#99999F", //text color for token label
      padding: "0px 6px",
    }),
    multiValueRemove: (provided, state) => ({
      ...provided,
      color: "#99999F",
      ":hover": {
        backgroundColor: "#FAFAFA",
        color: "black",
      },
    }),
  };

  // format as per API request body
  const [dataToPost, setDataToPost] = useState({
    needRequest: {},
    needRequirementRequest: {},
  });
  useEffect(() => {
    setDataToPost({ needRequest: data, needRequirementRequest: dataOther });
  }, [data, dataOther]);
  useEffect(() => {
    setDataOther({ ...dataOther, occurrence: dataOccurrence });
  }, [dataOccurrence]);

  useEffect(() => {
    setDataOccurrence((prevState) => ({
      ...prevState,
      startDate: startYMD + "T09:00:00.000Z",
      endDate: endYMD + "T09:00:00.000Z",
    }));
  }, [startYMD, endYMD]);

  useEffect(() => {
    setDataOccurrence((prevState) => ({
      ...prevState,
      timeSlots: selectedDays,
      days: selectedDays.map((day) => day.day).join(","),
    }));
  }, [selectedDays]);

  useEffect(() => {
    setDataOther((dataOther) => ({
      ...dataOther,
      skillDetails: selectedOptions.map((obj) => obj.value).join(", "),
    }));
  }, [selectedOptions]);

  // raise the need
  const submitHandler = (e) => {
    e.preventDefault();
    // Concatenate Need Name and Entity Name for purpose and description
    const entityObj = entities.find((entype) => entype.id === entityId);
    const entityName = entityObj ? entityObj.name : "";
    const concatText = `${name} ${entityName}`;
    const updatedData = {
      ...data,
      needPurpose: concatText,
      description: concatText,
    };
    const updatedDataToPost = { ...dataToPost, needRequest: updatedData };
    console.log(updatedDataToPost);
    console.log(selectedDays);
    axios
      .post(`${configData.NEED_POST}`, updatedDataToPost)
      .then(function (response) {
        console.log("posted sucessfully", response);
        dispatch(fetchNeedsByUid(uid));
        gotoNeeds();
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const gotoNeeds = (selectedOptions) => {
    history.push("/needs");
  };

  return (
    <div className="wrapRaiseNeed row">
      <div className="raiseNeed col-10 offset-1 col-sm-8 offset-sm-2">
        {/* top bar of raise need page */}
        <div className="raiseNeedBar">
          <div className="wrapNameNeed">
            <div className="needName"> Need </div>
            <div className="tagNeedName">
              {" "}
              A detailed description about the Need
            </div>
          </div>
          <button className="btnRaiseNeed" type="submit" form="myForm">
            {" "}
            Raise Need{" "}
          </button>
        </div>
        {/* form to fill need details to raise a need*/}
        <form className="raiseNeedForm" id="myForm" onSubmit={submitHandler}>
          {/* upper side of form: need info*/}
          <div className="formRNcatergory">NEED INFO</div>
          <div className="formTop row">
            {/* left half of upper side*/}
            <div className="formLeft col-sm-6">
              {/* Need Name */}
              <div className="itemFormNeed">
                <label>
                  Need Name <span class="required-label"></span>
                </label>
                <input
                  type="text"
                  placeholder="Format: Grade Subject, Ex: Grade 5 Science"
                  name="name"
                  value={name}
                  onChange={changeHandler}
                  required
                />
              </div>
              {/* Need Purpose */}
              {/*
              <div className="itemFormNeed">
                <label>
                  Need Purpose<span class="required-label"></span>
                </label>
                <input
                  type="text"
                  placeholder="Provide the impact or purpose of this Need"
                  name="needPurpose"
                  required
                  value={needPurpose}
                  onChange={changeHandler}
                />
              </div>
              */}
              {/* Need Type */}
              <div className="itemFormNeed">
                <label>
                  Need Type<span class="required-label"></span>
                </label>
                <select
                  className="selectMenu"
                  name="needTypeId"
                  value={needTypeId}
                  required
                  onChange={changeHandler}
                >
                  <option value="" disabled>Select Need Type</option>
                  {needTypes.map((ntype) => (
                    <option key={ntype.id} value={ntype.id}>
                      {ntype.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* right half of upper side */}
            <div className="formRight col-sm-6">
              {/* Entity Name */}
              <div className="itemFormNeed">
  <label>
    Entity Name<span className="required-label"></span>
  </label>
  <select
    className="selectMenu"
    name="entityId"
    value={entityId}
    required
    onChange={changeHandler}
  >
    <option value="" defaultValue>
      Select Entity
    </option>
    {entities &&
      entities.map((entype) => (
        <option key={entype.osid} value={entype.id}>
          {entype.name}
        </option>
      ))}
  </select>

  {/* Show message if entity list is empty */}
  {entities && entities.length === 0 && (
    <div className="no-entities-message">
      Please onboard your entity in the previous screen to Raise Need
    </div>
  )}
</div>

              {/* Need Description */}
              {/*
              <label className="itemDescriptionNeedLabel">
                Need Description
              </label>
              <div className="itemDescriptionNeed">
                <ReactQuill
                  className="quillEdit"
                  modules={module}
                  theme="snow"
                  value={description}
                  placeholder="Write a small brief about the Need"
                  onChange={handleQuillEdit}
                />
              </div>
              */}
            </div>
          </div>

          <div className="formRNcatergory">SESSION DETAILS</div>
          {/* Session Dates Section */}
          <div className="session-section">
            <div className="session-subheading">Session Dates</div>
            <div className="session-helper">Select the start and end dates for the session. These define the overall period during which the session can occur.</div>
            <div className="itemWrapDate">
              <div className="itemDate">
                <label>
                  Session Start Date <span className="required-label"></span>
                </label>
                <input
                  type="date"
                  name="startYMD"
                  value={startYMD}
                  required
                  onChange={handleStartDate}
                />
                <div className="date-format-display">Selected: {startYMD ? startYMD.split('-').reverse().join('-') : ''}</div>
              </div>
              <div className="itemDate">
                <label>
                  Session End Date <span className="required-label"></span>
                </label>
                <input
                  type="date"
                  name="endYMD"
                  value={endYMD}
                  required
                  onChange={handleEndDate}
                />
                <div className="date-format-display">Selected: {endYMD ? endYMD.split('-').reverse().join('-') : ''}</div>
              </div>
            </div>
          </div>

          {/* Session Schedule Section */}
          <div className="session-section">
            <div className="session-subheading">Session Schedule</div>
            <div className="session-helper">Specify the days and times for the session. You can add multiple slots if needed.</div>
            <div className="itemFormTime">
              <div className="label-eventdaytime">
                <label className="day-label">Event Days</label>
                <label className="time-label">Start Time</label>
                <label className="time-label">End Time</label>
              </div>
              <div className="itemSelectSlots">
                {frequency === "off" ? (
                  <MultiSelect
                    onAdd={handleSelectedDaysChange}
                    scheduleTime={scheduleTime}
                  />
                ) : (
                  <MonoSelect
                    onAdd={handleSelectedDaysChange}
                    frequency={reccurrence}
                    scheduleTime={scheduleTime}
                  />
                )}
              </div>
              {/* Session summary */}
              <div className="session-summary">
                <strong>Summary:</strong> {selectedDays && selectedDays.length > 0
                  ? selectedDays.map((slot, idx) => `${slot.day} (${slot.startTime?.slice(11,16)} - ${slot.endTime?.slice(11,16)})`).join(", ")
                  : "No session slots selected yet."}
              </div>
            </div>
          </div>

          {/* lower side of form : prerequisites */}
          {/* <div className="formRNcatergory">VOLUNTEER PREREQUISITE</div> */}
          {/* <div className="formBottom row"> */}
          {/*   <div className="formBLeft col-sm-6"> */}
          {/*     <div className="itemFormNeed"> */}
          {/*       <label>Skills Required</label> */}
          {/*       <div className="tokenInput"> */}
          {/*         <Select */}
          {/*           isMulti */}
          {/*           value={selectedOptions} */}
          {/*           options={options} */}
          {/*           onChange={handleChange} */}
          {/*           styles={styleTokenInput} */}
          {/*         /> */}
          {/*         <input */}
          {/*           type="text" */}
          {/*           placeholder="Add Skills " */}
          {/*           value={manualSkill} */}
          {/*           onChange={(e) => setManualSkill(e.target.value)} */}
          {/*           onKeyDown={handleManualSkillAdd} */}
          {/*           className="addSkillsInput" */}
          {/*         /> */}
          {/*       </div> */}
          {/*     </div> */}
          {/*   </div> */}
          {/*   <div className="formBRight col-sm-6"> */}
          {/*     <div className="itemFormNeed"> */}
          {/*       <label>No. of Volunteers required</label> */}
          {/*       <input */}
          {/*         className="inpVolunteerNum" */}
          {/*         type="text" */}
          {/*         placeholder="Mention Number of Volunteers" */}
          {/*         name="volunteersRequired" */}
          {/*         value={volunteersRequired} */}
          {/*         onChange={changeHandlerOther} */}
          {/*       /> */}
          {/*     </div> */}
          {/*   </div> */}
          {/* </div> */}
        </form>
      </div>
      {/* Close button */}
      <div className="btnClose">
        <button onClick={gotoNeeds}>X</button>
      </div>
    </div>
  );
};

export default RaiseNeed;

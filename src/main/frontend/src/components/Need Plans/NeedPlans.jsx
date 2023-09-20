import React, { useState } from "react";
import "./NeedPlans.css";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventsSideBar from "./EventsSideBar/EventsSideBar";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EventIcon from "@mui/icons-material/Event";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
//import * as needPlansActions from "../../redux/features/needplans/actions";
import { bindActionCreators } from "redux";
//import * as selector from "../../redux/features/needplans/selectors";

function NeedPlans() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selSlotInfo, setSelSlotInfo] = React.useState(null);

  // using selectors to get data from redux, here state is the redux global state 
  // const { needs } = useSelector(
  //   (state) => ({
  //     needs: selector.getData(state), 
  //   }),
  //   shallowEqual, // makes sure that the component rerenders only when the above redux state data changes (avoids unnecessary rerenders)
  // );

  // this function helps us to dispatch actions which will trigger reducers/sagas
  const dispatch = useDispatch();

  // binds the actions creators with dispatch. Action creators return action object
  // const bindedActions = bindActionCreators({ ...needPlansActions }, dispatch);
  const bindedActions = {}
  const mockEvents = [
    {
      title: "Elderly Support",
      start: new Date(2023, 7, 29, 9, 0, 0),
      end: new Date(2023, 7, 29, 10, 0, 0),
      color: "blue", 
    },
    {
        title: "Temple Premise Cleaning",
        start: new Date(2023, 7, 30, 9, 0, 0),
        end: new Date(2023, 7, 30, 10, 0, 0),
        color: "red", 
    },
    {
        title: "Prasad Preparation",
        start: new Date(2023, 7, 31, 9, 0, 0),
        end: new Date(2023, 7, 31, 10, 0, 0),
        color: "red", 
    },
    {
      title: "Prasad Preparation",
      start: new Date(2023, 8, 1, 15, 0, 0),
      end: new Date(2023, 8, 1, 16, 0, 0),
      color: "blue", 
    },
    {
      title: "Temple Premise Cleaning",
      start: new Date(2023, 8, 2, 9, 0, 0),
      end: new Date(2023, 8, 2, 9, 0, 0),
      color: "blue", 
    },
    {
        title: "Temple Premise Cleaning",
        start: new Date(2023, 8, 3, 9, 0, 0),
        end: new Date(2023, 8, 3, 3, 0, 0),
        color: "blue", 
      },
      {
          title: "Prasad Preparation",
          start: new Date(2023, 8, 4, 9, 0, 0),
          end: new Date(2023, 8, 4, 10, 0, 0),
          color: "red", 
      },
      {
          title: "Translation and Support",
          start: new Date(2023, 8, 5, 9, 0, 0),
          end: new Date(2023, 8, 5, 10, 0, 0),
          color: "red", 
      },
      {
        title: "Prasad Preparation",
        start: new Date(2023, 8, 6, 15, 0, 0),
        end: new Date(2023, 8, 6, 16, 0, 0),
        color: "blue", 
      },
      {
        title: "Translation and Support",
        start: new Date(2023, 8, 7, 9, 0, 0),
        end: new Date(2023, 8, 7, 10, 0, 0),
        color: "blue", 
      },{
        title: "Elderly Support",
        start: new Date(2023, 8, 8, 9, 0, 0),
        end: new Date(2023, 8, 8, 10, 0, 0),
        color: "blue", 
      },
      {
          title: "Temple Premise Cleaning",
          start: new Date(2023, 8, 9, 9, 0, 0),
          end: new Date(2023, 8, 9, 10, 0, 0),
          color: "red", 
      },
      {
          title: "Temple Premise Cleaning",
          start: new Date(2023, 8, 10, 9, 0, 0),
          end: new Date(2023, 8, 10, 10, 0, 0),
          color: "red", 
      },
      {
        title: "Mentoring",
        start: new Date(2023, 8, 11, 15, 0, 0),
        end: new Date(2023, 8, 11, 16, 0, 0),
        color: "blue", 
      },
      {
        title: "Elderly Support",
        start: new Date(2023, 8, 12, 9, 0, 0),
        end: new Date(2023, 8, 12, 10, 0, 0),
        color: "blue", 
      },
      {
        title: "Translation and Support",
        start: new Date(2023, 8, 13, 9, 0, 0),
        end: new Date(2023, 8, 13, 10, 0, 0),
        color: "blue", 
      },
      {
          title: "Event 2",
          start: new Date(2023, 8, 13, 11, 0, 0),
          end: new Date(2023, 8, 13, 12, 0, 0),
          color: "red", 
      },
      {
          title: "Event 3",
          start: new Date(2023, 8, 14, 9, 0, 0),
          end: new Date(2023, 8, 14, 10, 0, 0),
          color: "red", 
      },
      {
        title: "Event 4",
        start: new Date(2023, 8, 15, 15, 0, 0),
        end: new Date(2023, 8, 15, 16, 0, 0),
        color: "blue", 
      },
      {
        title: "Event 5",
        start: new Date(2023, 8, 15, 9, 0, 0),
        end: new Date(2023, 8, 15, 10, 0, 0),
        color: "blue", 
      },
  ];

  const localizer = dayjsLocalizer(dayjs);

  // Custom event style getter
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color, // Set the background color dynamically
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style,
    };
  };

  function dateHandler(date, flag) {
    const modifiedDate = new Date(date);
    switch (flag) {
      case "+":
        modifiedDate.setMonth(modifiedDate.getMonth() + 1);
        break;
      case "-":
        modifiedDate.setMonth(modifiedDate.getMonth() - 1);
        break;
      default:
        break;
    }
    console.log(date, "date here");
    console.log(modifiedDate, "check here");
    setCurrentDate(modifiedDate);
  }

  const handleSelectEvent = (event, e) => {
    // Handle the selection of an event
    console.log("Selected event:", JSON.stringify(event));
    setSelectedDate(event.start);
    setSelSlotInfo(event.start);
    // Perform any additional logic or dispatch actions
    // based on the selected event
  };

  const handleDrillDown = (date, view) => {
    // Handle the click on the "More" link
    console.log("Drill down date:", date);
    console.log("Drill down view:", view);
    setSelectedDate(date);
    setSelSlotInfo(date);
  };

  const onSelectSlot = (slotInfo) => {
    setSelSlotInfo(slotInfo.start);
    setSelectedDate(slotInfo.start);
    console.log(slotInfo, "slotInfo");
  }; // onSelectSlot

  const dateCellWrapper = ({ children, value }) => {
    const styleObject = { backgroundColor: "lightpink" };
    return (
      <div
        style={
          dayjs(value).isSame(dayjs(selSlotInfo), "day") ? styleObject : {}
        }
        className={children.props.className}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="wrapNeeds">
      <div className="needPlansGrid">
        <div className="calendar">
          <div>
            <div>
              <span style={{ float: "left", width: "8%", marginRight: "1%" }}>
                {currentDate.toLocaleString("default", { month: "long" })}
              </span>
              <span style={{ float: "left", width: "5%", marginRight: "1%" }}>
                {currentDate.getFullYear()}
              </span>
            </div>
            <div style={{ float: "left" }}>
              <button
                className="changeMonthButton"
                type="button"
                onClick={() => dateHandler(currentDate, "-")}
              >
                <ArrowBackIosNewIcon
                  style={{ fontSize: "smaller", margin: "5px 0px 3px 0px" }}
                />
              </button>
              <button
                className="changeMonthButton"
                type="button"
                onClick={() => dateHandler(currentDate, "+")}
              >
                <ArrowForwardIosIcon
                  style={{ fontSize: "smaller", margin: "5px 0px 3px 0px" }}
                />
              </button>
            </div>
          </div>
          <br style={{ clear: "both" }} />
          <div className="box">
            <div className="content">
              <div className="label">
                <VisibilityIcon
                  style={{
                    fontSize: "small",
                    paddingRight: "0.5vw",
                    color: "#888",
                  }}
                />
                Needs
              </div>
              <div className="value">565</div>
            </div>
            <div className="content">
              <div className="label">
                <VisibilityIcon
                  style={{
                    fontSize: "small",
                    paddingRight: "0.5vw",
                    color: "#888",
                  }}
                />
                Volunteers
              </div>
              <div className="value">565</div>
            </div>
            <button
              onClick={() =>
                bindedActions.setNeeds([{ action1: "" }, { action2: "" }])
              }
            >
              dispatch
            </button>
            <button onClick={() => bindedActions.getNeeds()}>get needs</button>
          </div>
          <br style={{ clear: "both" }} />
          <div style={{ height: "95vh" }}>
            {/* <p>look here {JSON.stringify(needs)}</p> */}
            <Calendar
              localizer={localizer}
              events={mockEvents}
              toolbar={false}
              startAccessor="start"
              date={currentDate}
              step={50}
              endAccessor="end"
              style={{ height: 500 }}
              views={{ month: true }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              onDrillDown={handleDrillDown}
              components={{
                dateCellWrapper: dateCellWrapper,
              }}
              selectable
              onSelectSlot={onSelectSlot}
            />
          </div>
        </div>
        <div className="events">
          {selectedDate ? (
            <EventsSideBar selectedDate={selectedDate} />
          ) : (
            <div
              style={{
                height: "80vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <EventIcon
                style={{
                  fontSize: "150px",
                  margin: "auto auto 0 auto",
                  color: "#c4c4c4",
                }}
              />
              <span style={{ margin: "0 auto auto auto" }}>
                Select a date to display the needs
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NeedPlans;

import React from "react";
import "./EventsSideBar.css";
import EventCard from "../EventCard/EventCard";
import dayjs from "dayjs";
import EventBusyIcon from "@mui/icons-material/EventBusy";

function EventsSideBar(props) {
  const { selectedDate } = props;
  const options = { weekday: "long", day: "numeric", year: "numeric" };

  const mockEvents = [
    {
      title: "Event 1",
      start: new Date(2023, 6, 10, 9, 0, 0),
      end: new Date(2023, 6, 10, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
    },
    {
      title: "Event 4",
      start: new Date(2023, 6, 10, 15, 0, 0),
      end: new Date(2023, 6, 10, 16, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Hagrid", "Ginny"],
    },
    {
      title: "Event 5",
      start: new Date(2023, 6, 12, 9, 0, 0),
      end: new Date(2023, 6, 12, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Cedric", "Malfoy"],
    },
    {
      title: "Event 2",
      start: new Date(2023, 6, 15, 9, 0, 0),
      end: new Date(2023, 6, 15, 10, 0, 0),
      color: "red", // Custom property to define the color
      volunteers: ["Tom", "Lucy"],
    },
  ];

  const todayEvents = mockEvents.filter((x) =>
    dayjs(x.start).isSame(dayjs(selectedDate), "day"),
  );

  return (
    <div className="events">
      <div className="title">
        Needs | {new Date(selectedDate).toLocaleDateString("en-US", options)}
      </div>
      <div>
        {console.log("sidebar", todayEvents)}
        {todayEvents.length === 0 ? (
          <div
            style={{ height: "80vh", display: "flex", flexDirection: "column" }}
          >
            <EventBusyIcon
              style={{
                fontSize: "150px",
                margin: "auto auto 0 auto",
                color: "#c4c4c4",
              }}
            />
            <span style={{ margin: "0 auto auto auto" }}>
              No event on this day
            </span>
          </div>
        ) : (
          // todayEvents.map((ev) => <EventCard event={{startTime: ev.start, endTime:ev.end, title: ev.title, address: 'event address'}}/> )
          todayEvents.map((ev) => <EventCard ev={ev} />)
        )}
      </div>
    </div>
  );
}

export default EventsSideBar;

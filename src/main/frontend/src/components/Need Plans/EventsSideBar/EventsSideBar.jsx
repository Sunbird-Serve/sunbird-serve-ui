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
      title: "Elderly Support",
      start: new Date(2023, 7, 29, 9, 0, 0),
      end: new Date(2023, 7, 29, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Ava Bytefield", "Max Code", "Axel Neon"],
      address: "UP, Ayodhya",
    },
    {
      title: "Event 2",
      start: new Date(2023, 7, 30, 9, 0, 0),
      end: new Date(2023, 7, 30, 10, 0, 0),
      color: "red",
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Prasad Preparation",
      start: new Date(2023, 7, 31, 9, 0, 0),
      end: new Date(2023, 7, 31, 10, 0, 0),
      color: "blue",
      volunteers: ["Ava Bytefield", "Max Code", "Axel Neon"],
      address: "UP, Ayodhya",
    },
    {
      title: "Prasad Preparation",
      start: new Date(2023, 8, 1, 15, 0, 0),
      end: new Date(2023, 8, 1, 16, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Ava Bytefield", "Ankit Verma", "Sachin Mehta"],
      address: "UP, Ayodhya",
    },
    {
      title: "Event 5",
      start: new Date(2023, 8, 2, 9, 0, 0),
      end: new Date(2023, 8, 2, 9, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 1",
      start: new Date(2023, 8, 3, 9, 0, 0),
      end: new Date(2023, 8, 3, 3, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 2",
      start: new Date(2023, 8, 4, 9, 0, 0),
      end: new Date(2023, 8, 4, 10, 0, 0),
      color: "red",
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 3",
      start: new Date(2023, 8, 5, 9, 0, 0),
      end: new Date(2023, 8, 5, 10, 0, 0),
      color: "red",
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 4",
      start: new Date(2023, 8, 6, 15, 0, 0),
      end: new Date(2023, 8, 6, 16, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 5",
      start: new Date(2023, 8, 7, 9, 0, 0),
      end: new Date(2023, 8, 7, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 1",
      start: new Date(2023, 8, 8, 9, 0, 0),
      end: new Date(2023, 8, 8, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 2",
      start: new Date(2023, 8, 9, 9, 0, 0),
      end: new Date(2023, 8, 9, 10, 0, 0),
      color: "red",
    },
    {
      title: "Event 3",
      start: new Date(2023, 8, 10, 9, 0, 0),
      end: new Date(2023, 8, 10, 10, 0, 0),
      color: "red",
    },
    {
      title: "Event 4",
      start: new Date(2023, 8, 11, 15, 0, 0),
      end: new Date(2023, 8, 11, 16, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 5",
      start: new Date(2023, 8, 12, 9, 0, 0),
      end: new Date(2023, 8, 12, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 1",
      start: new Date(2023, 8, 13, 9, 0, 0),
      end: new Date(2023, 8, 13, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
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
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
    {
      title: "Event 5",
      start: new Date(2023, 8, 15, 9, 0, 0),
      end: new Date(2023, 8, 15, 10, 0, 0),
      color: "blue", // Custom property to define the color
      volunteers: ["Harry", "Hermoine", "Ron"],
      address: "Nungambakkam, Chennai",
    },
  ];

  const todayEvents = mockEvents.filter((x) =>
    dayjs(x.start).isSame(dayjs(selectedDate), "day")
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
          // iterating events and displaying them in event cards
          todayEvents.map((ev) => <EventCard ev={ev} />)
        )}
      </div>
    </div>
  );
}

export default EventsSideBar;

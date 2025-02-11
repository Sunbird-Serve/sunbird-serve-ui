import VolunteerNeedsNominated from "../../assets/needsNominated.png";
import VolunteerNeedsInProgress from "../../assets/needsInProgress.png";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
import VolunteerPlansDelivered from "../../assets/plansDelivered.png";
import totalNeedsCreated from "../../assets/totalNeedsCreated.png";
import newVolunteers from "../../assets/newVolunteers.png";

export const matrixData = [
  {
    icon: totalNeedsCreated,
    count: 200,
    status: "Total Needs Created",
  },
  {
    icon: VolunteerNeedsInProgress,
    count: 8,
    status: "Needs in Progress",
  },
  {
    icon: VolunteerNeedsNominated,
    count: 24,
    status: "Needs Requested",
  },
];
export const matrixDataRow2 = [
  {
    icon: VolunteerNeedsApproved,
    count: 12,
    status: "Needs Approved",
  },
  {
    icon: VolunteerPlansDelivered,
    count: 280,
    status: "Total Volunteers",
  },
  {
    icon: newVolunteers,
    count: 80,
    status: "New Volunteers",
  },
];

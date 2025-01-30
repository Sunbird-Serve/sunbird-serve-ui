import VolunteerNeedsNominated from "../../assets/needsNominated.png";
import VolunteerNeedsInProgress from "../../assets/needsInProgress.png";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
import VolunteerPlansDelivered from "../../assets/plansDelivered.png";

export const matrixData = [
  {
    icon: VolunteerNeedsNominated,
    count: 200,
    status: "Total Needs Created",
  },
  {
    icon: VolunteerNeedsInProgress,
    count: 8,
    status: "Needs in Progress",
  },
  {
    icon: VolunteerNeedsApproved,
    count: 24,
    status: "Needs Requested",
  },
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
    icon: VolunteerNeedsInProgress,
    count: 80,
    status: "New Volunteers",
  },
];

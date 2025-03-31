import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import NeedCard from "../../components/CommonComponents/NeedCard";
import VolunteerNeedsInProgress from "../../assets/needsInProgress.png";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
import VolunteerNeedsNominated from "../../assets/needsNominated.png";
import AddIcon from "@mui/icons-material/Add";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import { FaSort } from "react-icons/fa";
import VCoordinatorDetails from "./VCoordinatorDetails";
import { useSelector } from "react-redux";
import AddAgency from "../../components/AssignAgency/AddAgency";
import axios from "axios";
import configData from "../../configure";
import RegistrationSection from "../../components/RegistrationByLink/RegistrationLink";
const Agency = () => {
  const [rowData, setRowData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAgencyPopup, setshowAddAgencyPopup] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [updateAgencyList, setUpdateAgencyList] = useState(false);
  const [agencyDetailsError, setAgencyDetailsError] = useState("");

  // const userList = useSelector((state) => state.userlist.data);
  // const vCoordinatorList = useMemo(() => {
  //   return userList.filter((item) => item.role.includes("vCoordinator"));
  // }, [userList]);

  // console.log("vCoordinatorList", vCoordinatorList);
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isVAdmin = userRole?.[0] === "vAdmin" ? true : false;
  const isSAdmin = userRole?.[0] === "sAdmin" ? true : false;

  const AgencyData = [
    {
      icon: VolunteerNeedsNominated,
      count: 10,
      status: "Total Registered Agencies",
    },
    {
      icon: VolunteerNeedsInProgress,
      count: 300,
      status: "Total Registered Volunteers",
    },
    {
      icon: VolunteerNeedsApproved,
      count: 20,
      status: "Total Volunteer Coordinators",
    },
  ];

  useEffect(() => {
    if (isSAdmin) {
      const getAgencies = async () => {
        try {
          const response = await axios.get(
            `${configData.SERVE_VOLUNTEERING}/agency/list`
          );
          const agencies = response?.data;
          setAgencies(agencies);
        } catch (error) {
          console.log(error);
        }
      };
      getAgencies();
    }
  }, [updateAgencyList]);

  useEffect(() => {
    if (isVAdmin) {
      const getAgencyDetails = async () => {
        try {
          const res = await axios.get(
            `${configData.SERVE_VOLUNTEERING}/agency/${userData.agencyId}`
          );
          const agencies = res?.data;
          setAgencies(agencies);
        } catch (error) {
          console.log(error);
          setAgencyDetailsError(
            "Agency not found! Please contact your administrator!"
          );
        }
      };
      getAgencyDetails();
    }
  }, []);

  const handleUpdateAgencyList = () => {
    setUpdateAgencyList((prev) => !prev);
  };

  const COLUMNS = [
    { Header: "Agency Name", accessor: "name" },
    { Header: "Email ID", accessor: "contactDetails.email" },
    { Header: "Phone", accessor: "contactDetails.mobile" },

    { Header: "Agency Type", accessor: "agencyType" },
  ];

  if (isSAdmin) {
    COLUMNS.push({
      Header: "Registration Link",
      accessor: "osid",
      Cell: ({ value }) => {
        return (
          <Box
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <RegistrationSection agencyId={value} />
          </Box>
        );
      },
    });
  }
  if (isVAdmin) {
    COLUMNS.push(
      { Header: "City", accessor: "contactDetails.address.village" },
      {
        Header: "Website",
        accessor: "website",
        Cell: ({ value }) => {
          return (
            <a href={value} target="blank">
              {value}
            </a>
          );
        },
      }
    );
  }

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => agencies, [agencies]);

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

  const handleRowClick = (rowData) => {
    setRowData(rowData);
    setShowPopup(!showPopup);
  };

  const handleAddAgency = () => {
    setshowAddAgencyPopup(!showAddAgencyPopup);
  };

  return (
    <Box padding={"1rem"}>
      <Box
        padding={"1rem"}
        gap={"0.5rem"}
        display={"flex"}
        width={"100%"}
        justifyContent={"space-between"}
      >
        <Box>
          <Typography variant="body1" color="text.secondary">
            Here's your Agencies Data
          </Typography>
        </Box>
        <Box marginRight={"2rem"}>
          {isSAdmin && (
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={handleAddAgency}
            >
              {" "}
              <AddIcon /> Add Agency
            </Button>
          )}
        </Box>
      </Box>
      {isSAdmin && (
        <Box padding={"0.5rem 0"}>
          <NeedCard matrixData={AgencyData} />
        </Box>
      )}
      <Box paddingTop={"1rem"}>
        <table className="tableNeedList">
          <thead>
            {headerGroups?.map((headerGroup) => (
              <tr {...headerGroup?.getHeaderGroupProps()}>
                {headerGroup?.headers.map((column) => (
                  <th
                    {...column?.getHeaderProps(column?.getSortByToggleProps())}
                  >
                    {column?.render("Header")}
                    <span>
                      <FaSort />
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.length > 0 ? (
              page?.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row?.getRowProps()}
                    onClick={() => handleRowClick(row?.original)}
                  >
                    {row?.cells.map((cell) => {
                      return (
                        <td
                          {...cell?.getCellProps()}
                          style={{ width: cell?.column?.width }}
                        >
                          {" "}
                          {cell?.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  {agencyDetailsError}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      {showPopup && (
        <VCoordinatorDetails
          handlePopupClose={handleRowClick}
          // data={rowData}
          agencyID={rowData?.osid}
          agencyName={rowData?.name}
          // onStatusUpdate={handleStatusUpdate}
        />
      )}
      {showAddAgencyPopup && (
        <AddAgency
          handlePopupClose={handleAddAgency}
          onAgencyAdded={handleUpdateAgencyList}
        />
      )}
    </Box>
  );
};

export default Agency;

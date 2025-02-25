import React, { useMemo, useState } from "react";
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
import { data } from "./data";
import AddAgency from "../../components/AssignAgency/AddAgency";
const Agency = () => {
  const [rowData, setRowData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAgencyPopup, setshowAddAgencyPopup] = useState(false);
  // const userList = useSelector((state) => state.userlist.data);
  // const vCoordinatorList = useMemo(() => {
  //   return userList.filter((item) => item.role.includes("vCoordinator"));
  // }, [userList]);

  // console.log("vCoordinatorList", vCoordinatorList);

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

  const COLUMNS = [
    { Header: "Agency Name", accessor: "name" },
    { Header: "Email ID", accessor: "email" },
    { Header: "Phone", accessor: "mobile" },
    { Header: "City", accessor: "city" },
    { Header: "Status", accessor: "status" },
  ];

  const columns = useMemo(() => COLUMNS, []);
  // const data = useMemo(() => vCoordinatorList, [vCoordinatorList]);

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
          <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={handleAddAgency}
          >
            {" "}
            <AddIcon /> Add Agency
          </Button>
        </Box>
      </Box>
      <Box padding={"0.5rem 0"}>
        <NeedCard matrixData={AgencyData} />
      </Box>
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
            {page?.map((row) => {
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
            })}
          </tbody>
        </table>
      </Box>

      {showPopup && (
        <VCoordinatorDetails
          handlePopupClose={handleRowClick}
          // data={rowData}
          // osid={rowData.osid}
          // onStatusUpdate={handleStatusUpdate}
        />
      )}
      {showAddAgencyPopup && <AddAgency handlePopupClose={handleAddAgency} />}
    </Box>
  );
};

export default Agency;

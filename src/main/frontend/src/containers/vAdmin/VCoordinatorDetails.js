import React, { useMemo, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import { FaSort } from "react-icons/fa";
import { useSelector } from "react-redux";
import RegistrationSection from "../../components/RegistrationByLink/RegistrationLink";
import AssignAgency from "../../components/AssignAgency/AgencyToVAdmin";
import axios from "axios";
import Loader from "../../components/CommonComponents/Loader";
import configData from "../../configure";

const VCoordinatorDetails = ({ handlePopupClose, agencyId }) => {
  const [value, setValue] = useState("1");
  const [rowData, setRowData] = useState(null);
  const [vCoordinatorList, setVCoordinatorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const userList = useSelector((state) => state.userlist.data);
  const vCordinatorList = useMemo(() => {
    return userList.filter((item) => item.role.includes("vCoordinator"));
  }, [userList]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const getVCoordinatorList = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${configData.USER_GET}/agencyId?agencyId=${agencyId}`
        );
        setVCoordinatorList(res?.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) getVCoordinatorList();
  }, [agencyId]);

  console.log("vCordinatorList", vCordinatorList);
  console.log("vCoordinatorList", vCoordinatorList);

  const COLUMNS = [
    { Header: "VCo-ordinator Name", accessor: "identityDetails.fullname" },
    { Header: "Email ID", accessor: "contactDetails.email" },
    { Header: "Phone", accessor: "contactDetails.mobile" },
    { Header: "City", accessor: "contactDetails.address.city" },
    { Header: "Status", accessor: "status" },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => vCoordinatorList || [], [vCoordinatorList]);

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
    // setShowPopup(!showPopup);
  };

  return (
    <Modal show={true}>
      <Modal.Header closeButton onHide={handlePopupClose}>
        <Modal.Title>Volunteer Co-ordinators Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", width: "20rem" }}>
            <TabList
              onChange={handleTabChange}
              aria-label="lab API tabs example"
            >
              <Tab
                label="VCo-ordinator List"
                value="1"
                sx={{ textTransform: "none" }}
              />
              <Tab
                label="Assign Agency"
                value="2"
                sx={{ textTransform: "none" }}
              />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Box paddingTop={"1rem"}>
              <table className="tableNeedList">
                <thead>
                  {headerGroups?.map((headerGroup) => (
                    <tr {...headerGroup?.getHeaderGroupProps()}>
                      {headerGroup?.headers.map((column) => (
                        <th
                          {...column?.getHeaderProps(
                            column?.getSortByToggleProps()
                          )}
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{ textAlign: "center" }}
                      >
                        <Loader />
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{ textAlign: "center" }}
                      >
                        No Data Found
                      </td>
                    </tr>
                  ) : (
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
                  )}
                </tbody>
              </table>
            </Box>
            <Box paddingTop={"2rem"}>
              <RegistrationSection agencyId={agencyId} />{" "}
            </Box>
          </TabPanel>
          <TabPanel value="2">
            <Box>
              <AssignAgency label={"select Co-ordinator"} />
            </Box>
          </TabPanel>
        </TabContext>
      </Modal.Body>
    </Modal>
  );
};

export default VCoordinatorDetails;

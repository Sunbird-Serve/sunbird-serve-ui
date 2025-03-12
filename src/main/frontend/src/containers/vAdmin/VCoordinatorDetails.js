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
import { useDispatch, useSelector } from "react-redux";
import RegistrationSection from "../../components/RegistrationByLink/RegistrationLink";
import AssignAgency from "../../components/AssignAgency/AgencyToVAdmin";
import axios from "axios";
import Loader from "../../components/CommonComponents/Loader";
import configData from "../../configure";
import { fetchUserList } from "../../state/userListSlice";

const VCoordinatorDetails = ({ handlePopupClose, agencyId }) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState("1");
  const [rowData, setRowData] = useState(null);
  const [vCoordinatorList, setVCoordinatorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateUserlist, setUpdateUserlist] = useState(false);
  const userList = useSelector((state) => state.userlist.data);

  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch, updateUserlist]);

  const vCordinatorList = useMemo(() => {
    return userList.filter(
      (item) =>
        item.role[0] === "vCoordinator" &&
        !item.agencyId &&
        !item.agencyId.trim() !== ""
    );
  }, [userList, dispatch, updateUserlist]);

  console.log("vCordinatorList", vCordinatorList);

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
        const vCoordinators =
          res?.data?.filter((item) => item.role[0] === "vCoordinator") || [];
        setVCoordinatorList(vCoordinators);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) getVCoordinatorList();
  }, [agencyId]);

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

  const handleAgencyAssignSuccess = () => {
    setTimeout(() => {
      handlePopupClose();
      setUpdateUserlist(true);
    }, 1000);
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
              <AssignAgency
                label={"select Co-ordinator"}
                vCoordinatorList={vCordinatorList}
                agencyId={agencyId}
                onAgencyAssignSuccess={handleAgencyAssignSuccess}
              />
            </Box>
          </TabPanel>
        </TabContext>
      </Modal.Body>
    </Modal>
  );
};

export default VCoordinatorDetails;

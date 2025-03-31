import React, { useMemo, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Alert, Box, Button, Snackbar } from "@mui/material";
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

const VCoordinatorDetails = ({ handlePopupClose, agencyID, agencyName }) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState("1");
  const [rowData, setRowData] = useState(null);
  const [vCoordinatorList, setVCoordinatorList] = useState([]);
  const [assignCoordinatorsList, setAssignCoordinatorsList] = useState([]);
  const [unassignCoordinatorsList, setUnassignCoordinatorsList] = useState([]);
  const [agencyList, setAgencyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [updateUserlist, setUpdateUserlist] = useState(false);

  const userList = useSelector((state) => state.userlist.data);
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isVAdmin = userRole?.[0] === "vAdmin" ? true : false;
  const isSAdmin = userRole?.[0] === "sAdmin" ? true : false;

  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch, updateUserlist]);

  const unassignedCoordinators = useMemo(() => {
    return userList.filter((item) => {
      const isUnassigned = !item.agencyId || item.agencyId.trim() === "";
      const isVC = item.role?.[0] === "vCoordinator";
      const isNC = item.role?.[0] === "nCoordinator";
      return isUnassigned && (isVC || isNC);
    });
  }, [userList]);

  console.log("unassignedCoordinators", unassignedCoordinators);
  useEffect(() => {
    setUnassignCoordinatorsList(unassignedCoordinators);
  }, [unassignedCoordinators]);

  const adminList = useMemo(() => {
    return userList.filter(
      (item) =>
        (item.role[0] === "vAdmin" || item.role[0] === "nAdmin") &&
        !item.agencyId &&
        !item.agencyId?.trim() !== ""
    );
  }, [userList, dispatch, updateUserlist]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const getVCoordinatorList = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${configData.USER_GET}/agencyId?agencyId=${agencyID}`
        );
        const vCoordinators =
          res?.data?.filter((item) => item.role[0] === "vCoordinator") || [];
        const nCoordinators =
          res?.data?.filter((item) => item.role[0] === "nCoordinator") || [];
        setVCoordinatorList(vCoordinators);
        setAssignCoordinatorsList([...vCoordinators, ...nCoordinators]);
        console.log("assignCoordinators", [...vCoordinators, ...nCoordinators]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (agencyID) getVCoordinatorList();
  }, [agencyID, openSnackbar]);

  useEffect(() => {
    const getAgencies = async () => {
      try {
        const response = await axios.get(
          `${configData.SERVE_VOLUNTEERING}/agency/list`
        );
        const agencies = response?.data;
        // console.log(agencies);
        setAgencyList(agencies);
      } catch (error) {
        console.log(error);
      }
    };
    getAgencies();
  }, []);

  const COLUMNS = [
    { Header: "Co-ordinator Name", accessor: "identityDetails.fullname" },
    { Header: "Email ID", accessor: "contactDetails.email" },
    { Header: "Phone", accessor: "contactDetails.mobile" },
    { Header: "City", accessor: "contactDetails.address.city" },
    { Header: "Role", accessor: "role" },
    { Header: "Status", accessor: "status" },
  ];
  if (isVAdmin) {
    COLUMNS.push({
      Header: "Action ",
      accessor: "agencyId",

      Cell: ({ row }) => {
        const { original } = row;
        const agency = agencyList?.find(
          (agency) => agency.id === original.agencyId
        );

        if (!agency) {
          return (
            <div className="vAvatars-container">
              <Button
                variant="contained"
                size="small"
                color="success"
                sx={{ textTransform: "none", padding: "1px 8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  // handleAssignAgency(original);
                }}
              >
                Assign Agency
              </Button>
            </div>
          );
        }

        return <Box>{agency?.name}</Box>;
      },
    });
  }
  if (isSAdmin) {
    COLUMNS.push({
      Header: "Action ",
      accessor: "agencyId",
      Cell: ({ row, value }) => {
        const { original } = row;
        if (!value || value === "" || value !== agencyID) {
          return (
            <div className="vAvatars-container">
              <Button
                variant="contained"
                size="small"
                color="success"
                sx={{ textTransform: "none", padding: "1px 8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignAgency(original);
                }}
              >
                Assign Agency
              </Button>
            </div>
          );
        }

        return <Box color={"green"}>Assigned</Box>;
      },
    });
  }

  const columns = useMemo(() => COLUMNS, []);
  const data1 = useMemo(() => {
    const assigned = Array.isArray(assignCoordinatorsList)
      ? assignCoordinatorsList
      : [];
    const unassigned = Array.isArray(unassignCoordinatorsList)
      ? unassignCoordinatorsList
      : [];
    return [...assigned, ...unassigned];
  }, [assignCoordinatorsList, unassignCoordinatorsList]);

  const data2 = useMemo(() => adminList || [], [adminList]);
  const data3 = useMemo(() => vCoordinatorList || [], [vCoordinatorList]);
  // console.log("vCoordinatorList", vCoordinatorList);
  console.log("adminList", adminList);

  // First table instance
  const tableInstance1 = useTable(
    {
      columns,
      data: data1,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Second table instance
  const tableInstance2 = useTable(
    {
      columns,
      data: data2,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  const tableInstance3 = useTable(
    {
      columns,
      data: data3,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const renderTable = (tableInstance) => {
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      prepareRow,
      state,
      setGlobalFilter,
      setPageSize,
      canNextPage,
      canPreviousPage,
      nextPage,
      previousPage,
      pageOptions,
      gotoPage,
      pageCount,
      rows,
      setFilter,
    } = tableInstance;

    return (
      <table className="tableNeedList" {...getTableProps()}>
        <thead>
          {headerGroups?.map((headerGroup) => (
            <tr {...headerGroup?.getHeaderGroupProps()}>
              {headerGroup?.headers.map((column) => (
                <th {...column?.getHeaderProps(column?.getSortByToggleProps())}>
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
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                <Loader />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
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
    );
  };

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

  const handleAssignAgency = async (userData) => {
    console.log("userData", userData);
    try {
      const reqBody = {
        agencyId: agencyID,
        send: true,
      };
      const res = await axios.put(
        `${configData.UPDATE_USER}/${userData?.osid}`,
        reqBody
      );
      setOpenSnackbar(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <Modal show={true}>
        <Modal.Header closeButton onHide={handlePopupClose}>
          <Modal.Title>
            {isVAdmin
              ? "Volunteer Co-ordinators Details"
              : `Assign to ${agencyName}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TabContext value={value}>
            <Box
              sx={{ borderBottom: 1, borderColor: "divider", width: "20rem" }}
            >
              <TabList
                onChange={handleTabChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  label="Co-ordinators List"
                  value="1"
                  sx={{ textTransform: "none" }}
                />
                {isSAdmin && (
                  <Tab
                    label="Admins List"
                    value="2"
                    sx={{ textTransform: "none" }}
                  />
                )}
                {/* <Tab
                label="Assign Agency"
                value="2"
                sx={{ textTransform: "none" }}
              /> */}
              </TabList>
            </Box>
            <TabPanel value="1">
              {isVAdmin ? (
                <Box paddingTop={"1rem"}>{renderTable(tableInstance3)}</Box>
              ) : (
                <Box paddingTop={"1rem"}>{renderTable(tableInstance1)}</Box>
              )}
              {/* <Box paddingTop={"2rem"}>
              <RegistrationSection agencyId={agencyId} />{" "}
            </Box> */}
            </TabPanel>
            {/* {isSAdmin && ( */}
            <TabPanel value="2">
              {/* <Box>
              <AssignAgency
                title={"Assign Agency"}
                label={"select Co-ordinator"}
                vCoordinatorList={vCordinatorList}
                agencyId={agencyId}
                onAgencyAssignSuccess={handleAgencyAssignSuccess}
              />
            </Box> */}
              <Box paddingTop={"1rem"}>{renderTable(tableInstance2)}</Box>
            </TabPanel>
            {/* )} */}
          </TabContext>
        </Modal.Body>
      </Modal>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" variant="filled">
          Agency assigned successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VCoordinatorDetails;

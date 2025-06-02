import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { Box, Button, Typography } from "@mui/material";
import AddEntity from "../AssignEntity/AddEntity";
import AssignAgency from "../AssignAgency/AgencyToVAdmin";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import Loader from "../../components/CommonComponents/Loader";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import { FaSort } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserList } from "../../state/userListSlice";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import configData from "../../configure";

const EntityModal = ({
  isEdit,
  entityData,
  entityId,
  needAdminId,
  handlePopupClose,
  onEntityUpdate,
  nCordAssignSuccess,
  isSAdmin,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [entityNcordList, setEntityNcordList] = useState([]);
  const [value, setValue] = useState("1");
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const userList = useSelector((state) => state.userlist.data);
  const nCoordiatorList = useMemo(() => {
    return userList.filter((item) => item.role.includes("nCoordinator"));
  }, [userList]);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchUserList());
  }, [dispatch]);

  useEffect(() => {
    if (userList.length > 0) {
      setLoading(false);
    }
  }, [userList]);
  useEffect(() => {
    const getEntityUserList = async () => {
      try {
        const res = await axios.get(
          `${configData.SERVE_NEED}/userList/${entityId}`
        );
        // Showing all users (coordinator + admin)
        setEntityNcordList(res?.data?.content);
      } catch (error) {
        console.log(error);
      }
    };
    getEntityUserList();
  }, [entityId, nCordAssignSuccess]);

  const COLUMNS = [
    { Header: "Name", accessor: "identityDetails.fullname" },
    { Header: "Email ID", accessor: "contactDetails.email" },
    { Header: "Phone", accessor: "contactDetails.mobile" },
    {
      Header: "Action",
      accessor: "osid",
      Cell: ({ row }) => {
        return (
          <Box display="flex" justifyContent="center">
            {row.original.isAssigned ? (
              <Typography color="green">Assigned</Typography>
            ) : (
              <Button
                variant="contained"
                sx={{ textTransform: "none", marginRight: "2rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  assignEntity(row.original.osid);
                }}
              >
                Assign
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data1 = useMemo(() => {
    return nCoordiatorList.map((user) => ({
      ...user,
      isAssigned: entityNcordList.some(
        (entityUser) => entityUser.userId === user.osid
      ),
    }));
  }, [nCoordiatorList, entityNcordList]);

  const data2 = useMemo(() => {
    const updatedList = entityNcordList.map((item) =>
      userList.find((user) => user.osid === item.userId)
    );

    return updatedList.map((user) => ({
      ...user,
      isAssigned: entityNcordList.some(
        (entityUser) => entityUser.userId === user.osid
      ),
    }));
  }, [userList, entityNcordList]);

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

    const { globalFilter, pageIndex, pageSize } = state;
    return (
      <>
        <Box
          marginBottom={"0.5rem"}
          display={"flex"}
          justifyContent={"flex-end"}
        >
          <Box className="boxSearchNeeds">
            <i>
              <SearchIcon style={{ height: "18px", width: "18px" }} />
            </i>
            <input
              type="search"
              name="globalfilter"
              placeholder=" Search User"
              value={globalFilter || ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            ></input>
          </Box>
        </Box>
        <table className="tableNeedList" {...getTableProps()}>
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
        <div className="pageNav">
          <div className="needsPerPage">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 15, 25].map((pageSize, index) => (
                <option key={index} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <span>
            Go to
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const pageNumber = e.target.value
                  ? Number(e.target.value) - 1
                  : 0;
                gotoPage(pageNumber);
              }}
              style={{ width: "50px" }}
            />
            page
          </span>

          <div className="pageNumber">
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {" "}
              <ArrowBackIosIcon style={{ height: "18px" }} />
            </button>
            <span>
              {" "}
              Page
              <strong>{pageIndex + 1}</strong>
              of {pageOptions.length}
            </span>
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              <ArrowForwardIosIcon style={{ height: "18px" }} />
            </button>
          </div>
        </div>
      </>
    );
  };

  const handleRowClick = (rowData) => {};

  const assignEntity = async (nCordId) => {
    try {
      const regReq = {
        entityId: entityId,
        userId: nCordId,
        userRole: "nCoordinator",
      };

      const entityOnboarding = await axios.post(
        `${configData.SERVE_NEED}/entity/assign`,
        regReq
      );
      nCordAssignSuccess();
    } catch (error) {
      console.log(error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      {isEdit ? (
        <Modal show={true}>
          <Modal.Header closeButton onHide={handlePopupClose}>
            <Modal.Title>
              Edit Entity
              {/* {isEdit ? "Edit Entity" : "Assign Need Co-ordinators"} */}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* {isEdit ? ( */}
            <AddEntity
              isEdit={isEdit}
              entityDetails={entityData}
              entityId={entityId}
              needAdminId={needAdminId}
              handlePopupClose={handlePopupClose}
              onEntityUpdate={onEntityUpdate}
              isSAdmin={isSAdmin}
            />
            {/* ) : (
              <Box>
                <AssignAgency
                  title={"Assign Entity"}
                  label={"select the Need Co-ordinator"}
                  vCoordinatorList={[]}
                  agencyId={""}
                  //   onAgencyAssignSuccess={handleAgencyAssignSuccess}
                />
              </Box>
            )} */}
          </Modal.Body>
        </Modal>
      ) : (
        <Modal show={true}>
          <Modal.Header closeButton onHide={handlePopupClose}>
            <Modal.Title>
              {" "}
              Assign Entity to Need Co-ordinator and Admin
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Box>
              <TabContext value={value}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    width: "20rem",
                  }}
                >
                  <TabList
                    onChange={handleTabChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab
                      label="Need Co-ordinators List"
                      value="1"
                      sx={{ textTransform: "none" }}
                    />
                    <Tab
                      label="Users List"
                      value="2"
                      sx={{ textTransform: "none" }}
                    />
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <Box>{renderTable(tableInstance1)}</Box>
                </TabPanel>
                <TabPanel value="2">
                  <Box>{renderTable(tableInstance2)}</Box>
                </TabPanel>
              </TabContext>
            </Box>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default EntityModal;

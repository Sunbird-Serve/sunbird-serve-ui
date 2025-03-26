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
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import { FaSort } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserList } from "../../state/userListSlice";
import configData from "../../configure";

const EntityModal = ({
  isEdit,
  entityData,
  entityId,
  needAdminId,
  handlePopupClose,
  onEntityUpdate,
  nCordAssignSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const userList = useSelector((state) => state.userlist.data);

  const nCoordiatorList = useMemo(() => {
    return userList.filter((item) => item.role.includes("nCoordinator"));
  }, [userList]);

  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch]);

  const COLUMNS = [
    { Header: "Co-ordinator Name", accessor: "identityDetails.fullname" },
    { Header: "Email ID", accessor: "contactDetails.email" },
    { Header: "Phone", accessor: "contactDetails.mobile" },
    {
      Header: "Action",
      accessor: "osid",
      Cell: ({ value }) => {
        return (
          <Box display={"flex"} justifyContent={"center"}>
            <Button
              variant="contained"
              sx={{ textTransform: "none", marginRight: "2rem" }}
              onClick={(e) => {
                e.stopPropagation();
                assignEntity(value);
              }}
            >
              Assign
            </Button>
          </Box>
        );
      },
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => nCoordiatorList, [nCoordiatorList]);

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
  const { globalFilter, pageIndex, pageSize } = state;

  const handleRowClick = (rowData) => {};

  const assignEntity = async (nCordId) => {
    console.log(nCordId);
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
            <Modal.Title> Assign Entity to Need Co-ordinators</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Box>
              <Box
                margin={"0.5rem"}
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
                    placeholder=" Search nCo-ordinator"
                    value={globalFilter || ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  ></input>
                </Box>
              </Box>
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
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
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
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default EntityModal;

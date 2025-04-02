import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { Box, Button, Typography } from "@mui/material";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import { FaSort } from "react-icons/fa";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import FilterBy from "../CommonComponents/FilterBy";
const configData = require("../../configure");

const RegisterEntity = ({
  handlePopupClose,
  needAdminId,
  entityAssignSuccess,
}) => {
  const [allEntities, setAllEntities] = useState([]);
  const [statusUpdated, setStatusUpdated] = useState(false);

  // const statuses = ["New", "Active", "Verified", "Inactive"];

  // const handleFilterChange = (selectedFilters) => {
  // console.log("Selected Filters:", selectedFilters);
  // setFilteredByEnitity(selectedFilters);
  // dispatch(setFilteredData(selectedFilters));
  // };
  useEffect(() => {
    const getEntityDetails = async () => {
      try {
        const response = await axios.get(
          `${configData.SERVE_NEED}/entity/all?page=0&size=100`
        );
        const entities = response.data?.content;
        // ?.filter(
        //   (entity) => entity.status === "Active"
        // );
        setAllEntities(entities);
        console.log(entities);
      } catch (error) {
        console.log(error);
      }
    };
    getEntityDetails();
  }, [statusUpdated]);

  const COLUMNS = [
    { Header: "Entity Name", accessor: "name" },
    { Header: "Phone Number", accessor: "mobile" },
    { Header: "Block", accessor: "address_line1" },
    { Header: "District", accessor: "district" },
    { Header: "Status", accessor: "status" },
    {
      Header: "Action",
      accessor: "id",
      Cell: ({ row }) => {
        const { status, id } = row.original;

        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            {status === "Verified" ? (
              <Typography>Assigned</Typography>
            ) : (
              <Button
                variant="contained"
                sx={{ textTransform: "none", marginRight: "2rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  assignEntity(id);
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
  const data = useMemo(() => allEntities, [allEntities]);

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

  const assignEntity = async (entityId) => {
    console.log("Assigning entity: ", entityId);
    try {
      const regReq = {
        entityId: entityId,
        userId: needAdminId,
        userRole: "nAdmin",
      };

      const entityOnboarding = await axios.post(
        `${configData.SERVE_NEED}/entity/assign`,
        regReq
      );

      const reqBody = {
        status: "Verified",
      };
      const res = await axios.put(
        `${configData.SERVE_NEED}/entity/edit/${entityId}`,
        reqBody
      );
      setStatusUpdated(!statusUpdated);
      entityAssignSuccess();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal show={true}>
      {/* <Box sx={style}> */}
      <Modal.Header closeButton onHide={handlePopupClose}>
        <Modal.Title>Register Your Entity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Box>
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Box
              className="boxSearchNeeds"
              margin={"0.3rem"}
              display={"flex"}
              justifyContent={"flex-end"}
            >
              <i>
                <SearchIcon style={{ height: "18px", width: "18px" }} />
              </i>
              <input
                type="search"
                name="globalfilter"
                placeholder="Search need"
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
        </Box>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterEntity;

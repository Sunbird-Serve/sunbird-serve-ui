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
const configData = require("../../configure");

const OnboardEntity = ({ handlePopupClose }) => {
  const [allEntities, setAllEntities] = useState([]);

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
  }, []);

  const COLUMNS = [
    { Header: "Entity Name", accessor: "name" },
    { Header: "Volunteer", accessor: "" },
    { Header: "Phone", accessor: "mobile" },
    { Header: "City", accessor: "address_line1" },
    { Header: "Entity Category", accessor: "category" },
    // {
    //   Header: "Website",
    //   accessor: "website",
    //   Cell: ({ value }) => {
    //     return (
    //       <a href={value} target="blank">
    //         {value}
    //       </a>
    //     );
    //   },
    // },
    {
      Header: "Action",
      accessor: "id",
      Cell: ({ value }) => {
        return (
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            onClick={(e) => {
              e.stopPropagation();
              //   editEntity(value);
            }}
          >
            <Button
              variant="contained"
              sx={{ textTransform: "none", marginRight: "2rem" }}
            >
              Onboard
            </Button>
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

  const handleRowClick = (rowData) => {};

  return (
    <Modal show={true}>
      {/* <Box sx={style}> */}
      <Modal.Header closeButton onHide={handlePopupClose}>
        <Modal.Title>Onboard Entity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
    </Modal>
  );
};

export default OnboardEntity;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import { FaSort } from "react-icons/fa";
import EntityModal from "../../components/CommonComponents/EntityModal";
import VCoordinatorDetails from "../vAdmin/VCoordinatorDetails";
import AddEntity from "../../components/AssignEntity/AddEntity";
import { Modal } from "react-bootstrap";
import RegisterEntity from "../../components/AssignEntity/RegisterEntity";
import { Snackbar, Alert } from "@mui/material";
import { useSelector } from "react-redux";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
const configData = require("../../configure");

const Entity = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [entities, setEntities] = useState([]);
  const [edit, setEdit] = useState(false);
  const [entityData, setEntityData] = useState(null);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [entityAssign, setEntityAssign] = useState(false);
  const [entityId, setEntityId] = useState("");
  const [showRegisterEntity, setShowRegisterEntity] = useState(false);
  const [assignEntityToNcord, setAssignEntityToNcord] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isNAdmin = userRole?.[0] === "nAdmin" ? true : false;
  const isSAdmin = userRole?.[0] === "sAdmin" ? true : false;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (isNAdmin) {
      const getEntityDetails = async () => {
        try {
          if (userId) {
            const response = await axios.get(
              `${configData.ENTITY_DETAILS_GET}/${userId}?page=0&size=1000`
            );
            const entitie = response.data?.content?.filter(
              (entity) => entity.status !== "Inactive"
            );
            setEntities(entitie);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getEntityDetails();
    }
  }, [userId, openSnackbar]);

  useEffect(() => {
    if (isSAdmin) {
      const getEntityDetails = async () => {
        try {
          const response = await axios.get(
            `${configData.SERVE_NEED}/entity/all?page=0&size=1000`
          );
          const entities = response.data?.content;
          // ?.filter(
          //   (entity) => entity.status === "Active"
          // );
          setEntities(entities);
        } catch (error) {
          console.log(error);
        }
      };
      getEntityDetails();
    }
  }, []);

  const COLUMNS = [
    { Header: "Entity Name", accessor: "name" },
    { Header: "Phone", accessor: "mobile" },
    { Header: "Block", accessor: "address_line1" },
    { Header: "Entity Category", accessor: "category" },
    {
      Header: "Status",
      accessor: "status",
    },
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
              editEntity(value);
            }}
          >
            <ModeEditIcon className="edit-icon" />
          </Box>
        );
      },
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => entities, [entities]);

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

  const handleRowClick = (rowData) => {
    setEntityId(rowData?.id);
    setEdit(false);
    setShowPopup(!showPopup);
  };

  const editEntity = (entityId) => {
    setEdit(true);
    setShowPopup(!showPopup);
    const entityDetails = entities?.filter((entity) => entity.id === entityId);
    setEntityData(entityDetails);
    setEntityId(entityId);
  };

  const handleAddEntity = () => {
    setShowAddEntity(!showAddEntity);
  };

  const handleRegisterEntity = () => {
    setShowRegisterEntity(true);
  };

  const onEnityCreated = () => {
    setOpenSnackbar(!openSnackbar);
    setEdit(false);
    setEntityAssign(false);
    setAssignEntityToNcord(false);
  };

  const handleEntityUpdate = () => {
    setOpenSnackbar(!openSnackbar);
    setEdit(true);
    setEntityAssign(false);
    setAssignEntityToNcord(false);
  };
  const OnEntityAssignSuccess = () => {
    setOpenSnackbar(!openSnackbar);
    setEntityAssign(true);
    setAssignEntityToNcord(false);
  };

  const handleAssignEntityToNcord = () => {
    setAssignEntityToNcord(true);
    setOpenSnackbar(!openSnackbar);
    setEdit(false);
    setEntityAssign(false);
  };

  return (
    <div>
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
              Your Entity Details
            </Typography>
          </Box>
          <Box marginRight={"2rem"}>
            {!isSAdmin && (
              <Button
                variant="outlined"
                sx={{ textTransform: "none", marginRight: "2rem" }}
                onClick={handleRegisterEntity}
              >
                {" "}
                Register Your Entity
              </Button>
            )}
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={handleAddEntity}
            >
              {" "}
              <AddIcon /> Add Entity
            </Button>
          </Box>
        </Box>
        <Box display={"flex"} justifyContent={"flex-start"}>
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
              placeholder="Search Entity"
              value={globalFilter || ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            ></input>
          </Box>
        </Box>
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

          <div className="pageNav">
            <div className="needsPerPage">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 15, 25].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
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
      </Box>

      {/* {show && <EntityModal show={show} onClose={() => setShow(false)} />} */}
      {showPopup && (
        <EntityModal
          handlePopupClose={handleRowClick}
          data={entityData}
          isEdit={edit}
          entityId={entityId}
          needAdminId={userId}
          onEntityUpdate={handleEntityUpdate}
          nCordAssignSuccess={handleAssignEntityToNcord}
          isSAdmin={true}
        />
      )}

      {showAddEntity && (
        <Modal show={true}>
          {/* <Box sx={style}> */}
          <Modal.Header closeButton onHide={() => setShowAddEntity(false)}>
            <Modal.Title>Add Entity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddEntity
              onEntityAdded={onEnityCreated}
              handlePopupClose={() => setShowAddEntity(false)}
              needAdminId={userId}
            />
          </Modal.Body>
        </Modal>
      )}

      {showRegisterEntity && (
        <RegisterEntity
          handlePopupClose={() => setShowRegisterEntity(false)}
          needAdminId={userId}
          entityAssignSuccess={OnEntityAssignSuccess}
        />
      )}

      {openSnackbar && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert severity="success" variant="filled">
            {edit
              ? "Entity Updated successfully!"
              : entityAssign
              ? "Entity Assigned successfully!"
              : assignEntityToNcord
              ? "nCoordintor Assigned to Entity successfully!"
              : "Entity Created successfully!"}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default Entity;

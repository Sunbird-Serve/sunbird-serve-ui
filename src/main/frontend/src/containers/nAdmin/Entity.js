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
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const getEntityDetails = async () => {
      try {
        if (userId) {
          const response = await axios.get(
            `${configData.ENTITY_DETAILS_GET}/${userId}?page=0&size=100`
          );
          const entitie = response.data?.content?.filter(
            (entity) => entity.status !== "Inactive"
          );
          setEntities(entitie);
          console.log(entities);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getEntityDetails();
  }, [userId, openSnackbar]);
  console.log(entities);

  const COLUMNS = [
    { Header: "Entity Name", accessor: "name" },
    { Header: "Volunteer", accessor: "" },
    { Header: "Phone", accessor: "mobile" },
    { Header: "City", accessor: "address_line1" },
    { Header: "Entity Category", accessor: "category" },
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

  const handleRowClick = (rowData) => {
    setEdit(false);
    setShowPopup(!showPopup);
  };

  const editEntity = (entityId) => {
    console.log(entityId);
    setEdit(true);
    setShowPopup(!showPopup);
    const entityDetails = entities?.filter((entity) => entity.id === entityId);
    console.log("entityDetails", entityDetails);
    setEntityData(entityDetails);
    setEntityId(entityId);
  };

  const handleAddEntity = () => {
    setShowAddEntity(!showAddEntity);
  };

  const handleRegisterEntity = () => {
    console.log(showRegisterEntity);
    setShowRegisterEntity(true);
  };

  const onEnityCreated = () => {
    setOpenSnackbar(!openSnackbar);
    setEdit(false);
    setEntityAssign(false);
  };

  const handleEntityUpdate = () => {
    setOpenSnackbar(!openSnackbar);
    setEdit(true);
    setEntityAssign(false);
  };
  const OnEntityAssignSuccess = () => {
    setOpenSnackbar(!openSnackbar);
    setEntityAssign(true);
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
              Here's your Entities Data
            </Typography>
          </Box>
          <Box marginRight={"2rem"}>
            <Button
              variant="outlined"
              sx={{ textTransform: "none", marginRight: "2rem" }}
              onClick={handleRegisterEntity}
            >
              {" "}
              Register Your Entity
            </Button>
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
                : "Entity Created successfully!"}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default Entity;

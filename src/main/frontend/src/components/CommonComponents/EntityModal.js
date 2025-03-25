import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import AddEntity from "../AssignEntity/AddEntity";
import AssignAgency from "../AssignAgency/AgencyToVAdmin";
import { Box, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
const EntityModal = ({
  isEdit,
  data,
  entityId,
  needAdminId,
  handlePopupClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-60%, 40%)",
    width: isMobile ? "70%" : "50%",
    maxWidth: "500px",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: isMobile ? 2 : 3,
  };
  console.log("data", data);

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
              entityDetails={data}
              entityId={entityId}
              needAdminId={needAdminId}
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
        <Modal
          show={true}
          onClose={handlePopupClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <IconButton
              onClick={handlePopupClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "grey.600",
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Title */}
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              textAlign="center"
              fontSize={isMobile ? "1rem" : "1.25rem"}
            >
              Assign Entity to Need Co-ordinators
            </Typography>
            <Box>
              <AssignAgency
                title={"Assign Entity"}
                label={"select the Need Co-ordinator"}
                vCoordinatorList={[]}
                agencyId={""}
                //   onAgencyAssignSuccess={handleAgencyAssignSuccess}
              />
            </Box>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default EntityModal;

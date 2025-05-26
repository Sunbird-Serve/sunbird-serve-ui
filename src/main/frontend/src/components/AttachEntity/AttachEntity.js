import { Box, InputLabel, MenuItem, Select } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import configData from "../../configure";
import Loader from "../CommonComponents/Loader";
import "./AttachEntity.css";

function AttachEntity({ onClose, setOpenSnackbar, setSnackMessage, setSnackSeverity }) {

    const [entities, setEntities] = useState([])
    const [showLoader, setShowLoader] = useState(false)
    const [state, setState] = useState("")
    const [district, setDistrict] = useState("")
    const [block, setBlock] = useState("")
    const [entity, setEntity] = useState("")

    const userData = useSelector((state) => state.user.data);
    const userId = userData.osid
    const userRole = userData.role[0]


    const getEntities = () => {
        setShowLoader(true)
        axios.get(configData.ENTITY_GET_ALL).then(response => {
            if (response?.status === 200) {
                setEntities(response.data?.content)

            } else {
                setSnackSeverity("error")
                setSnackMessage("Failed to fetch entities.")
                setOpenSnackbar(true)
            }
            setShowLoader(false)
        }).catch(error => {
            console.error("Failed to fetch entities: ", error);
            setSnackSeverity("error")
            setSnackMessage("Failed to fetch entities.")
            setOpenSnackbar(true)
            setShowLoader(false)
        })
    }

    const attachEntity = () => {
        setShowLoader(true)
        const payload = { userId, userRole, entityId: entity }

        axios.post(configData.ENTITY_ATTACH, payload).then(response => {
            if (response.status === 201) {
                setSnackSeverity("success")
                setSnackMessage("Entity assigned successfully.")
                setOpenSnackbar(true)
                onClose()
            } else {
                setSnackSeverity("error")
                setSnackMessage("Failed to assign entity.")
                setOpenSnackbar(true)
            }
            setShowLoader(false)
        }).catch(error => {
            console.error("Failed to assign entity: ", error)
            setSnackSeverity("error")
            setSnackMessage("Failed to assign entity.")
            setOpenSnackbar(true)
            setShowLoader(false)
        })
    }

    useEffect(() => {
        getEntities()
    }, [])

    const getUniqueState = () => {
        return Array.from(new Set(entities.map(entity => entity.state)))
    }

    const getUniqueDistrict = () => {
        return Array.from(new Set(entities.filter(entity => entity.state === state).map(entity => entity.district)))
    }

    const getUniqueBlock = () => {
        return Array.from(new Set(entities.filter(entity => entity.state === state && entity.district === district).map(entity => entity.address_line1)))
    }

    const uniqueEntities = () => {
        return Array.from(new Set(entities.filter(entity => entity.state === state && entity.district === district && entity.address_line1 === block).map(entity => { return { value: entity.id, label: entity.name } })))
    }

    const onStateChange = value => {
        setState(value)
        onDistrictChange("")
    }

    const onDistrictChange = value => {
        setDistrict(value)
        onBlockCHange("")
    }

    const onBlockCHange = value => {
        setBlock(value)
        onEntityChange("")
    }

    const onEntityChange = value => {
        setEntity(value)
    }

    const onReset = () => {
        onStateChange("")
    }

    return (
        <>  
            {showLoader && <Loader fullPage /> }
            <Modal show>
                <Modal.Header>
                    <Modal.Title>Please select your entity</Modal.Title>
                    <Button onClick={onClose} variant="dark">X</Button>
                </Modal.Header>
                <Modal.Body>
                    <Box className="formEntries">
                        <Box className="formElement">
                            <InputLabel id="state-label" required>State</InputLabel>
                            <br />
                            <Select
                                margin="normal"
                                labelId="state-label"
                                value={state}
                                onChange={e => onStateChange(e.target.value)}
                                placeholder="Select state"
                                displayEmpty
                                renderValue={
                                    state !== "" ? undefined : () => "Select"
                                }
                            >
                                {getUniqueState().map(state => (
                                    <MenuItem value={state}>{state}</MenuItem>
                                ))}
                            </Select>
                        </Box>

                        <Box className="formElement">
                            <InputLabel id="district-label" required>District</InputLabel>
                            <br />
                            <Select
                                margin="normal"
                                labelId="district-label"
                                value={district}
                                onChange={e => onDistrictChange(e.target.value)}
                                displayEmpty
                                renderValue={
                                    district !== "" ? undefined : () => "Select"
                                }
                            >
                                {getUniqueDistrict().map(district => (
                                    <MenuItem value={district}>{district}</MenuItem>
                                ))}
                            </Select>
                        </Box>

                        <Box className="formElement">
                            <InputLabel id="block-label" required>Block</InputLabel>
                            <br />
                            <Select
                                margin="normal"
                                labelId="block-label"
                                value={block}
                                onChange={e => onBlockCHange(e.target.value)}
                                displayEmpty
                                renderValue={
                                    block !== "" ? undefined : () => "Select"
                                }
                            >
                                {getUniqueBlock().map(block => (
                                    <MenuItem value={block}>{block}</MenuItem>
                                ))}
                            </Select>
                        </Box>
                        <Box className="formElement">
                            <InputLabel id="entity-label" required>Entity</InputLabel>
                            <br />
                            <Select
                                margin="normal"
                                labelId="entity-label"
                                value={entity}
                                onChange={e => onEntityChange(e.target.value)}
                                displayEmpty
                                renderValue={
                                    entity !== "" ? undefined : () => "Select"
                                }
                            >
                                {uniqueEntities().map(entityObj => (
                                    <MenuItem value={entityObj.value} label={entityObj.label}>{entityObj.label}</MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>
                    <Box className="footer-button">
                        <Button variant="danger" onClick={onReset}>Reset</Button>
                        <Button disabled={entity === ""} onClick={attachEntity}>Save</Button>
                    </Box>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default AttachEntity;
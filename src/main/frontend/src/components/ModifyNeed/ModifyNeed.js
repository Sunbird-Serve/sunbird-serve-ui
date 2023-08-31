import React, { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill';
import axios from 'axios'
import './ModifyNeed.css' 
import { Redirect } from 'react-router'
import Nominations from '../Nominations/Nominations'
import UploadImageBG from '../../assets/bgImgUpload.png'
import configData from './../../configData.json'
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const ModifyNeed = props => {
    console.log(props.data)     //details of single need
    const [entityName, setEntityName] = useState(null);
    function EntityById( entityId ) {
           axios
             .get(`${configData.ENTITY_GET}/${entityId}`)
             .then((response) => {
               setEntityName(response.data.name);
             })
             .catch((error) => {
               console.error("Fetching Entity failed:", error);
             });
         return entityName || '';
    }
    const [needType, setNeedType] = useState(null);
    function NeedTypeById( needTypeId ) {
        axios
          .get(`${configData.NEEDTYPE_GET}/${needTypeId}`)
          .then((response) => {
            setNeedType(response.data.name);
          })
          .catch((error) => {
            console.error("Fetching Need Type failed:", error);
          });
       return needType || '';
    }

   const [nomin,setNomin] = useState(true)
   const [data,setData] = useState(null)
   
   useEffect(()=> {
        setData(props.data);
   },[props.data]);

   const [needRequirement,setNeedRequirement] = useState(null)
   useEffect(() => {
    if(data) {
    axios
      .get(`${configData.NEED_REQUIREMENT_GET}/${data.requirementId}`)
      .then((response) => {
         console.log(response.data)
         setNeedRequirement(response.data)
      })
      .catch((error) => {
        console.error("Fetching Entity failed:", error);
      });
    }
    }, [data]);
    console.log(needRequirement)

   var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{'list':'ordered'},{'list':'bullet'}]];
    const module = {
        toolbar: toolbarOptions,
    };
    const handleQuillEdit = (value) => {
        setData({...data, description:value})
    };

    const inputRef = useRef(null);
    const handleImageClick = () => {
        inputRef.current.click();
    };
    const [imageNeed, setImageNeed] = useState('')
    const handleImageUpload = (e) => {
        console.log(e.target.files)
        setImageNeed(e.target.files[0])
    }

    const changeHandler = e => {
        setData({...data, [e.target.name]:e.target.value})
    }

   const submitHandler = e => {
    e.preventDefault();
    console.log(data)
    }

    const [popupType, setPopupType] = useState(null)

    const openPopup = (type) => {
        setPopupType(type)
    }
    const closePopup = () => {
        setPopupType(null);
      };
    console.log(popupType)
    
  return (
    <div>
    <div className="wrapNeedNominations">
        {/* show list of nominations to need and need information*/}
        <div className="needNominations">
            <div className="wrapTabs">
                <button onClick={()=>setNomin(true)}><div className={nomin ? "ulTab" : null}>Nominations</div></button>
                <button onClick={()=>setNomin(false)}><div className={nomin ? null : "ulTab"}>Need Info</div></button>
            </div>
            { nomin ? 
                //load nominations component
                <Nominations data={props.data} openPopup={openPopup} /> 
            : ( 
                //load need information
                    <div className="needInfoBox">
                        <div className="needInfoBar">
                            <div className="wrapInfoName"> 
                                <div className="needIName">{data.name}</div>
                                <div className="needITag">{data.description.slice(3,-4)}</div>
                            </div>
                        </div>
                        <form className="needInfoForm row" id="modifyForm" onSubmit={submitHandler}>
                            <div className="catergoryNInfo">NEED INFO</div>
                            <div className="needIFormTop">
                                <div className="needInfoTopLeft col-sm-6">
                                    {/* 
                                    <div className="infoNImage">
                                            <label>Image</label>
                                            <div className="uploadNImage"> 
                                                <img src={UploadImageBG} alt=''/>
                                            </div>
                                    </div>
                                    */}
                                    <div className="itemNInfo">
                                            <label>Need Name</label>
                                            <span>{data.name}</span>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Purpose</label>
                                            <span>{data.needPurpose}</span>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Type</label>
                                            <span>{NeedTypeById(data.needTypeId)}</span>
                                    </div> 
                                </div>  
                                <div className="needInfoTopRight col-sm-6">
                                    <div className="itemNInfoDescrip">
                                        <label>Need Description</label>
                                        <span>{data.description.slice(3,-4)}</span>
                                    </div>
                                    {/* Entity Name */}
                                    <div className="itemNInfo">
                                        <label>Entity Name</label>
                                        <span>{EntityById(data.entityId)} </span>
                                    </div>
                                    {/* Date */}
                                    <div className="itemWrapNInfoDate">
                                        <div className="itemNInfoDate">
                                            <label>Start Date</label>
                                            <span>{needRequirement.startDate.substr(0,10)}</span>
                                        </div>
                                        <div className="itemNInfoDate">
                                            <label>End Date</label>
                                            <span>{needRequirement.endDate.substr(0,10)}</span>
                                        </div>
                                    </div>
                                    {/* Time */}
                                    {/*}
                                    <div className="itemNInfo">
                                        <label>Time</label>
                                        <span></span>
                                    </div> 
                                    */}
                                </div>                      
                            </div>           
                            <div className="catergoryNInfo">VOLUNTEER PREREQUISITE</div>                          
                            <div className="needIFormBottom row">
                                <div className="formBLeft col-sm-6">
                                    { /* Skills Required */}
                                    { data &&
                                     <div className="itemNInfo">
                                        <label>Skills Required</label>
                                        <span>{needRequirement.skillDetails}</span>
                                        {/*<span>{data.skillDetail.map(item => item.value)}</span> */}
                                    </div> }
                                </div>
                                <div className="formBRight col-sm-6">
                                    {/* No. of Volunteers Required */}
                                    <div className="itemNInfo">
                                        <label>No. of Volunteers required</label>
                                        <span>{needRequirement.volunteersRequired}</span>
                                    </div>
                                </div>
                            </div>
                            
                        </form>
                    </div>
                )}
        </div>   
        <div className="btnCloseNomination">
                <button onClick={props.handleClose}>x</button>
        </div>   
         
    </div>
    { popupType == 'accept' && (
    <div className="alertNomin"> 
        <span>
            <CheckIcon style={{height:"20px",width:"20px",borderRadius:"50%",backgroundColor:"#2F9346",padding:"2px",color:"#4D4D4D",margin:"2px 5px"}}/> 
            Nomination has been accepted successfully</span>
        <button onClick={closePopup}>x</button>
    </div>
    )}
    { popupType == 'reject' && (
    <div className="alertNomin"> 
        <span>
            <ClearIcon style={{height:"20px",width:"20px",borderRadius:"50%",backgroundColor:"red",padding:"2px",color:"#4D4D4D",margin:"2px 5px"}}/> 
            Nomination has been rejected</span>
        <button onClick={closePopup}>x</button>
    </div>
    )}
    </div>
  )
}

export default ModifyNeed
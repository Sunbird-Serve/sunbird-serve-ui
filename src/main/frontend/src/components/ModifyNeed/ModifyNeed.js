import React, { useState, useEffect, useRef } from 'react'
import './ModifyNeed.css' 
import Nominations from '../Nominations/Nominations'
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const ModifyNeed = props => {
    console.log(props.data)     //details of single need
    const [data,setData] = useState(null)
   
    useEffect(()=> {
         setData(props.data);
    },[props.data]);

    // Handle Nomination tab
    const [nomin,setNomin] = useState(true)
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
                <Nominations needData={props.data} openPopup={openPopup} /> 
            : ( 
                //load need information
                    <div className="needInfoBox">
                        <div className="needInfoBar">
                            <div className="wrapInfoName"> 
                                <div className="needIName">{data.need.name ? data.need.name : ''}</div>
                                <div className="needITag">{data.need.description ? data.need.description.slice(3,-4) : ''}</div>
                            </div>
                        </div>
                        <form className="needInfoForm row" id="modifyForm" >
                            <div className="catergoryNInfo">NEED INFO</div>
                            <div className="needIFormTop">
                                <div className="needInfoTopLeft col-sm-6">
                                    <div className="itemNInfo">
                                            <label>Need Name</label>
                                            <span>{data.need.name ? data.need.name : ''}</span>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Purpose</label>
                                            <span>{data.need.needPurpose ? data.need.needPurpose : ''}</span>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Type</label>
                                            <span>{data.needType.name ? data.needType.name : ''}</span>
                                    </div> 
                                </div>  
                                <div className="needInfoTopRight col-sm-6">
                                    <div className="itemNInfoDescrip">
                                        <label>Need Description</label>
                                        <span>{data.need.description ? data.need.description.slice(3,-4) : ''}</span>
                                    </div>
                                    {/* Entity Name */}
                                    <div className="itemNInfo">
                                        <label>Entity Name</label>
                                        <span>{data.entity.name ? data.entity.name : ''} </span>
                                    </div>
                                    {/* Date */}
                                    <div className="itemWrapNInfoDate">
                                        <div className="itemNInfoDate">
                                            <label>Start Date</label>
                                            <span>{data.occurrence ? data.occurrence.startDate.substr(0,10) : ''}</span>
                                        </div>
                                        <div className="itemNInfoDate">
                                            <label>End Date</label>
                                            <span>{data.occurrence ? data.occurrence.endDate.substr(0,10) : ''}</span>
                                        </div>
                                    </div>
                                </div>                      
                            </div>           
                            <div className="catergoryNInfo">VOLUNTEER PREREQUISITE</div>                          
                            <div className="needIFormBottom row">
                                <div className="formBLeft col-sm-6">
                                    { /* Skills Required */}
                                    { data &&
                                     <div className="itemNInfo">
                                        <label>Skills Required</label>
                                        <span>{data.needRequirement.skillDetails ? data.needRequirement.skillDetails : ''}</span>
                                        {/*<span>{data.skillDetail.map(item => item.value)}</span> */}
                                    </div> }
                                </div>
                                <div className="formBRight col-sm-6">
                                    {/* No. of Volunteers Required */}
                                    <div className="itemNInfo">
                                        <label>No. of Volunteers required</label>
                                        <span>{data.needRequirement.volunteersRequired ? data.needRequirement.volunteersRequired : ''}</span>
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
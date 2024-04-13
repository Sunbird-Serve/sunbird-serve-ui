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

    const [newData, setNewData] = useState({
        needTypeId: props.data.needType.id || '',      
        name: props.data.need.name || '',    
        needPurpose: props.data.need.needPurpose || '',
        description: props.data.need.description || '',     
        status: 'Approved',     
        userId: '',      
        entityId: '',
        startDate: '',
        endDate:'',
        platform: '',
        link:''
        //requirementId: '',       
    });
    const {needTypeId, name, needPurpose, description, status, userId, entityId, startDate, endDate, platform, link } = newData;
    const changeHandler = e => {
        setNewData({ ...newData, [e.target.name]: e.target.value })
    }


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

    const [modify, setModify] = useState(false)

    const handleModify = (e) => {
        console.log('modifying')
        setModify(!modify)
    }

    useEffect(()=> {
        //do update API call
   },[modify]);
    
  return (
    <div className="wrapModifyNeed">
    <div className="wrapNeedNominations">
        {/* show list of nominations to need and need information*/}
        <div className="needNominations">
            {/* Header for Tabs*/}
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
                            <div className="wrap-modify-button">
                                {!modify && <button className="modify-button" onClick={handleModify}>Modify</button>}
                                {modify && <button className="modify-button" onClick={handleModify}>Done</button>}
                            </div>
                        </div>
                        {/* Need info below */}
                        <form className="needInfoForm row" id="modifyForm" >
                            <div className="catergoryNInfo">NEED INFO</div>
                            <div className="needIFormTop">
                                <div className="needInfoTopLeft col-sm-6">
                                    <div className="itemNInfo">
                                            <label>Need Name</label>
                                            {!modify && <span>{data.need.name ? data.need.name : ''}</span>}
                                            {modify && <input type="text" name="name" value={name} onChange={changeHandler}/>}
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Type</label>
                                            {<span>{data.needType.name ? data.needType.name : ''}</span>}
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Purpose</label>
                                            {!modify && <span>{data.need.needPurpose ? data.need.needPurpose : ''}</span>}
                                            {modify && <input type="text" name="needPurpose" value={needPurpose} onChange={changeHandler}/>}
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Platform</label>
                                            {!modify && <span>Google Meet</span>}
                                            {modify && <input type="text" name="platform" value={platform} onChange={changeHandler}/>}

                                    </div>

                                </div>  
                                <div className="needInfoTopRight col-sm-6">
                                    <div className="itemNInfo">
                                        <label>Need Description</label>
                                        {!modify && <span>{data.need.description ? data.need.description.slice(3,-4) : ''}</span>}
                                        {modify && <input type="text" name="name" value={description} onChange={changeHandler}/>}
                                    </div>
                                    {/* Entity Name */}
                                    <div className="itemNInfo">
                                        <label>Entity Name</label>
                                        {<span>{data.entity.name ? data.entity.name : ''} </span>}
                                    </div>
                                    {/* Date */}
                                    <div className="itemNInfo">

                                    <div className="itemWrapNInfoDate">
                                        <div className="itemNInfoDate-modify">
                                            <label>Start Date</label>
                                            {!modify && <span>{data.occurrence ? data.occurrence.startDate.substr(0,10) : '-'}</span>}
                                            {modify && <input type="date" name="startYMD" value={startDate} onChange={changeHandler} />}
                                        </div>
                                        <div className="itemNInfoDate-modify">
                                            <label>End Date</label>
                                            {!modify && <span>{data.occurrence ? data.occurrence.endDate.substr(0,10) : '-'}</span>}
                                            {modify && <input type="date" name="endYMD" value={endDate} onChange={changeHandler} />}
                                        </div>
                                    </div>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Link</label>
                                            {!modify && <span> meet.google.com/xyz-abcd-pqr </span>}
                                            {modify && <input type="text" name="link" value={link} onChange={changeHandler} />}
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
                                        {<span>{data.needRequirement.skillDetails ? data.needRequirement.skillDetails : ''}</span>}
                                        {/*<span>{data.skillDetail.map(item => item.value)}</span> */}
                                    </div> }
                                </div>
                                <div className="formBRight col-sm-6">
                                    {/* No. of Volunteers Required */}
                                    <div className="itemNInfo">
                                        <label>No. of Volunteers required</label>
                                        {<span>{data.needRequirement.volunteersRequired ? data.needRequirement.volunteersRequired : ''}</span>}
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
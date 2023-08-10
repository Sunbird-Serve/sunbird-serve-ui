import React, { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill';
import axios from 'axios'
import './ModifyNeed.css' 
import { Redirect } from 'react-router'
import Nominations from '../Nominations/Nominations'
import UploadImageBG from '../../assets/bgImgUpload.png'

const ModifyNeed = props => {
    const [entityName, setEntityName] = useState(null);
    function EntityById( entityId ) {
           axios
             .get(`http://43.204.25.161:8081/api/v1/Entity/${entityId}`)
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
          .get(`http://ecs-integrated-239528663.ap-south-1.elb.amazonaws.com/api/v1/needtype/${needTypeId}`)
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

  return (
    <div className="wrapNeedNominations">
        {/* show list of nominations to need and need information*/}
        <div className="needNominations">
            <div className="wrapTabs">
                <button onClick={()=>setNomin(true)}><div className={nomin ? "ulTab" : null}>Nominations</div></button>
                <button onClick={()=>setNomin(false)}><div className={nomin ? null : "ulTab"}>Need Info</div></button>
            </div>
            { nomin ? 
                //load nominations component
                <Nominations data={props.data}/> 
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
                                    <div className="infoNImage">
                                            <label>Image</label>
                                            <div className="uploadNImage"> 
                                                <img src={UploadImageBG} alt=''/>
                                            </div>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Name</label>
                                            <span>{data.name}</span>
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Purpose</label>
                                            <span> </span>
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
                                        <span>{EntityById(data.entityId)}</span>
                                    </div>
                                    {/* Date */}
                                    <div className="itemWrapNInfoDate">
                                        <div className="itemNInfoDate">
                                            <label>Start Date</label>
                                            <span></span>
                                        </div>
                                        <div className="itemNInfoDate">
                                            <label>End Date</label>
                                            <span></span>
                                        </div>
                                    </div>
                                    {/* Time */}
                                    <div className="itemNInfo">
                                        <label>Time</label>
                                        <span></span>
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
                                        <span>{data.skillDetail.map(item => item.value)}</span>
                                    </div> }
                                </div>
                                <div className="formBRight col-sm-6">
                                    {/* No. of Volunteers Required */}
                                    <div className="itemNInfo">
                                        <label>No. of Volunteers required</label>
                                        <span></span>
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
  )
}

export default ModifyNeed
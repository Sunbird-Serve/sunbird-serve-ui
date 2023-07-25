import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill';
import axios from 'axios'
import './ModifyNeed.css' 
import { Redirect } from 'react-router'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddRemoveInputField from '../AddRemoveInputField/AddRemoveInputField';
import DeleteIcon from '@mui/icons-material/Delete';
import Nominations from '../Nominations/Nominations'

const ModifyNeed = props => {
   const [modify,setModify] = useState(true)
   const [data,setData] = useState(null)
   
   useEffect(()=> {
        setData(props.data);
   },[]);

   var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{'list':'ordered'},{'list':'bullet'}]];
    const module = {
        toolbar: toolbarOptions,
    };
    const handleQuillEdit = (value) => {
        setData({...data, description:value})
    };

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
            <div className="btnCloseNomination">
                <button onClick={props.handleClose}>x</button>
            </div>
            <div className="boxNominations">
                <div className="wrapTabs">
                    <div className={modify ? "underLine" : null}><button onClick={()=>setModify(true)}>Nominations</button></div>
                    <div className={modify ? null : "underLine"}><button onClick={()=>setModify(false)}>Need Details</button></div>
                </div>
                { modify ? 
                    <Nominations /> //load nominations component
                : ( 
                    // need informations display which can be modified as per access
                    <div className="needinfo">
                        <div className="modifyNeedBar">
                            <div className="wrapModifyName"> 
                                <div className="needName">{data.name}</div>
                                <div className="tagNeedName">{data.description.slice(3,-4)}</div>
                            </div>
                        </div>
                        <div className="modifyNeedForm"  >
                            <form className="needForm row" id="myForm" onSubmit={submitHandler}>
                                <div className="modifyTopForm row">
                                    <div className="modifyTopLeft col-sm-6">
                                        <div className="itemForm">
                                            <label>Need Name</label>
                                            <input type="text" placeholder={data.name} name="name" value={data.name} onChange={changeHandler} />
                                        </div>
                                        <div className="itemForm">
                                            <label>Need Type</label>
                                            <select className="selectMenu" name="needTypeId" value={data.needTypeId} onChange={changeHandler}>
                                            </select>
                                        </div> 
                                        <div className="itemForm">
                                            <label>Entity Name</label>
                                            <select className="selectMenu" name="entityId" value={data.entityId} onChange={changeHandler}>   
                                            </select>
                                        </div>
                                    </div>  
                                    <div className="modifyTopRight col-sm-6">
                                        <div className="itemDescrip">
                                            <label>Need Description</label>
                                            <div className="itemDescripText">
                                                <ReactQuill modules={module} theme="snow" placeholder={props.description} value={data.description} onChange={
                                                handleQuillEdit} className="quillEdit" />
                                            </div>   
                                        </div>
                                    </div>                      
                                </div>                           
                            </form>
                        </div>        
                    </div>
                )}
            </div>
        </div>        
    </div>
  )
}

export default ModifyNeed
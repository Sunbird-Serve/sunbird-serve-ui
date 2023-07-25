import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import './RaiseNeed.css' 
import { Redirect } from 'react-router'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddRemoveInputField from '../AddRemoveInputField/AddRemoveInputField';

const RaiseNeed = props => {
    const [openSkills,setOpenSkills] = useState(false);
    const [openPreRequisites,setOpenPreRequisites] = useState(false);

    // fields to enter in the raise need form
    const [data,setData] = useState({
        name: '',
        needTypeId: '',
        status: 'New',
        description: '',
        userId:'',
        entityId: '',
        skillDetail: '',
        prerequisiteDetail: ''
    });

    const {name, needTypeId, status, description, userId, entityId, skillDetail, prerequisiteDetail} = data;
    const {lname, ldiscrip} = skillDetail;
    const {occurence, volunteers, duration, priority, projectdetails} = prerequisiteDetail;
    const [dataNeedType,setDataNeedType] = useState([]);
    const [dataEntity,setDataEntity] = useState([]);
    const [dataPost,setDataPost] = useState({
        name: '',
        needTypeId: '',
        status: 'New',
        description: ''
    })

    {/* API calls to get list of need types and entities */}
    useEffect(()=> {
        /*
        axios.post('http://13.126.159.24:8081/api/v1/NeedType/search',{
            "offset": 0,
            "limit": 100,
            "filters": {
              "field_path": {
                "operators": "name"
              }
            }
          }).then(
          response => setDataNeedType(Object.values(response.data))
        )
        axios.post('http://13.126.159.24:8081/api/v1/Entity/search',{
            "offset": 0,
            "limit": 100,
            "filters": {
              "field_path": {
                "operators": "name"
              }
            }
          } ).then(
            function(response) {console.log(response.data)},
            response => setDataEntity(Object.values(response.data))
        )
        */

      },[])

    var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{'list':'ordered'},{'list':'bullet'}]];

    const module = {
        toolbar: toolbarOptions,
    };

    const handleQuillEdit = (value) => {
        setData({...data,description:value})
    };

    const changeHandler = e => {
        setData({...data,[e.target.name]:e.target.value})
    }

    const submitHandler = e => {
        e.preventDefault();
        console.log({data})
        axios.post('http://43.204.25.161:8081/api/v1/Need', data).then(
            ()=> {setHome(true)},
        ).catch(
            function (error) {console.log('error'); 
        }) 
    }
    const [home,setHome] = useState(false);

    if(home){
        return <Redirect to="/needs" />
    }

  return (
    <div className="wrapRaiseNeed row">
        <div className="raiseNeed col-10 offset-1">
            {/* Close button */}
            <div className="btnClose">
                <button onClick={props.handleClose}>x</button>
            </div> 
            {/* top bar of raise need page */}
            <div className="raiseNeedBar">
                <div className="wrapNameNeed"> 
                    <div className="needName">Untitled Need </div>
                    <div className="tagNeedName"> A detailed description about the Need</div>
                </div>
                <button className="btnRaiseNeed" type="submit" form="myForm"> Raise Need </button>
            </div>
            {/* form to fill need details to raise a need*/}
            <form className="raiseNeedForm" id="myForm" onSubmit={submitHandler}>
                {/* upper hald of form*/}
                <div className="formTop row">
                    {/* left half of upper side*/}
                    <div className="formLeft col-sm-6">
                        <div className="itemForm">
                            <label>Need Name</label>
                            <input type="text" placeholder='Ex. Avila Beach Cleaning' name="name" value={name} onChange={changeHandler} />
                        </div>
                        <div className="itemForm">
                            <label>Need Type</label>
                            <select className="selectMenu" name="needTypeId" value={needTypeId} onChange={changeHandler}>
                                <option value="" defaultValue>Select Need type</option>
                                {
                                    dataNeedType.map(
                                        (ntype) => <option value={ntype.id}>{ntype.name}</option>
                                    )
                                }
                            </select>
                        </div> 
                        <div className="itemForm">
                            <label>Entity Name</label>
                            <select className="selectMenu" name="entityId" value={entityId} onChange={changeHandler}>
                                <option value="" defaultValue>Select Need type</option>
                                {
                                    dataEntity.map(
                                        (entype) => <option value={entype.id}>{entype.name}</option>
                                    )
                                }
                            </select>
                        </div>                               
                    </div>  
                    {/* right half of upper side */}
                    <div className="formRight col-sm-6">
                        <div className="itemForm">
                            <label>Need Description</label>
                            <div className="itemDescripText">
                            <ReactQuill modules={module} placeholder='Write a small brief about the Need' theme="snow" value={description} onChange={
                            handleQuillEdit} className="quillEdit" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* bottom side of form where skills and prerequisites are shown*/}
                <div className="formBottom row">
                    <div className="itemForm col-sm-6">
                        <button type="button" className='btnSkills' onClick={() => setOpenSkills(!openSkills)}>
                            <div className="headerSkills">
                                    Skills Required
                                    {!openSkills && <ExpandMoreIcon />}
                                    {openSkills && <ExpandLessIcon />}
                            </div>
                        </button>
                        {openSkills && (
                            <div className="dropDownSkills">
                                <div className="itemForm">
                                    <label>Required Skills</label>
                                    <AddRemoveInputField />
                                </div>
                            </div>)}   
                    </div>
                    <div className="itemForm col-sm-6">
                            <button type="button" className='btnSkills' onClick={() => setOpenPreRequisites(!openPreRequisites)}>
                                <div className="headerSkills">
                                    Prerequisites
                                    {!openPreRequisites && <ExpandMoreIcon />}
                                    {openPreRequisites && <ExpandLessIcon />}
                                </div>
                                </button>
                                {openPreRequisites && (
                                <div className="dropDownSkills">
                                    <div className="itemForm">
                                        <label>Occurence</label>
                                        <input type="text" name="occurence" value={occurence}  />
                                        <label>Volunteers Required</label>
                                        <input type="text" name="volunteers" value={volunteers} />
                                        <label>Duration</label>
                                        <input type="text" name="duration" value={duration}  />
                                        <label>Priority</label>
                                        <input type="text" name="priority" value={priority}  />
                                    </div>
                                </div>)}   
                    </div>
                </div>
            </form>
        </div>
    </div>
  )
}


export default RaiseNeed
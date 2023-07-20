import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import './ModifyNeed.css' 
import { Redirect } from 'react-router'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddRemoveInputField from '../AddRemoveInputField/AddRemoveInputField';
import DeleteIcon from '@mui/icons-material/Delete';
import Nominations from '../Nominations/Nominations'

const ModifyNeed = props => {
    const [data,setData] = useState({
        name: '',
        needTypeId: '',
        status: '',
        description: '',
        userId:'',
        entityId: '',
        skillDetail: '',
        prerequisiteDetail: ''
    });
    const url=`http://13.126.159.24:8081/api/v1/Need/${props.needId}`
    useEffect(()=> {
        axios.get(`${url}`).then(
            //function(response){console.log(response.data)}
            response => setData(response.data)
        );
      },[url])
    const [openSkills,setOpenSkills] = useState(false);
    const [openPreRequisites,setOpenPreRequisites] = useState(false);

    const [dataNeedType,setDataNeedType] = useState([]);
    const [dataEntity,setDataEntity] = useState([]);

    useEffect(()=> {
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
          }).then(
            response => setDataEntity(Object.values(response.data))
        )
      },[])

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
        /*axios.post('https://vidyaloka-40f2c-default-rtdb.firebaseio.com/needslist.json', data).then(
            () => {setHome(true)} )*/
        console.log(data)
    }
    const [home,setHome] = useState(false);
    const deleteHandler = e => {
        e.preventDefault();
        console.log(props.needId)
        //axios.delete(`http://13.126.159.24:8081/api/v1/Need/${props.needId}`).then(
        //    () => {setHome(true)} )
        //.catch(
        //    {function (error) {console.log(error)}}
        //);
    }
    const [modify,setModify] = useState(true)

    if(home){
        return <Redirect to="/needs"/>
    }

  return (
    <div className="wrapModifyNeed row">
        <div className="wrapNominations0">
            <div className="btnMClose">
                <button onClick={props.handleClose}>x</button>
            </div>
            <div className="modifyNeed">
                <div className="wrapTabs">
                    <div className={modify ? "underLine" : null}><button onClick={()=>setModify(true)}>Nominations</button></div>
                    <div className={modify ? null : "underLine"}><button onClick={()=>setModify(false)}>Need Details</button></div>
                </div>
                {modify ? (
                    <Nominations needId={props.needId} />
                    ) : (
                <div className="needinfo">
                <div className="modifyNeedBar">
                        <div className="wrapModifyName"> 
                            <div className="needName">Untitled Need</div>
                            <div className="tagNeedName">{data.description.slice(3,-4)}</div>
                        </div>
                        <div className="wrapBtnModifyNeed">                 
                            <button className="btnModifyNeed" type="submit" form="myForm"> Modify </button>
                            <button onClick={deleteHandler}> <DeleteIcon/> </button>
                        </div>
                </div>
                <div className="modifyNeedForm"  >
                    <form className="needForm" id="myForm" onSubmit={submitHandler}>
                        <div className="modifyTopForm row">
                            <div className="modifyTopLeft col-sm-6">
                                <div className="itemForm">
                                <label>Need Name</label>
                                <input type="text" placeholder={data.name} name="name" value={data.name} onChange={changeHandler} />
                                </div>
                                <div className="itemForm">
                                <label>Need Type</label>
                                <select className="selectMenu" name="needTypeId" value={data.needTypeId} onChange={changeHandler}>
                                {
                                    dataNeedType.map(
                                        (ntype) => 
                                        (ntype.id===data.needTypeId)? <option value={ntype.id} defaultValue>{ntype.name}</option>
                                        :<option value={ntype.id}>{ntype.name}</option>
                                    )
                                }   
                                </select>
                                </div> 
                                <div className="itemForm">
                                <label>Entity Name</label>
                                <select className="selectMenu" name="entityId" value={data.entityId} onChange={changeHandler}>
                                    {
                                        dataEntity.map(
                                            (entype) => 
                                            (entype.id===data.entityId)? <option value={entype.id} defaultValue>{entype.name}</option>
                                            :<option value={entype.id}>{entype.name}</option>
                                        )
                                    }
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
                                        <label>Languages</label>
                                        <input type="text" name="name" value={data.skillDetail} onChange={changeHandler} />
                                    </div>
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
                                        <input type="text" name="name"  onChange={changeHandler} />
                                        <label>Volunteers Required</label>
                                        <input type="text" name="name"  onChange={changeHandler} />
                                        <label>Duration</label>
                                        <input type="text" name="name"  onChange={changeHandler} />
                                        <label>Priority</label>
                                        <input type="text" name="name" onChange={changeHandler} />
                                        <label>Project Details</label>
                                        <input type="text" name="name" onChange={changeHandler} />
                                    </div>
                                </div>)}   
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
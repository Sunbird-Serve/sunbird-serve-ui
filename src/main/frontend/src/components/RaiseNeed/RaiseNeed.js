import React, { useState } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import './RaiseNeed.css' 
import { Redirect } from 'react-router'

const RaiseNeed = props => {
    const [data,setData] = useState({
        needname: '',
        entityname: '',
        needtype: '',
        skillsreq: '',
        location: '',
        numvlntr: '',
        descrip: '',
        stadate: '',
        endate: '',
        occurdate: '',
        time: '',
    });
    const {needname, entityname, needtype, skillsreq, location, numvlntr, descrip, stadate, endate, occurdate, time} = data;

    var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{'list':'ordered'},{'list':'bullet'}]];

    const module = {
        toolbar: toolbarOptions,
    };

    const handleQuillEdit = (value) => {
        setData({...data,descrip:value})
    };

    const changeHandler = e => {
        setData({...data,[e.target.name]:e.target.value})
    }
    const submitHandler = e => {
        e.preventDefault();
        axios.post('https://vidyaloka-40f2c-default-rtdb.firebaseio.com/needslist.json', data).then(
            () => {alert("Submitted Successfully");setHome(true)} )
    }
    const [home,setHome] = useState(false);
    if(home){
        return <Redirect to="/needs"/>
    }

  return (
    <div className="wrapRaiseNeed">
        <div className="btnClose">
            <button onClick={props.handleClose}>x</button>
        </div>
        <div className="raiseNeed">
            <div className="raiseNeedBar">
                <div className="wrapNeedBar">
                    <div className="wrapNameNeed"> 
                        <div className="needName">Untitled Need </div>
                        <div className="tagNeedName"> A detailed description about the Need</div>
                    </div>
                    <div className="wrapBtnRaiseNeed">                 
                        <button className="btnRaiseNeed" type="submit" form="myForm"> Raise Need </button>
                    </div>
                </div>
            </div>
            <div className="raiseNeedForm"  >
                <form className="needForm" id="myForm" onSubmit={submitHandler}>
                    <div className="formLeftSide">
                        <div className="itemForm">
                            <label>Need Name</label>
                            <input type="text" placeholder='Ex. Avila Beach Cleaning' name="needname" value={needname} onChange={changeHandler} />
                        </div>
                        <div className="itemForm">
                            <label>Need Type</label>
                            <select className="selNeedType" name="needtype" value={needtype} onChange={changeHandler}>
                                <option value="" defaultValue>Select Need type</option>
                                <option value="Beach Cleaning">Beach Cleaning</option>
                                <option vlaue="Blood Donation">Blood Donation</option>
                                <option value="Lake Cleaning">Lake Cleaning</option>
                                <option value="Mentoring">Mentoring</option>
                                <option value="Offline Teaching">Offline Teaching</option>
                                <option value="Online Teaching">Online Teaching</option>
                                <option value="Painting">Painting</option>
                                <option value="Tuition">Tuition</option>
                            </select>
                        </div>
                        <div className="itemForm">
                            <label>Need Location</label>
                            <input type="text" placeholder='Ex. Bangalore' name="location" value={location} onChange={changeHandler}/>
                        </div>
                        <div className="itemDescrip">
                            <label>Need Description</label>
                            <div className="itemDescripText">
                                <ReactQuill modules={module} placeholder='Write a small brief about the Need' theme="snow" value={descrip} onChange={
                            handleQuillEdit} className="quillEdit" />
                            </div>
                        </div>
                    </div>
                    <div className="formRightSide">
                        <div className="itemForm">
                            <label>Entity Name</label>
                            <input type="text" placeholder='Ex. Abdul Kalam Club' name="entityname" value={entityname} onChange={changeHandler} />
                        </div>   
                        <div className="itemForm">
                            <label>Skills Required</label>
                            <input type="text" placeholder='Add Skills' name="skillsreq" value={skillsreq} onChange={changeHandler} />
                        </div>    
                        <div className="itemForm">
                            <label>No. of Volunteers Required</label>
                            <input type="text" placeholder='Mention number of Volunteers' name="numvlntr" value={numvlntr} onChange={changeHandler} />
                        </div>   
                        <div className="wrapDateItem">
                            <div className="itemDate">
                                <label>Start Date</label>
                                <input type="date" name="stadate" value={stadate} onChange={changeHandler}></input>
                            </div> 
                            <div className="itemDate">
                                <label>End Date</label>
                                <input type="date" name="endate" value={endate} onChange={changeHandler}></input>
                            </div> 
                        </div>
                        <div className="wrapTimeItem">
                            <div className="itemDate">
                                <label>Occurance Date</label>
                                <input type="date" name="occurdate" value={occurdate} onChange={changeHandler}></input>
                            </div> 
                            <div className="itemDate">
                                <label>Time</label>
                                <input type="time" name="time" value={time} onChange={changeHandler}></input>
                            </div> 
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}


export default RaiseNeed
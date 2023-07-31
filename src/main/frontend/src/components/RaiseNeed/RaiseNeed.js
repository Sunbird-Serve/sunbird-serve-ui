import React, { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import './RaiseNeed.css' 
import { Redirect } from 'react-router'
import UploadImageBG from '../../assets/bgImgUpload.png'

const RaiseNeed = props => {
    const [ selectedOptions, setSelectedOptions ] = useState([]);
    // fields to enter in the raise need form
    const [data,setData] = useState({
        name: '',    //registry.Need (Need Name) 
        needTypeId: '',       //registry.Need (Need Type)
        status: 'Approved',     //registry.Need
        description: '',      //registry.Need (Need Description)
        userId:'',      //registry.Need ? Not from RN form
        entityId: '',       //registry.Need (Entity Name)
        skillDetail: [],        //serve.NeedRequirement
        prerequisiteDetail: '',      //serve.NeedRequirement
    });
    const [dataOther,setDataOther] = useState({
        needId:'',
        needLocation:'',    // ?? Need Location
        needBDate:'',    // ?? Start Date
        needEDate:'',    // ?? End Date
        needTime:'',   // ?? Time
        numVolunteerRequired:'' //?? No. Volunteer Required
    })
    const {name, needTypeId, status, description, userId, entityId, skillDetail, prerequisiteDetail} = data;
    const {needId, needLocation, needBDate, needEDate, needTime, numVolunteerRequired} = dataOther;

    // configure and handle image upload
    const inputRef = useRef(null);
    const handleImageClick = () => {
        inputRef.current.click();
    };
    const [imageNeed, setImageNeed] = useState('')
    const handleImageUpload = (e) => {
        setImageNeed(e.target.files[0])
    }

    // configure rich text options //
    var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{'list':'ordered'},{'list':'bullet'}]];
    const module = {
        toolbar: toolbarOptions,
    };
    const handleQuillEdit = (value) => {
        setData({...data,description:value})
    };

    // Handler to update all input fields of forms //
    const changeHandler = e => {
        setData({...data,[e.target.name]:e.target.value})
    }
    const changeHandlerOther = e => {
        setDataOther({...dataOther,[e.target.name]:e.target.value})
    }

    const options = [
        { label: 'Fluency in English', value: 'Fluency in English'},
        { label: 'Python Programming', value: 'Python Programming'},
        { label: 'Public Speaking', value: 'Public Speaking'}
    ]
    const handleChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions)
        setData(data => ({
            ...data,
            skillDetail:selectedOptions,
        }))
    }
    const styleTokenInput = {
        control: (provided) => ({
            ...provided, 
            minHeight: '30px',
            padding:'0px'
        }),
        multiValue: (provided, state) => {
            const color = state.data.color || '#ccc'
            return {
                ...provided,
                backgroundColor: '#FAFAFA',
                borderRadius: '3px'
            }
        },
        multiValueLabel: (provided) => ({
            ...provided,
            color:'#99999F', //text color for token label
            padding: '0px 6px',
        }),
        multiValueRemove: (provided, state) => ({
            ...provided,
            color:'#99999F',
            ':hover': {
                backgroundColor: '#FAFAFA',
                color:'black'
            }
        })
    }


    const [home,setHome] = useState(false);
    const submitHandler = e => {
        e.preventDefault();
        console.log({data});

        // Post to internal databse //

        axios.post('http://43.204.25.161:8081/api/v1/Need', data)
        .then(
            ()=> {setHome(true)},
            //function(response){console.log(response)}
        )
        .catch(function (error) {
            console.log('error'); 
        }) 
        
        // Post to firebase database //
        
        /*
        axios.post('https://vidyaloka-40f2c-default-rtdb.firebaseio.com/needs.json', data)
        .then(response => {
            const nid = response.data.name;
            setDataOther({...dataOther,needId:nid})
            axios.post('https://vidyaloka-40f2c-default-rtdb.firebaseio.com/needsOther.json', dataOther)
            .then(()=> {setHome(true)})
        })
        */
        //window.location.reload()
    }
    if(home){
        window.location.reload()
        //return <Redirect to="/needs"/>
    }

  return (
    <div className="wrapRaiseNeed row">
        <div className="raiseNeed col-10 offset-1 col-sm-8 offset-sm-2">
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
                {/* upper side of form: need info*/}
                <div className="formRNcatergory">NEED INFO</div>
                <div className="formTop row">
                    {/* left half of upper side*/}
                    <div className="formLeft col-sm-6">
                        {/* Image */}
                        <div className="itemImage">
                            <label>Image</label>
                            <div className="uploadNImage" onClick={handleImageClick}>
                                {imageNeed ? (<img src={URL.createObjectURL(imageNeed)} alt='' />) : <img src={UploadImageBG} alt='' /> }
                                <input type="file" ref={inputRef} onChange={handleImageUpload} style={{display:"none"}} />
                            </div>
                        </div>
                        {/* Need Name */}
                        <div className="itemForm">
                            <label>Need Name</label>
                            <input type="text" placeholder='Ex: Avila Beach Cleaning' name="name" value={name} onChange={changeHandler} />
                        </div>
                        {/* Need Type */}
                        <div className="itemForm">
                            <label>Need Type</label>
                            <select className="selectMenu" name="needTypeId" value={needTypeId} onChange={changeHandler}>
                                <option value="" defaultValue>Select Need Type</option>
                                <option value="Beach Cleaning">Beach Cleaning</option>
                                <option vlaue="Blood Donation">Blood Donation</option>
                                <option value="Lake Cleaning">Lake Cleaning</option>
                                <option value="Mentoring">Mentoring</option>
                                <option value="Offline Teaching">Offline Teaching</option>
                                <option value="Online Teaching">Online Teaching</option>
                                <option value="Painting">Painting</option>
                                <option value="Tuition">Tuition</option>
                                { /*
                                    dataNeedType.map(
                                        (ntype) => <option value={ntype.id}>{ntype.name}</option>
                                    )
                                    */}
                            </select>
                        </div> 
                        {/* Need Location */}
                        <div className="itemForm">
                            <label>Need Location</label>
                            <input type="text" placeholder='Ex: Bangalore' name="needLocation" value={needLocation} onChange={changeHandlerOther} />
                        </div>                               
                    </div>  
                    {/* right half of upper side */}
                    <div className="formRight col-sm-6">
                        {/* Need Description */}
                        <div className="itemDescription">
                            <label>Need Description</label>
                            <ReactQuill className="quillEdit" modules={module} theme="snow" value={description} 
                                placeholder='Write a small brief about the Need' onChange={handleQuillEdit}    
                            />
                        </div>
                        {/* Entity Name */}
                        <div className="itemForm">
                            <label>Entity Name</label>
                            <input type="text" placeholder='Ex: Lions club' name="entityId" value={entityId} onChange={changeHandler} />
                        </div>
                        {/* Date */}
                        <div className="itemWrapDate">
                            <div className="itemDate">
                                <label>Start Date</label>
                                <input type="date" name="needBDate" value={needBDate} onChange={changeHandlerOther} />
                            </div>
                            <div className="itemDate">
                                <label>End Date</label>
                                <input type="date" name="needEDate" value={needEDate} onChange={changeHandlerOther} />
                            </div>
                        </div>
                        {/* Time */}
                        <div className="itemForm">
                            <label>Time</label>
                            <input type="time" name="needTime" value={needTime} onChange={changeHandlerOther} />
                        </div> 
                    </div>
                </div>
                {/* lower side of form : prerequisites */}
                <div className="formRNcatergory">VOLUNTEER PREREQUISITE</div>
                <div className="formBottom row">
                    <div className="formBLeft col-sm-6">
                        {/* Skills Required */}
                        <div className="itemForm">
                            <label>Skills Required</label>
                            {/*<input type="text" placeholder='Add Skills' name="skillDetail" value={skillDetail} onChange={changeHandler} />*/}
                            <div className="tokenInput">
                                <Select isMulti value={selectedOptions} options={options} onChange={handleChange} styles={styleTokenInput}/>
                            </div>
                        </div> 
                    </div>
                    <div className="formBRight col-sm-6">
                        {/* No. of Volunteers Required */}
                        <div className="itemForm">
                            <label>No. of Volunteers required</label>
                            <input className="inpVolunteerNum" type="text" placeholder='Mention Number of Volunteers' name="numVolunteerRequired" 
                                value={numVolunteerRequired} onChange={changeHandlerOther} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
        {/* Close button */}
        <div className="btnClose">
            <button onClick={props.handleClose}>X</button>
        </div> 
    </div>
  )
}


export default RaiseNeed
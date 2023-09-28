


import React, { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import './RaiseNeed.css'
import { useHistory } from 'react-router'
import UploadImageBG from '../../assets/bgImgUpload.png'
import MultiSelect from './MultiSelect';
import configData from './../../configData.json'

import { useSelector, useDispatch } from 'react-redux'
import { fetchNeedsByUid } from "../../state/needByUidSlice";

const RaiseNeed = props => {
    const dispatch = useDispatch();
    const history = useHistory()
    const uid = useSelector((state) => state.user.data.osid)
    const needTypes = useSelector((state) => state.needtype.data.content)
    const entities = useSelector((state) => state.entity.data.content)
    const [manualSkill, setManualSkill] = useState("");



    const handleManualSkillAdd = (e) => {
        if (e.key === "Enter" && manualSkill.trim() !== "") {
            // Create a new skill object and add it to the selectedOptions array
            const newSkill = { label: manualSkill, value: manualSkill };
            setSelectedOptions([...selectedOptions, newSkill]);
    
            // Clear the manualSkill input field
            setManualSkill("");
        }
    };
    

    const [selectedOptions, setSelectedOptions] = useState([]);
    // fields to enter in the raise need form
    const [data, setData] = useState({
        needTypeId: '',       //registry.Need (Need Type)
        name: '',    //registry.Need (Need Name) 
        needPurpose: '',
        description: '',      //registry.Need (Need Description)
        status: 'Approved',     //registry.Need
        userId: uid,      //registry.Need ? Not from RN form
        entityId: '',       //registry.Need (Entity Name)
        //requirementId: '',        //serve.NeedRequirement'
    });
    const [dataOther, setDataOther] = useState({
        skillDetails: '',
        frequency: '',
        volunteersRequired: '',
        startDate: '',
        endDate: '',
        priority: '',
        //timeSlot:'T00:00:00.000Z',    //??
        //days:'',        //??
    })
    const { name, needTypeId, status, description, needPurpose, userId, entityId } = data;
    const { skillDetails, frequency, startDate, endDate, volunteersRequired, priority } = dataOther;

    // configure and handle image upload
    const inputRef = useRef(null);
    const handleImageClick = () => {
        inputRef.current.click();
    };
    const [imageNeed, setImageNeed] = useState('')
    const handleImageUpload = (e) => {
        setImageNeed(e.target.files[0])
    }

    //need name and purpose updated by change handler
    //default Handlers to update input fields //
    const changeHandler = e => {
        setData({ ...data, [e.target.name]: e.target.value })
    }
    const changeHandlerOther = e => {
        setDataOther({ ...dataOther, [e.target.name]: e.target.value })
    }

    // need description - configure rich text options //
    var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{ 'list': 'ordered' }, { 'list': 'bullet' }]];
    const module = {
        toolbar: toolbarOptions,
    };
    const handleQuillEdit = (value) => {
        setData({ ...data, description: value })
    };

    //get from input in YearMonthDay format then convert to datetime before updating
    const [startYMD, setStartYMD] = useState('')
    const [endYMD, setEndYMD] = useState('')
    const handleEndDate = e => {
        setDataOther({ ...dataOther, endDate: (e.target.value + 'T08:57:00.000Z') })
        setEndYMD(e.target.value)
    }
    const handleStartDate = e => {
        setDataOther({ ...dataOther, startDate: (e.target.value + 'T08:57:00.000Z') })
        setStartYMD(e.target.value)
    }

    // event days by handleSelectedDaysChange
    const optionsDay = [
        { id: 1, label: 'Sunday', startTime: '', endTime: '' },
        { id: 2, label: 'Monday', startTime: '', endTime: '' },
        { id: 3, label: 'Tuesday', startTime: '', endTime: '' },
        { id: 4, label: 'Wednesday', startTime: '', endTime: '' },
        { id: 5, label: 'Thursday', startTime: '', endTime: '' },
        { id: 6, label: 'Friday', startTime: '', endTime: '' },
        { id: 7, label: 'Saturday', startTime: '', endTime: '' },
    ];
    // Handler to update selected event days
    const [selectedDays, setSelectedDays] = useState([]);
    const handleSelectedDaysChange = (selected) => {
        setSelectedDays(selected);
    };
    //convert days array into string
    useEffect(() => {
        const dayLabels = selectedDays.map(day => day.label)
        setDataOther(dataOther => ({
            ...dataOther,
            frequency: dayLabels.join(', '),
        }))
    }, [selectedDays])
    //handle skills details change
    const handleChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions)
        setDataOther(dataOther => ({
            ...dataOther,
            skillDetails: selectedOptions.map(obj => obj.value).join(', '),
        }))
    }
    const styleTokenInput = {
        control: (provided) => ({
            ...provided,
            minHeight: '30px',
            padding: '0px'
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
            color: '#99999F', //text color for token label
            padding: '0px 6px',
        }),
        multiValueRemove: (provided, state) => ({
            ...provided,
            color: '#99999F',
            ':hover': {
                backgroundColor: '#FAFAFA',
                color: 'black'
            }
        })
    }


    // get needrequirement whenever needtypeId is changed
    const [needReqId, setNeedReqId] = useState(null)
    const [skillsRequired, setSkillsRequired] = useState(null)
    const [options, setOptions] = useState([])
    useEffect(() => {
        //do following API call when needTypeId is not null
        if (needTypeId) {
            axios.get(`${configData.NEEDTYPE_GET}/${needTypeId}`)
                .then(
                    //function(response){console.log(response.data.requirementId)},
                    response => setNeedReqId(response.data.requirementId)
                )
                .catch(function (error) {
                    console.log('error');
                })
        }

        if (needReqId) {
            axios
                .get(`${configData.NEED_REQUIREMENT_GET}/${needReqId}`)
                .then((response) => {
                    setOptions(response.data.skillDetails.split(',').map(item => ({
                        label: item,
                        value: item,
                    })))
                })
                .catch((error) => {
                    console.error("Fetching Entity failed:", error);
                });
        }

    }, [needTypeId, needReqId]);
    console.log(options)

    // format as per API request body
    const [dataToPost, setDataToPost] = useState({
        needRequest: {},
        needRequirementRequest: {}
    })
    useEffect(() => {
        setDataToPost({ needRequest: data, needRequirementRequest: dataOther })
    }, [data, dataOther])

    //for state update
    const [home, setHome] = useState(false);
    // raise the need
    const submitHandler = e => {
        e.preventDefault();
        console.log(dataToPost)

        axios.post(`${configData.NEED_POST}`, dataToPost)
            .then(function (response) {
                console.log('posted sucessfully', response);
                dispatch(fetchNeedsByUid(uid));
                gotoNeeds();
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    if (home) {
        //return <Redirect to="/needs"/>
        window.location.reload()
    }
    const gotoNeeds = (selectedOptions) => {
        history.push('/needs')
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
                            {/*
                        <div className="itemImage">
                            <label>Image</label>
                            <div className="uploadNImage" onClick={handleImageClick}>
                                {imageNeed ? (<img src={URL.createObjectURL(imageNeed)} alt='' />) : <img src={UploadImageBG} alt='' /> }
                                <input type="file" ref={inputRef} onChange={handleImageUpload} style={{display:"none"}} />
                            </div>
                        </div>
                        */}
                            {/* Need Name */}
                            <div className="itemFormNeed">
                                <label>Need Name</label>
                                <input type="text" placeholder='Ex: Avila Beach Cleaning' name="name" value={name} onChange={changeHandler} />
                            </div>
                            {/* Need Purpose */}
                            <div className="itemFormNeed">
                                <label>Need Purpose</label>
                                <input type="text" placeholder='Provide the impact or purpose of this Need' name="needPurpose" value={needPurpose} onChange={changeHandler} />
                            </div>
                            {/* Need Type */}
                            <div className="itemFormNeed">
                                <label>Need Type</label>
                                <select className="selectMenu" name="needTypeId" value={needTypeId} onChange={changeHandler}>
                                    <option value="" defaultValue>Select Need type</option>
                                    {
                                        needTypes.map(
                                            (ntype) => <option key={ntype.osid} value={ntype.id}>{ntype.name}</option>
                                        )
                                    }
                                </select>
                            </div>
                            {/* Entity Name */}
                            <div className="itemFormNeed">
                                <label>Entity Name</label>
                                <select className="selectMenu" name="entityId" value={entityId} onChange={changeHandler}>
                                    <option value="" defaultValue>Select Entity</option>
                                    {
                                        entities.map(
                                            (entype) => <option key={entype.osid} value={entype.id}>{entype.name}</option>
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                        {/* right half of upper side */}
                        <div className="formRight col-sm-6">
                            {/* Need Description */}


                            <label className="itemDescriptionNeedLabel">Need Description</label>
                            <div className="itemDescriptionNeed">
                                <ReactQuill className="quillEdit" modules={module} theme="snow" value={description}
                                    placeholder='Write a small brief about the Need' onChange={handleQuillEdit}
                                />
                            </div>
                            {/* Date */}
                            <div className="itemWrapDate">
                                <div className="itemDate">
                                    <label>Start Date </label>
                                    <input type="date" name="startYMD" value={startYMD} onChange={handleStartDate} />
                                </div>
                                <div className="itemDate">
                                    <label>End Date </label>
                                    <input type="date" name="endYMD" value={endYMD} onChange={handleEndDate} />
                                </div>
                                <div className="itemDate">
                                    <label>Recurrence </label>
                                    <select className="selectFrequency" name="frequency" value={entityId} onChange={changeHandler}>
                                        <option value="" defaultValue>Off</option>
                                    </select>
                                </div>
                            </div>
                            <div className="itemFormNeed">
                                <label>Event Days</label>
                                <div className="itemFormNeedDays">
                                    <MultiSelect options={optionsDay} selectedOptions={selectedDays} onSelectedOptionsChange={handleSelectedDaysChange} />
                                </div>
                            </div>

                            {/* Time */}

                            {/*}
                        <div className="itemForm">
                            <label>Time</label>
                            <input type="time" name="timeSlot" value={timeSlot} onChange={changeHandlerOther} />
                        </div> 
                            */}

                        </div>
                    </div>
                    {/* lower side of form : prerequisites */}
                    <div className="formRNcatergory">VOLUNTEER PREREQUISITE</div>
                    <div className="formBottom row">
                        <div className="formBLeft col-sm-6">
                            {/* Skills Required */}
                            <div className="itemFormNeed">
                                <label>Skills Required</label>
                                <div className="tokenInput">
                                    <Select isMulti value={selectedOptions} options={options} onChange={handleChange} styles={styleTokenInput} />
                                    <input
                                        type="text"
                                        placeholder="Add Skills "
                                        value={manualSkill}
                                        onChange={(e) => setManualSkill(e.target.value)}
                                        onKeyDown={handleManualSkillAdd}
                                    />
                                </div>
                            </div>

                        </div>
                        <div className="formBRight col-sm-6">
                            {/* No. of Volunteers Required */}
                            <div className="itemFormNeed">
                                <label>No. of Volunteers required</label>
                                <input className="inpVolunteerNum" type="text" placeholder='Mention Number of Volunteers' name="volunteersRequired"
                                    value={volunteersRequired} onChange={changeHandlerOther} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {/* Close button */}
            <div className="btnClose">
                <button onClick={gotoNeeds}>X</button>
            </div>
        </div>
    )
}


export default RaiseNeed

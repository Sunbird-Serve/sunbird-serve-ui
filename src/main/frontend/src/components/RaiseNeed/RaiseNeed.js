import React, { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import './RaiseNeed.css' 
import { Redirect } from 'react-router'
import UploadImageBG from '../../assets/bgImgUpload.png'
import MultiSelect from './MultiSelect';
import configData from './../../configData.json'

const RaiseNeed = props => {
    //user is received from needs component
    {/* console.log(props.uId) */}

    const [ selectedOptions, setSelectedOptions ] = useState([]);
    // fields to enter in the raise need form
    const [data,setData] = useState({
        needTypeId: '',       //registry.Need (Need Type)
        name: '',    //registry.Need (Need Name) 
        needPurpose:'',
        description: '',      //registry.Need (Need Description)
        status: 'New',     //registry.Need
        userId: props.uId,      //registry.Need ? Not from RN form
        entityId: '',       //registry.Need (Entity Name)
        //requirementId: '',        //serve.NeedRequirement'
    });
    const [dataOther,setDataOther] = useState({
        skillDetails: '',
        frequency:'',    
        volunteersRequired:'',    
        startDate:'',    
        endDate:'',  
        priority:'', 
        //timeSlot:'T00:00:00.000Z',    //??
        //days:'',        //??
    })
    const {name, needTypeId, status, description, needPurpose, userId, entityId} = data;
    const {skillDetails, frequency, startDate, endDate, volunteersRequired, priority} = dataOther;

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
    //need types dropdown updated by change handler
    const [dataNeedType,setDataNeedType] = useState([]);

    // entity drop down updated by change handler
    const [dataEntity,setDataEntity] = useState([]);

    // need description - configure rich text options //
    var toolbarOptions = [['bold', 'italic', 'underline', 'strike'], [{'list':'ordered'},{'list':'bullet'}]];
    const module = {
        toolbar: toolbarOptions,
    };
    const handleQuillEdit = (value) => {
        setData({...data,description:value})
    };

    //get from input in YearMonthDay format then convert to datetime before updating
    const [ startYMD, setStartYMD ] = useState('')
    const [ endYMD, setEndYMD ] = useState('')
    const handleEndDate = e => {
        setDataOther({...dataOther,endDate:(e.target.value+'T08:57:00.000Z')})
        setEndYMD(e.target.value)
    }
    const handleStartDate = e => {
        setDataOther({...dataOther,startDate:(e.target.value+'T08:57:00.000Z')})
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

    const handleTimeChange = (dayId, field, value) => {
        const updatedDays = selectedDays.map(day => {
            if (day.id === dayId) {
                return { ...day, [field]: value };
            }
            return day;
        });
        setSelectedDays(updatedDays);
    };


    useEffect(() => {
        const dayLabels = selectedDays.map(day => day.label)
        setDataOther(dataOther => ({
            ...dataOther,
            frequency:dayLabels.join(', '),
        }))
    },[selectedDays])

    // Handler to update input fields other than specified //
    const changeHandler = e => {
        setData({...data,[e.target.name]:e.target.value})
    }
    const changeHandlerOther = e => {
        setDataOther({...dataOther,[e.target.name]:e.target.value})
    }

    const handleChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions)
        setDataOther(dataOther => ({
            ...dataOther,
            skillDetails:selectedOptions.map(obj => obj.value).join(', '),
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
    
    //for state update
    const [home,setHome] = useState(false);

    // API calls below
    useEffect(()=> {
        //Need type New
        axios.get(`${configData.NEEDTYPE_GET}/?page=0&size=10&status=Approved`)
        .then(
          //function(response){console.log(response.data.content)},
          response => setDataNeedType(Object.values(response.data.content))
        )
        .catch(function (error) {
            console.log('error'); 
        }) 
 
        axios.get(`${configData.ENTITY_GET}/?page=0&size=10&status=Active`)
        .then(
           //function(response){console.log(response.data.content)},
          response => setDataEntity(Object.values(response.data.content))
        )
        .catch(function (error) {
            console.log('error'); 
        }) 
      },[])

    // get needrequirement whenever needtypeId is changed
      const [needReqId,setNeedReqId] = useState(null)
      const [skillsRequired,setSkillsRequired] = useState(null)
      const [options,setOptions] = useState([])
      useEffect(() => {
        //get need requirement corresponding to needtypeId selected
        console.log(needTypeId)

        
        //do following API call when needTypeId is not null
        if(needTypeId){
        axios.get(`${configData.NEEDTYPE_GET}/${needTypeId}`)
        .then(
          //function(response){console.log(response.data.requirementId)},
          response => setNeedReqId(response.data.requirementId)
        )
        .catch(function (error) {
            console.log('error'); 
        }) 
        }

        
       if(needReqId) {
       axios
         .get(`${configData.NEED_REQUIREMENT_GET}/${needReqId}`)
         .then((response) => {
            setOptions(response.data.skillDetails.split(',').map(item=>({
                label:item,
                value:item,
            })))
         })
         .catch((error) => {
           console.error("Fetching Entity failed:", error);
         });
       }

       }, [needTypeId, needReqId]);
    console.log(options)

    // format as per API request body
    const [dataToPost,setDataToPost] = useState({
        needRequest:{},
        needRequirementRequest: {}
    })   
    useEffect(() => {
        setDataToPost({needRequest:data, needRequirementRequest:dataOther})
    },[data,dataOther])

    // raise the need
    const submitHandler = e => {
        e.preventDefault();
        console.log(dataToPost)
        axios.post(`${configData.NEED_POST}`, dataToPost)
        .then(
            ()=> {setHome(true)},
            function(response){console.log(response)}
        )
        .catch(function (error) {
            console.log(error); 
        }) 
    }

    if(home){
        //return <Redirect to="/needs"/>
        window.location.reload()
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
                        <div className="itemForm">
                            <label>Need Name</label>
                            <input type="text" placeholder='Ex: Avila Beach Cleaning' name="name" value={name} onChange={changeHandler} />
                        </div>
                        {/* Need Purpose */}
                        <div className="itemForm">
                            <label>Need Purpose</label>
                            <input type="text" placeholder='Provide the impact or purpose of this Need' name="needPurpose" value={needPurpose} onChange={changeHandler} />
                        </div>
                        {/* Need Type */}
                        <div className="itemForm">
                            <label>Need Type</label>
                            <select className="selectMenu" name="needTypeId" value={needTypeId} onChange={changeHandler}>
                            <option value="" defaultValue>Select Need type</option>
                                {
                                    dataNeedType.map(
                                        (ntype) => <option key={ntype.osid} value={ntype.id}>{ntype.name}</option>
                                    )
                                }
                            </select>
                        </div> 
                        {/* Entity Name */}
                        <div className="itemForm">
                            <label>Entity Name</label>
                            <select className="selectMenu" name="entityId" value={entityId} onChange={changeHandler}>
                            <option value="" defaultValue>Select Entity</option>
                                {
                                    dataEntity.map(
                                        (entype) => <option key={entype.osid} value={entype.id}>{entype.name}</option>
                                    )
                                }
                            </select>
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
                        </div>
                        <div className="itemForm">
                            <label>Event Days</label>
                            <MultiSelect options={optionsDay} selectedOptions={selectedDays} onSelectedOptionsChange={handleSelectedDaysChange} />
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
                            <input className="inpVolunteerNum" type="text" placeholder='Mention Number of Volunteers' name="volunteersRequired" 
                                value={volunteersRequired} onChange={changeHandlerOther} />
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
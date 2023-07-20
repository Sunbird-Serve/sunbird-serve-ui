import React, { useState, useEffect } from 'react'
import axios from 'axios'
import MaterialTable, { MTableToolbar } from 'material-table'
import ModifyNeed from '../ModifyNeed/ModifyNeed'
import VisibilityIcon from '@mui/icons-material/Visibility';
import './NeedsList.css'


const NeedsList = props => {
  const [needId,setNeedId] = useState({})
  const [needDescription,setNeedDescription] = useState({})
  const [dataNeed,setDataNeed] = useState([]);
  const [dataNeedType,setDataNeedType] = useState([]);
  const [dataEntity,setDataEntity] = useState([]);
  const [dataFulfillmentDetails,setDataFulfillmentDetails] = useState([]);
  const [popUp, setPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popUp)
  }

  useEffect(()=> {
    /*axios.post('http://13.126.159.24:8081/api/v1/Need/search', {
      "offset": 0,
      "limit": 100,
      "filters": {
      "status": {
      "eq": "New"
        }
      }
    }).then(
      response => setDataNeed(Object.values(response.data))
      //function (response) {console.log(response.data)}
    ); 
    
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
    ) */
    

    //axios.get('http://localhost:3031/FulfillmentDetails').then(
    //  response => setDataFulfillmentDetails(Object.values(response.data))
    //)*/
    
    axios.get('http://localhost:3031/Need').then(
      response => setDataNeed(Object.values(response.data))
    );
    axios.get('http://localhost:3031/NeedType').then(
      response => setDataNeedType(Object.values(response.data))
    );
    axios.get('http://localhost:3031/Entity').then(
      response => setDataEntity(Object.values(response.data))
    );

  },[props.statusPopup])



  const [needtype,setNeedtype] = useState({})
  const [entity,setEntity] = useState({})
  const [volunteer,setVolunteer] = useState({})

  useEffect( () => {
    const needtype={};
    dataNeedType.map(row => needtype[row.id]=row.name)
    setNeedtype(needtype)
  },[dataNeedType])
  useEffect( () => {
    const entity={};
    dataEntity.map(row => entity[row.id]=row.name)
    setEntity(entity)
  },[dataEntity])
  /*useEffect( () => {
    const volunteer={};
    dataFulfillmentDetails.map(row => volunteer[row.needId]=row.assignedUserId)
    setVolunteer(volunteer)
  },[dataFulfillmentDetails])*/

  const columns = [
    {title:'Need Name',field:'name'},
    {title:'Need Type',field:'needTypeId',lookup:needtype},
    {title:'Entity Name',field:'entityId',lookup:entity},
    {title:'Volunteers',field:'id'},
    {title:'Timeline',field:'name'},
    {title:'Status',field:'status'},
  ]  
  const dateHandler = e => {
    console.log(needId)
  }

  return (
    <div className="wrapNeedTable row">
      <div className="needTable col-12">
        <MaterialTable title="" 
          data={ dataNeed }
          columns={ columns }
          enableRowSelection
          onRowClick={(event,rowData)=>{
            //console.log(rowData.description)
            setNeedId(rowData.osid)
            setNeedDescription(rowData.description)
            setPopup(!popUp)
            }}
          options={ {selection:false,search:true, paging:true, sorting:true, searchFieldStyle: {border: "2px"} }}
          onSelectionChange={(rows) => console.log('You selected ' + rows.length + ' rows')}
          components={{
            Toolbar: (props) => (
              <div className="row-12 d-flexbox d-sm-flex" style={{backgroundColor:"#fafafa",alignItems:"center"}}>
                <div className="col-12 col-sm-6" style={{display:"flex",flexDirection:"reverse",alignItems:"center"}}>
                  <MTableToolbar {...props} />
                  <label style={{marginLeft:"2%",marginRight:"4%"}}>
                    <input type="date" name="date" value={needId} onChange={dateHandler}  style={{fontSize:16, padding:"3px"}}/>
                  </label>
                  <select style={{fontSize:15,padding:"6px"}}  name="needTypeId" value={needId} >
                    <option value="" defaultValue>Need Type</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6" style={{display:"flex",justifyContent:"right"}}>
                  <div style={{padding:"0px 10px",borderWidth:"1px",marginRight:"-1px",backgroundColor:"white"}}>
                    <VisibilityIcon /> Needs
                  </div>
                  <div style={{padding:"0px 10px",borderWidth:"1px",marginRight:"3%",backgroundColor:"white"}}>
                    300
                  </div>
                  <div style={{padding:"0px 10px",borderWidth:"1px",marginRight:"-1px",backgroundColor:"white"}}>
                  <VisibilityIcon /> Volunteers
                  </div>
                  <div style={{padding:"0px 10px",borderWidth:"1px",marginRight:"5%",backgroundColor:"white"}}>
                  200
                  </div>
                </div>
              </div>
            )
          }}
        />
      </div>
      { popUp && <ModifyNeed handleClose={togglePopup} needId={needId} description={needDescription} /> }
    </div>
  )
}

export default NeedsList

//


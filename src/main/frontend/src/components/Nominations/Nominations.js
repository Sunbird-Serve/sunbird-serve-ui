import React, { useEffect, useState } from 'react'
import './Nominations.css'
import axios from 'axios'
import MaterialTable, { MTableToolbar } from 'material-table'

const Nominations = props => {
    const columns = [
        {title:'Volunteer Name',field:'name'},
        {title:'Location',field:'needTypeId'},
        {title:'Date of Birth',field:'entityId'},
        {title:'Contact Info',field:'id'},
        {title:'Skills'},
        {title:'Status',field:'status'},
      ] 
    const [data,setData] = useState([])
    useEffect( () => {
        axios.get(`http://localhost:3031/Nomination`).then(
            response => setData(response.data)
        ).catch(
            {function (error) {console.log(error)}}
        );
        console.log(data)

    },[])
  return (
    <div className="wrapNominations">
        <MaterialTable title="" 
        columns={ columns }
        //enableRowSelection
        /*onRowClick={(event,rowData)=>{
          console.log(rowData.description)
          setNeedId(rowData.osid)
          setNeedDescription(rowData.description)
          setPopup(!popUp)
        }} */
        options={ {selection:false,search:true, paging:true, sorting:true} }
        onSelectionChange={(rows) => console.log('You selected ' + rows.length + ' rows')}
        components={{
          Toolbar: (props) => (
            <div style={{ display: "flex", justifyContent: "spaceAround"}}>
              <MTableToolbar {...props} />
            </div>
          )
        }}
        actions={[
          {icon:()=> 
            <div style={{ display: "flex", alignItems:"center",float:"right"}}>
              <select style={{ display: "flex", float:"right",padding:"3px 25px",margin:"5px 0px 5px 20px",fontSize:18}} name="needTypeId" >
                <option value="" defaultValue>Location</option></select>
            </div>,
          isFreeAction:true
          }
        ]}
      />
    </div>
  )
}

export default Nominations
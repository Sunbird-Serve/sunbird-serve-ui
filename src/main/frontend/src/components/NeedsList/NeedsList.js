import React, { useState, useEffect } from 'react'
import axios from 'axios'
import MaterialTable, { MTableToolbar } from 'material-table'



const NeedsList = props => {
  const [data,setData] = useState([]);
  useEffect(()=> {
    axios.get('https://vidyaloka-40f2c-default-rtdb.firebaseio.com/needslist.json').then(
      response => setData(Object.values(response.data))
    )
  },[props.statusPopup])

  const columns = [
    {title:'Need Name',field:'needname'},
    {title:'Need Type',field:'needtype'},
    {title:'Entity Name',field:'entityname'},
    {title:'Volunteers',field:'numvlntr'},
    {title:'Timeline',field:'stadate'},
    {title:'Status',field:'location'},
  ]  

  return (
    <div className="needTable">
     <MaterialTable title="" 
        data={data}
        columns={columns}
        enableRowSelection
        options={ {selection:true,search:true, paging:true, sorting:true} }
        components={{
          Toolbar: (props) => (
            <div
              style={{
                display: "flex",
                justifyContent: "left"
              }}
            >
              <MTableToolbar {...props} />
            </div>
          )
        }}
      />
    </div>
  )
}

export default NeedsList

 
 



import React, { useEffect, useState, useMemo } from 'react'
import './Nominations.css'
import axios from 'axios'
import { useTable, usePagination } from 'react-table'
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';


const Nominations = props => {
  const [rejectPopup,setRejectPopup] = useState(false)
  const [rowData,setRowData] = useState({})
  const [reason,setReason] = useState('')
  const [dataNoms,setDataNeed] = useState([
    {name:'raviteja',location:'warangal',dob:'20-08-1993',mobnum:'9000123456'},
    {name:'rajesh',location:'hyderabad',dob:'01-01-1996',mobnum:'9849456789'},
    {name:'manvitha',location:'vizag',dob:'05-06-1999',mobnum:'9949124589'},
    {name:'bhargavi',location:'chennai',dob:'11-12-2002',mobnum:'9100123789'}
  ]);
  const COLUMNS = [
    {Header:'Volunteer Name',accessor:'name'}, //
    {Header:'Location',accessor:'location'},
    {Header:'Date of Birth',accessor:'dob'},
    {Header:'Contact Info',accessor:'mobnum'},
    {Header:'Skills'},
    {Header:'Actions',
      Cell : ({ row }) => {
        const handleAccept = () => {
          console.log('Accept Nomination')
        }
        const handleReject = () => {
          setRejectPopup(true)
          setRowData(row.values)
        }
        return (
          <div className="actionsCell">
            <button className="acceptNomin" onClick={handleAccept}>
              <CheckIcon style={{height:"20px",width:"20px",marginLeft:"-5px",marginBottom:"3px",color:"green"}}/></button>
            <button className="rejectNomin" onClick={handleReject}>
              <ClearIcon style={{height:"20px",width:"20px",marginLeft:"-4.5px",marginBottom:"3px",color:"red"}}/></button>
          </div>
        )
    }
    },
  ] 

  const data = useMemo(() => dataNoms,[])
  const columns = useMemo(() => COLUMNS, [])

  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
  } = useTable ({
    columns,
    data
    },
    usePagination
  )

  const handleReason = e => {
    setReason(e.target.value)
  }

  const [activeTab, setActiveTab] = useState('tabN');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }

  return (
    <div className="wrapNominations">
      <div className="wrapTopbarNominations">
        <div className="topbarNominations">
          <div className="leftBarNomination">
            <div className={`${activeTab === 'tabN' ? 'selectNomin' : ''}`} onClick={() => handleTabClick('tabN')}>Nominated</div>
            <div className={`${activeTab === 'tabA' ? 'selectNomin' : ''}`} onClick={() => handleTabClick('tabA')}>Accepted</div>
            <div className={`${activeTab === 'tabR' ? 'selectNomin' : ''}`} onClick={() => handleTabClick('tabR')}>Rejected</div>
          </div>
          <div className="rightBarNomination">
            <div className="boxSearchNomins">
              <i><SearchIcon style={{height:'18px',width:'18px'}}/></i>
              <input type="search" name="nsearch" placeholder="Search" ></input>
            </div>
            <div className="searchLocNomins">
              <input type="search" name="nsearch" placeholder="Location" ></input>
            </div>
          </div>
        </div>
      </div>
      {/* table for reading list of nominations*/}
      <table className="tableNominations">
        <thead>
          {headerGroups.map((headerGroup)=>(
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column)=>(
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                    </th>
                    ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row)
              return (
                <tr {...row.getRowProps()} >
                  {row.cells.map((cell)=>{
                    return <td {...cell.getCellProps()}> {cell.render('Cell')}</td>
                  })}
                </tr>
              )
          })}
        </tbody>
      </table>
      {/*reject pop-up*/}
      {rejectPopup && 
        <div className="popupReject">
          <div className="rejectBox">
            <div className="rbTopBar">
              <span>Reason for Rejection</span>
              <button onClick={() => setRejectPopup(false)}>X</button>
            </div>
            <div className="rbNomin">
              <div className="nameRN">{rowData.name}</div>
              <div className="emailRN">{rowData.name}@gmail.com</div>
            </div>
            <div className="rejectReason">
              <label>Reason</label>
              <textarea placeholder="Write a reason for rejecting the nominee" 
                name="reason" value={reason} onChange={handleReason}/>
            </div>
            <div className="wrapBtnsRN">
              <div className="cancelBtnRN" onClick={() => setRejectPopup(false)}>Cancel</div>
              <div className="confirmBtnRN">Confirm</div>
            </div>
          </div>
        </div> 
      }
    </div>
  )
}

export default Nominations
import React, { useEffect, useState, useMemo } from 'react'
import './Nominations.css'
import axios from 'axios'
import { useTable, usePagination, useGlobalFilter, useFilters, useSortBy } from 'react-table'
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import configData from './../../configData.json'
import { useSelector, useDispatch } from 'react-redux'

const Nominations = ({ needData, openPopup }) => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('tabN');
  const [responseFlag, setResponseFlag] = useState(false)

  const [rejectPopup,setRejectPopup] = useState(false)    //reject nomination
  const [acceptPopup,setAcceptPopup] = useState(false)    //accept nomination
  //need to which nomination is done
  const needId = needData.need.id;
  //update nominations for the need
  const [ nomsList, setNomsList ] = useState([])
  useEffect(()=>{
      axios.get(`${configData.NEED_SEARCH}/${needId}/nominate`)
      .then((response) => {
        console.log('dispatched')
        setNomsList(response.data) 
      })
  },[dispatch, activeTab, acceptPopup, rejectPopup, openPopup, responseFlag])

  // const nomsList = useSelector((state) => state.nominationbynid.data);
  console.log(nomsList)
  //filter nominations as per active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }
  const [dataNoms, setDataNoms] = useState([]);
  useEffect(() => {
    if (activeTab === 'tabA') {
      setDataNoms(nomsList.filter(item => item.nominationStatus === "Approved"))
    } else if (activeTab === 'tabR') {
      setDataNoms(nomsList.filter(item => item.nominationStatus === "Rejected"))
    } else if (activeTab === 'tabN') {
      setDataNoms(nomsList.filter(item => item.nominationStatus === "Nominated"))
    }
   }, [activeTab, nomsList]);

  const [rowData,setRowData] = useState({})
  const [reason,setReason] = useState('')

  if(acceptPopup){
    console.log(rowData.id)   //nominationId
    console.log(rowData.nominatedUserId)  //nominatedUserId
    axios.post(`${configData.NOMINATION_CONFIRM}/${rowData.nominatedUserId}/confirm/${rowData.id}?status=Approved`)
    .then(
      function(response){setResponseFlag(!responseFlag)},
      openPopup('accept'),
    )
    .catch(function (error) {
        console.log('error'); 
    }) 
    setAcceptPopup(false)
  }

  const confirmRejection = e => {
    axios.post(`${configData.NOMINATION_CONFIRM}/${rowData.nominatedUserId}/confirm/${rowData.id}?status=Rejected`)
    .then(
      function(response){setResponseFlag(!responseFlag)},
      openPopup('reject'),
      setRejectPopup(false),
    )
    .catch(function (error) {
        console.log('error'); 
    }) 
  }

  const COLUMNS = [
    {Header:'Volunteer Name',accessor:'userInfo.identityDetails.fullname'}, 
    {Header:'Location',accessor:'userInfo.contactDetails.address.city'},
    {Header:'Date of Birth',accessor:'userInfo.identityDetails.dob'},
    {Header:'Contact Info',accessor:'userInfo.contactDetails.mobile'},
    {Header:'Skills'},
    {Header:'Actions',
      Cell : ({ row }) => {
        const handleAccept = () => {
          setRowData(row.original)
          setAcceptPopup(true)
        }
        const handleReject = () => {
          setRejectPopup(true)
          setRowData(row.original)
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
  const columns = useMemo(() => COLUMNS, [activeTab])

  const userList = useSelector((state) => state.userlist.data);
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    const nomDetails = dataNoms.map((nomination) => {
      const user = userList.find((user) => user.osid === nomination.nominatedUserId);
      if(user){
        return {...nomination, userInfo: user }
      }
      return nomination
    })
    setTableData(nomDetails)
  }, [dataNoms]);

  const data = useMemo(() => tableData, [tableData])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    state,
    setGlobalFilter,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    prepareRow,
    setFilter,
    } = useTable ({
    columns,
    data
    },
  useFilters, useGlobalFilter, useSortBy, usePagination)

  const { globalFilter, pageIndex, pageSize } = state;  
  const [filterValue, setFilterValue] = useState('')

  const handleReason = e => {
    setReason(e.target.value)
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
              <input type="search" name="nsearch" placeholder="Search" value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)}></input>
            </div>
            <div className="searchLocNomins">
              <input type="text" placeholder="Location" onChange={(e)=>{setFilter('userInfo.contactDetails.address.city',e.target.value || undefined)}} ></input>
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
              <div className="nameRN">{rowData.userInfo.identityDetails.fullname}</div>
              <div className="emailRN">{rowData.userInfo.contactDetails.email}</div>
            </div>
            <div className="rejectReason">
              <label>Reason</label>
              <textarea placeholder="Write a reason for rejecting the nominee" 
                name="reason" value={reason} onChange={handleReason}/>
            </div>
            <div className="wrapBtnsRN">
              <div className="cancelBtnRN" onClick={() => setRejectPopup(false)}>Cancel</div>
              <div className="confirmBtnRN" onClick={confirmRejection}>Confirm</div>
            </div>
          </div>
        </div> 
      }
    </div>
  )
}

export default Nominations
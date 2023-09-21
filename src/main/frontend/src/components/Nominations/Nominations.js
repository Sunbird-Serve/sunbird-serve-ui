import React, { useEffect, useState, useMemo } from 'react'
import './Nominations.css'
import axios from 'axios'
import { useTable, usePagination } from 'react-table'
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import configData from './../../configData.json'

const Nominations = ({ data, openPopup }) => {
  const [rejectPopup,setRejectPopup] = useState(false)
  const [acceptPopup,setAcceptPopup] = useState(false)
  const [rowData,setRowData] = useState({})
  const [reason,setReason] = useState('')

  const [dataNoms, setDataNoms] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [activeTab, setActiveTab] = useState('tabN');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }

  const needId = data.id;
  console.log(needId)

  //get nominations to needId and status
  useEffect(() => {
    async function fetchData() {
      try {
        let url = `${configData.NEED_SEARCH}/${needId}/nominate`;
        if (activeTab === 'tabA') {
          url += '/Approved';
        } else if (activeTab === 'tabR') {
          url += '/Rejected';
        } else if (activeTab === 'tabN') {
          url += '/Nominated';
        }
        console.log(url)
        // Fetch dataNoms using Axios
        const response = await axios.get(url)
        setDataNoms(response.data)
      } catch (error) {
         console.error('Error fetching dataNoms:', error);
        }
      }
    fetchData();
  }, [needId, activeTab]);

  console.log(dataNoms)

  useEffect(() => {
    const fetchUserDataAndCreateTableData = async () => {
      const updatedTableData = [];

      for (const item of dataNoms) {
        try {
          const nominatedUserId = item.nominatedUserId;
          console.log(nominatedUserId)

          // Fetch userData using Axios for the current nominatedUserId
          const response = await axios.get(`${configData.NOMINATED_USER_FETCH}/${nominatedUserId}`);
          console.log(response.data)
          const userData = response.data;
          const location = userData?.contactDetails?.address?.state || '';
          const fullname = userData?.identityDetails?.fullname || '';
          const userDOB = userData?.identityDetails?.dob || '';
          const mobNum = userData?.contactDetails?.mobile || '';

          updatedTableData.push({
            nominatedUserId,
            location,
            fullname,
            userDOB,
            mobNum,
            //status: item.status,
          });
        } catch (error) {
          console.error('Error fetching userData:', error);
        }
      }
      setTableData(updatedTableData);
    };

    fetchUserDataAndCreateTableData();
  }, [dataNoms, activeTab]);

  const COLUMNS = [
    {Header:'Volunteer Name',accessor:'fullname'}, 
    {Header:'Location',accessor:'location'},
    {Header:'Date of Birth',accessor:'userDOB'},
    {Header:'Contact Info',accessor:'mobNum'},
    {Header:'Skills'},
    {Header:'Actions',
      Cell : ({ row }) => {
        const handleAccept = () => {
          console.log('Accept Nomination')
          setAcceptPopup(true)
        }
        const handleReject = () => {
          console.log(row.values)
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
  const columns = useMemo(() => COLUMNS, [activeTab])

  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
  } = useTable ({
    columns,
    data: tableData,
    },
    usePagination
  )

  const handleReason = e => {
    setReason(e.target.value)
  }
  

  const confirmRejection = e => {
    console.log(dataNoms)
    axios.post(`${configData.NOMINATION_CONFIRM}/${dataNoms[0].nominatedUserId}/confirm/${dataNoms[0].id}?status=Rejected`)
    .then(
      //function(response){console.log(response.data)},
      openPopup('reject'),
      setRejectPopup(false),
    )
    .catch(function (error) {
        console.log('error'); 
    }) 
  }

  
  if(acceptPopup){
    console.log(needId)
    console.log(dataNoms[0].id)   //nominationId
    console.log(dataNoms[0].nominatedUserId)
    axios.post(`${configData.NOMINATION_CONFIRM}/${dataNoms[0].nominatedUserId}/confirm/${dataNoms[0].id}?status=Approved`)
    .then(
      //function(response){console.log(response.data)},
      openPopup('accept')
    )
    .catch(function (error) {
        console.log('error'); 
    }) 
    setAcceptPopup(false)
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
              <div className="nameRN">{rowData.fullname}</div>
              <div className="emailRN">{rowData.name}</div>
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
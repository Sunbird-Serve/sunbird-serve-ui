import React, { useState, useEffect, useMemo } from 'react'
import { useTable, usePagination, useGlobalFilter, useFilters, useSortBy } from 'react-table'
import './Volunteers.css'
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ListIcon from '@mui/icons-material/List';
import { useSelector } from 'react-redux'
import { FaSort } from "react-icons/fa"
import VolunteerDetails from './VolunteerDetails'
import VolunteersList from './Volunteers'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search';
import { BrowserRouter, Switch, Route} from 'react-router-dom'
const configData = require('../../configure.js');

function Volunteers() {

  const userList = useSelector((state) => state.userlist.data);
  // console.log(userList.filter(item=>item.userDetails.osid = "1-342f7901-bc0b-4889-86be-ed98a3f8acee"))
  const volunteerList = userList.filter(item => item.role.includes('Volunteer'))
  // const selUser = volunteerList.filter(item => item.osid === '1-2daf7cee-727d-49ec-9c9a-3e0350b382f3' )
  // console.log(selUser)

  const [userDetailsList, setUserDetailsList] = useState([]);
  useEffect(() => {
    const fetchUserDetails = () => {
      const promises = volunteerList.map(user =>
        axios.get(`${configData.USER_PROFILE_BY_ID}/${user.osid}`)
          .then(response => ({
            userDetails: user,
            userProfile: response.data,
          }))
          .catch(error => {
            // console.error(`Error fetching details for osid: ${user.osid}`, error);
            return null
            // return {
            //   userDetails: user,
            //   userProfile: null,
            // };
          })
      );

      Promise.all(promises).then(results => {
        const filteredResults = results.filter(result => result && result.userProfile !== null);
        setUserDetailsList(filteredResults);
      })
      .catch(error => {
        console.error('Error in Promise.all', error);
      });
    };

    fetchUserDetails();
  }, []);
  
  const [ statReg, setReg ] = useState(null)
  const [ statRecom, setRecom ] = useState(null)
  const [ statOnHold, setOnHold ] = useState(null)
  const [ statActive, setActive ] = useState(null)
  const [ statOnBoard, setOnBoard ] = useState(null)

  useEffect(()=>{
    setReg(userDetailsList && userDetailsList.filter(item => item.userDetails.status === 'Registered'))
    setRecom(userDetailsList && userDetailsList.filter(item => item.userDetails.status === 'Recommended'))
    setOnHold(userDetailsList && userDetailsList.filter(item => item.userDetails.status === 'OnHold'))
    setActive(userDetailsList && userDetailsList.filter(item => item.userDetails.status === 'Active'))
    setOnBoard(userDetailsList && userDetailsList.filter(item => item.userDetails.status === 'OnBoarded'))
},[userDetailsList])

  const COLUMNS = [
    { Header: 'Name', accessor:'userDetails.identityDetails.fullname' },
    { Header: 'Phone', accessor:'userDetails.contactDetails.mobile'},
    { Header: 'City', accessor:'userDetails.contactDetails.address.city' },
    { Header: 'Language', accessor:'userProfile.userPreference.language', Cell: ({ value }) => value.join(', ') },
    { Header: 'Interested Areas', accessor:'userProfile.userPreference.interestArea', Cell: ({ value }) => value.join(', ')  },
    { Header: 'Status', accessor:'userDetails.status' },
    // { Header: 'Onboard Status', accessor:'nominationStatus' }
  ]

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => userDetailsList,[userDetailsList])

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

  //Filters on the needs table
  const { globalFilter, pageIndex, pageSize } = state;  
  const [filterValue, setFilterValue] = useState('')
  //filter tabs
  const [status, setStatus ] = useState('Active')  
  const [activeTab, setActiveTab] = useState('');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setFilter('userDetails.status', tab)
  }


  const [rowData, setRowData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const handleRowClick = (rowData) => {
    setRowData(rowData);
    setShowPopup(!showPopup);
  };
  
 
  return (
    <div>
      <div className="headerVolunteers">
        <div className="tag-vHeader">Manage & Monitor the Volunteers</div>
      </div>
      <div className="wrap-tabs-search">
        <div className="wrap-tabs-vCoord">
            <div className={`tabs-vCoord ${activeTab === 'Registered' ? 'activeVTab' : ''}`} onClick={() => handleTabClick('Registered')}>
                <icon><ListIcon /> </icon>  
                {statReg ? statReg.length : ''} Registered
            </div>
            <div className={`tabs-vCoord ${activeTab === 'Recommended' ? 'activeVTab' : ''}`} onClick={() => handleTabClick('Recommended')}>
                <icon><PersonAddIcon /> </icon>
                {statRecom ? statRecom.length : ''} Recommended
            </div>
            <div className={`tabs-vCoord ${activeTab === 'OnHold' ? 'activeVTab' : ''}`} onClick={() => handleTabClick('OnHold')}>
                <icon><ManageAccountsIcon /> </icon>
                {statOnHold ? statOnHold.length : ''} On Hold
            </div>
            <div className={`tabs-vCoord ${activeTab === 'Active' ? 'activeVTab' : ''}`} onClick={() => handleTabClick('Active')}>
                <icon><GroupIcon /></icon>               
                {statActive ? statActive.length : ''} Active
            </div>
        </div>
        <div className="search-vCoord">
            <i><SearchIcon style={{height:'18px',width:'18px'}}/></i>
            <input type="search" name="globalfilter" placeholder="Search volunteer" value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)}></input>
        </div>
      </div>

      <div className="wrap-vtable">
      <table className="tableNeedList">
        <thead>
            {headerGroups.map((headerGroup)=>(
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column)=>(
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                            {column.render('Header')}
                            <span>
                              <FaSort />
                            </span>
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
        <tbody {...getTableBodyProps()}>
            {page.map((row) => {
                prepareRow(row)
                return (
                    <tr {...row.getRowProps()} onClick={() => handleRowClick(row.original)} >
                        {row.cells.map((cell)=>{
                            return <td {...cell.getCellProps()} style={{ width: cell.column.width }}> {cell.render('Cell')}</td>
                        })}
                    </tr>
                )
            })}
        </tbody>
      </table>

      <div className="pageNav">
        <div className="needsPerPage">
          <span>Rows per page:</span>
          <select value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value))}>
            {[10, 15, 25].map((pageSize) => (
              <option key={pageSize} value={pageSize}>{pageSize}</option>
            ))}
          </select>
        </div>
        <span>
          Go to
            <input type="number" defaultValue={pageIndex+1}
            onChange={e => {
              const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(pageNumber)
            }}
            style={{width:'50px'}}
            />
          page
        </span>

        <div className="pageNumber">
        <button onClick={()=>previousPage()} disabled={!canPreviousPage}> <ArrowBackIosIcon style={{height:"18px"}}/></button>
        <span> Page
          <strong>
              {pageIndex + 1} 
          </strong>
          of {pageOptions.length}
        </span>
        <button onClick={()=>nextPage()} disabled={!canNextPage}><ArrowForwardIosIcon style={{height:"18px"}}/></button>
        </div>
      </div>
      </div>

    { showPopup && <VolunteerDetails handleClose={handleRowClick} data={rowData} /> }

   
    </div>
    
    
  )
}

export default Volunteers

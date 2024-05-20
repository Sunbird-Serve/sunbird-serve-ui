import React, { useState, useEffect, useMemo } from 'react'
import { useTable, usePagination, useGlobalFilter, useFilters, useSortBy } from 'react-table'
import './Volunteers.css'
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ListIcon from '@mui/icons-material/List';
import { useSelector } from 'react-redux'
import { FaSort } from "react-icons/fa"
import VolunteerDetails from './VolunteerDetails'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function Volunteers() {
  //const userDetails = useSelector((state)=> state.user.data)

  const userList = useSelector((state) => state.userlist.data);
  const volunteerList = userList.filter(item => item.role.includes('nCoordinator'))
  console.log(userList)

  const COLUMNS = [
    { Header: 'Name', accessor:'identityDetails.fullname' },
    { Header: 'Phone', accessor:'contactDetails.mobile'},
    { Header: 'City', accessor:'contactDetails.address.city' },
    { Header: 'Language', accessor:'language' },
    { Header: 'Interested Areas', accessor:'interestAreas' },
    { Header: 'Status', accessor:'status' },
    { Header: 'Nomination Status', accessor:'nominationStatus' }
  ]

   const columns = useMemo(() => COLUMNS, []);
   const data = useMemo(() => volunteerList,[userList])

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
  const [status, setStatus ] = useState('all')  
  const [activeTab, setActiveTab] = useState('all');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }
  // useEffect(() => {
  //   if (activeTab === 'approved') {
  //     setFilter('need.status', 'Approved')
  //   }
  //   else if (activeTab == 'requested') {
  //     setFilter('need.status', 'New')
  //   }
  //   else {
  //     setFilter('need.status','')
  //   }
  // }, [activeTab])

  const [rowData, setRowData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const handleRowClick = (rowData) => {
    setRowData(rowData);
    setShowPopup(!showPopup);
  };
  
 
  return (
    <div>
      <div className="headerVolunteers">
        <div className="title-vHeader">Volunteer Dashboard</div>
        <div className="tag-vHeader">Manage & Monitor the Volunteers</div>
      </div>
      <div className="wrap-tabs-vCoord">
        <div className="tabs-vCoord"><GroupIcon />Nominated</div>
        <div className="tabs-vCoord"><CheckCircleOutlineIcon />Recommended</div>
        <div className="tabs-vCoord"><PersonOffIcon />Not Recommended</div>
        <div className="tabs-vCoord"><ListIcon />Waiting List</div>
      </div>
      <div className="stats-filters-vCoord">
        <div className="stats-vCoord">
          <div className="count-vCoord"><GroupIcon />Overall Volunteers</div>
          <div className="count-vCoord"><GroupAddIcon />New Nominations</div>
        </div>
        <div className="filters-vCoord">
          <div className="search-vCoord">
            <input></input>
          </div>
          <div className="byCity-vCoord">
            <input></input>
          </div>
        </div>
      </div>

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

    { showPopup && <VolunteerDetails handleClose={handleRowClick} data={rowData} /> }


    </div>
    
  )
}

export default Volunteers

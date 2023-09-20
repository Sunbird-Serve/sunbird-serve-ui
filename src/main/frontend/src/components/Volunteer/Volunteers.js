import React, { useState, useEffect, useMemo } from 'react'
import { useTable, usePagination, useGlobalFilter, useFilters, useSortBy } from 'react-table'
import './Volunteers.css'
import {auth} from '../../firebase.js'
import axios from 'axios'
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ListIcon from '@mui/icons-material/List';
import { useSelector } from 'react-redux'
import { FaSort } from "react-icons/fa"
import VolunteerDetails from './VolunteerDetails'


function Volunteers() {
  //const userDetails = useSelector((state)=> state.user.data)
  const [ users, setUsers] = useState([
    {status:'active',name:'abc',mobile:'9874563210',city:'Hyderabad',language:'English',interestAreas:'Singing, Flute',nominationStatus:'On Hold'},
    {status:'active',name:'xyz',mobile:'8769877650',city:'Warangal',language:'Telugu',interestAreas:'Teaching, Coaching',nominationStatus:'Recommended'},
    {status:'active',name:'pqr',mobile:'9969877650',city:'Chennai',language:'Tamil',interestAreas:'Management, Administration',nominationStatus:'Not Recommended'}
  ])
  const COLUMNS = [
    { Header: 'Name', accessor:'name' },
    { Header: 'Phone', accessor:'mobile' },
    { Header: 'City', accessor:'city' },
    { Header: 'Language', accessor:'language' },
    { Header: 'Interested Areas', accessor:'interestAreas' },
    { Header: 'Status', accessor:'status' },
    { Header: 'Nomination Status', accessor:'nominationStatus' }
  ]

   const columns = useMemo(() => COLUMNS, []);
   const data = useMemo(() => users,[users])

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

    { showPopup && <VolunteerDetails handleClose={handleRowClick} data={rowData} /> }


    </div>
    
  )
}

export default Volunteers

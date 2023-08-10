import React, {useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import { useTable, usePagination, useGlobalFilter, useFilters, useSortBy } from 'react-table'
import ModifyNeed from '../ModifyNeed/ModifyNeed'
import './NeedsTable.css'
import SearchIcon from '@mui/icons-material/Search';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FaSort } from "react-icons/fa"
import configData from './../../configData.json'

export const NeedsTable = props => {
  const [dataNeed,setDataNeed] = useState(props.dataNeed);
  
  function NeedTypeById({ needTypeId }) {
    const [needType, setNeedType] = useState(null);
    useEffect(() => {
    axios
      .get(`${configData.NEEDTYPE_FETCH}/${needTypeId}`)
      .then((response) => {
        setNeedType(response.data.name);
      })
      .catch((error) => {
        console.error("Fetching Need Type failed:", error);
      });
    }, [needTypeId]);
   return <span>{needType || ''}</span>;
  }

  function EntityById({ entityId }) {
    const [entityName, setEntityName] = useState(null);
     useEffect(() => {
       axios
         .get(`${configData.ENTITY_FETCH}/${entityId}`)
         .then((response) => {
           setEntityName(response.data.name);
         })
         .catch((error) => {
           console.error("Fetching Entity failed:", error);
         });
     }, [entityId]);
     return <span>{entityName || ''}</span>;
  }

  const COLUMNS = [
    { Header: 'Need Name', accessor: 'name', width: 250 },
    { Header: 'Need Type', accessor: 'needTypeId',
      Cell: ({ value }) => {
      return <NeedTypeById needTypeId={value} />;
      }
    },
    { Header: 'Location', width: 144 },
    { Header: 'Entity', accessor: 'entityId'
      , 
      Cell: ({ value }) => {
      return <EntityById entityId={value} />;
      }
    },
    { Header: 'Volunteer', width: 112 },
    { Header: 'Timeline', width: 164 },
    { Header: 'Status', accessor: 'status', width: 109, filter: 'text' }
  ]
  const data = useMemo(() => dataNeed,[])
  const columns = useMemo(() => COLUMNS, [])
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

  const [showPopup, setShowPopup] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [date,setDate] = useState('')
  const [needTypeId, setNeedTypeId] = useState('')

  const handleRowClick = (rowData) => {
    setRowData(rowData);
    setShowPopup(!showPopup);
  };
  const handleDate = e => {
    setDate(e.target.value)
  }
  const handleNeedType = e => {
    setNeedTypeId(e.target.value)
  }

  const { globalFilter, pageIndex, pageSize } = state;

  const [filterValue, setFilterValue] = useState('')

  useEffect(() => {
    if (props.tab === 'approved') {
      setFilter('status', 'Approved')
    }
    else if (props.tab == 'requested') {
      setFilter('status', 'New')
    }
    else {
      setFilter('status','')
    }
  }, [props.tab])


  return (
    <div className="wrapTable">
      {/* Header on top of table containing search, data, type, need and volunteer count */}
      <div className="topBarNeedTable">
        <div className="leftTopBarNeedTable">
          <div className="needCount">
            <i><StickyNote2Icon /></i>
            <span>{Object.keys(data).length}</span>
            <label>Needs</label>
          </div>
          <div className="volunteerCount">
            <i><PeopleAltIcon /></i>
            <span> </span>
            <label>Volunteers</label>
          </div>
        </div>
        <div className="rightTopBarNeedTable">
          {/* Following are filters on need table */}
          <div className="boxSearchNeeds">
            <i><SearchIcon style={{height:'18px',width:'18px'}}/></i>
            <input type="search" name="globalfilter" placeholder="Search" value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)}></input>
          </div>
          <div className="selectNeedDate">
            <input type="date" name="date" value={date} onChange={handleDate} />
          </div>
          <select className="selectNeedType" name="needTypeId" value={needTypeId} onChange={handleNeedType} >
            <option value="" defaultValue>Need Type</option>
            <option value="Beach Cleaning">Beach Cleaning</option>
            <option vlaue="Blood Donation">Blood Donation</option>
            <option value="Lake Cleaning">Lake Cleaning</option>
            <option value="Mentoring">Mentoring</option>
          </select>
        </div>
      </div>
      {/* Following is TABLE that loads list of needs and its details */}
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
      {/* Open nominations and need info page as popup */}
      { showPopup && <ModifyNeed handleClose={handleRowClick} data={rowData} /> }
    </div>
  )
}

export default NeedsTable
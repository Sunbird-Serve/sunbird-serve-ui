import React, {useState, useEffect,useMemo} from 'react'
import axios from 'axios'
import { useTable, usePagination } from 'react-table'
import ModifyNeed from '../ModifyNeed/ModifyNeed'
import './NeedsTable.css'
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const NeedsTable = props => {
  const [dataNeed,setDataNeed] = useState([]);
  const COLUMNS = [
    { Header: 'Need Name', accessor: 'name'},
    { Header: 'Need Type', accessor: 'needTypeId'},
    { Header: 'Entity', accessor: 'entityId'},
    { Header: 'Volunteer'},
    { Header: 'Timeline'},
    { Header: 'Status', accessor: 'status'}
]
  const data = useMemo(() => props.dataNeed,[])
  const columns = useMemo(() => COLUMNS, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    prepareRow,
  } = useTable ({
    columns,
    data
  },
  usePagination
  )

  const [showPopup, setShowPopup] = useState(false);
  const [rowData, setRowData] = useState(null);

  const handleRowClick = (rowData) => {
    setRowData(rowData);
    setShowPopup(!showPopup);
  };

  return (
    <div>
      {/* Header on top of table containing search, data, type, need and volunteer count */}
      <div className="topBarNeedTable">
        <div className="leftTopBarNeedTable">
          {/* Following are filters on need table */}
          {/*
          <div className="boxSearchNeeds">
            <i><SearchIcon /></i>
            <input type="search" name="nsearch" placeholder="Search" ></input>
          </div>
          <div className="selectNeedDate">
            <input type="date" name="date" value={''} onChange={''} />
          </div>
 
           <select className="selectNeedType" name="needTypeId" value={''} >
            <option value="Select Type" defaultValue>Need Type</option>
          </select>
          */}
          <div className="vline"></div>
          <div className="viewNeedsList">
            <i><ViewStreamIcon /></i>
          </div>
          <div className="viewNeedsGrid">
            <i><GridViewIcon /></i>
          </div>

        </div> 
        <div className="rightTopBarNeedTable">
          <div className="needCount">
            <i><VisibilityIcon style={{fontSize:"20px",color:"#969696",marginRight:"5px"}}/></i>
            <label>Needs</label>
            <span>200</span>
          </div>
          <div className="volunteerCount">
            <i><VisibilityIcon style={{fontSize:"20px",color:"#969696",marginRight:"5px"}}/></i>
            <label>Volunteers</label>
            <span>200</span>
          </div>
        </div>
      </div>
      {/* Following is table that loads list of needs and its details */}
      <table>
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
                    <tr {...row.getRowProps()} onClick={() => handleRowClick(row.original)} >
                        {row.cells.map((cell)=>{
                            return <td {...cell.getCellProps()}> {cell.render('Cell')}</td>
                        })}
                    </tr>
                )
            })}
        </tbody>
      </table>
      <div className="pageNav">
        <button onClick={()=>previousPage()} disabled={!canPreviousPage}>Previous</button>
        <button onClick={()=>nextPage()} disabled={!canNextPage}>Next</button>
      </div>
      {/* Open nominations and need info page as popup */}
      { showPopup && <ModifyNeed handleClose={handleRowClick} data={rowData} /> }
    </div>
  )
}

export default NeedsTable
import React, {useState, useEffect, useMemo} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTable, usePagination, useGlobalFilter, useFilters, useSortBy } from 'react-table'
import { useHistory } from 'react-router'
import randomColor from 'randomcolor'
import axios from 'axios'
import ModifyNeed from '../ModifyNeed/ModifyNeed'
import './NeedsTable.css'
import SearchIcon from '@mui/icons-material/Search';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FaSort } from "react-icons/fa"
import Avatar from '@mui/material/Avatar';

const configData = require('../../configure.js');

export const NeedsTable = props => {
  const dispatch = useDispatch()

  //get userId
  const uid = useSelector((state)=> state.user.data.osid)
  //get list of needs raised by user
  const needList = useSelector((state) => state.need.data);
  const needsByUser = needList.filter(item => item && item.need && item.need.userId === uid)

  //needtype filter
  const needTypes = useSelector((state)=> state.needtype.data.content)
  const [needTypeId, setNeedTypeId] = useState('')
  const handleNeedTypeFilter = e => {
    setNeedTypeId(e.target.value)
  }
  const [filteredData, setFilteredData] = useState([])
  useEffect(()=>{
    let filtered = needsByUser
    if(needTypeId){
      const filtered = needsByUser.filter(item => item.need.needTypeId === needTypeId)
      setFilteredData(filtered)
    } else {
      setFilteredData(filtered)
    }
  },[needTypeId, needList])
  const data = useMemo(() => filteredData,[filteredData, needList])

  const COLUMNS = [
    { Header: 'Need Name', accessor: 'need.name', width: 250 },
    { Header: 'Need Type', accessor: 'needType.name'  },
    { Header: 'Location', accessor: 'entity.district'},
    { Header: 'Entity', accessor: 'entity.name' }, 
    { Header: 'Volunteer', accessor: 'need.id',
      Cell: ({ value }) => {
      return <div className="vAvatars-container"><
        VolunteerByNeedId needId={value} />
        </div>; }
    },
    { Header: 'Timeline',
      accessor: (row) => {
        if(row.occurrence) {
          return `${row.occurrence.startDate.substr(2,8).split('-').reverse().join('/')}
            -${row.occurrence.endDate.substr(2,8).split('-').reverse().join('/')}`
        } else {
          return ''
        }
      } ,
    },
    { Header: 'Status', accessor: 'need.status'}
  ]
  const columns = useMemo(() => COLUMNS, []);

  function VolunteerByNeedId({ needId }) {
    const [volunteerList, setVolunteerList] = useState(null);
    const [volunteerNames, setVolunteerNames] = useState([]);
    useEffect(() => {
       axios
         .get(`${configData.NEED_FULFILL}/${needId}/nominate`)
         .then((response) => {
           setVolunteerList(response.data);
         })
         .catch((error) => {
           console.error("Fetching Entity failed:", error);
         });
    }, [needId]);
    //  console.log(volunteerList)
     
    useEffect(() => {
      if (volunteerList) {
        const volunteerIds = volunteerList.map((item) => item['nominatedUserId']);
        // Function to fetch volunteer details by volunteerId
        const fetchVolunteerDetails = async (volunteerId) => {
          try {
            const response = await axios.get(`${configData.USER_GET}/${volunteerId}`); 
            // console.log(response.data)
            return response.data.identityDetails.fullname; // Assuming your API returns a name field
          } catch (error) {
            console.error(`Error fetching volunteer details for ID ${volunteerId}:`, error);
            return null;
          }
        };
  
        // Use Promise.all to make API calls for all volunteerIds concurrently
        const fetchDataForAllVolunteers = async () => {
          const promises = volunteerIds.map((volunteerId) => fetchVolunteerDetails(volunteerId));
          const volunteerNames = await Promise.all(promises);
          setVolunteerNames(volunteerNames);
        };
  
        fetchDataForAllVolunteers();
      }

    }, [volunteerList]);

    const truncateAndDots = (names, maxNamesToShow) => {
        const firstLetters = names.map((element) => 
        element === null ? null : (
          <Avatar className="avatar" style={{display:'inline',padding:'5px',marginLeft:'-10px',height:'30px',width:'30px',fontSize:'16px',backgroundColor:randomColor()}}>
            {element.charAt(0)}
          </Avatar>
        )
        
        );
        
      if (names.length <= maxNamesToShow) {
        return firstLetters
          ;
      } else {
        return firstLetters.slice(0,maxNamesToShow);
      }
    
    };

    if (volunteerNames.length > 0) {
      const maxNamesToShow = 3; // Adjust the number of names to show
      const truncatedVolunteerNames = truncateAndDots(volunteerNames, maxNamesToShow);

      if(volunteerNames.length > maxNamesToShow){
        return <span>{truncatedVolunteerNames}
          
          <Avatar className="avatar" style={{display:'inline',padding:'5px',marginLeft:'-10px',height:'30px',width:'30px',fontSize:'16px',backgroundColor:randomColor()}}>
          {'+'}{volunteerNames.length-maxNamesToShow}
          </Avatar>
        </span>;
      } else {
        return <span>{truncatedVolunteerNames}</span>;
      }
    } else {
      return <span>No volunteers</span>;
    }
  }
  

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
  useEffect(() => {
    if (activeTab === 'approved') {
      setFilter('need.status', 'Approved')
    }
    else if (activeTab == 'requested') {
      setFilter('need.status', 'New')
    }
    else {
      setFilter('need.status','')
    }
  }, [activeTab])

  //Popup on row click showing nominations and need details
  const [rowData, setRowData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const handleRowClick = (rowData) => {
    setRowData(rowData);
    setShowPopup(!showPopup);
  };

  //raise need page
  const history = useHistory()
  const gotoRaiseNeed = e => {
    history.push('/raiseneed')
  }

  return (
    <div className="wrapTable">
      <div className="needBar">
        {/* Tabs */}
        <div className="needMenu">
          <div className={`tabNeed ${activeTab === 'all' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('all')}>All</div>
          <div className={`tabNeed ${activeTab === 'approved' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('approved')}>Approved</div>
          <div className={`tabNeed ${activeTab === 'requested' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('requested')}>Requested</div>
        </div>
        {/* Raise Need Button */}
        <button onClick={gotoRaiseNeed}>Raise Need</button>
      </div>

      {/* Header on top of table: stats and filters */}
      <div className="topBarNeedTable">
        {/*Counts*/}
        <div className="leftTopBarNeedTable">
          <div className="needCount">
            <i><StickyNote2Icon /></i>
            <span>{filteredData.length}</span>
            <label className="count-label"> Needs </label>
          </div>
          <div className="volunteerCount">
            <i><PeopleAltIcon /></i>
            <span> </span>
            <label className="count-label">Volunteers</label>
          </div>
        </div>
        {/*Filters*/}
        <div className="rightTopBarNeedTable">
          {/* Following are filters on need table */}
          <div className="boxSearchNeeds">
            <i><SearchIcon style={{height:'18px',width:'18px'}}/></i>
            <input type="search" name="globalfilter" placeholder="Search need" value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)}></input>
          </div>
          {/*
          <div className="selectNeedDate">
            <input type="date" name="selectedDate" value={selectedDate} onChange={handleDateChange} />
          </div>
          */}
          <select className="selectNeedType" name="needTypeId" value={needTypeId} onChange={handleNeedTypeFilter} >
            <option value="" defaultValue>All Need Types</option>
            {
              needTypes.map(
                  (ntype) => <option key={ntype.osid} value={ntype.id}>{ntype.name}</option>
                )
              }
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
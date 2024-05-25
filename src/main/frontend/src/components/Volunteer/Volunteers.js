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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search';


function Volunteers() {

  const userList = useSelector((state) => state.userlist.data);
  const volunteerList = userList.filter(item => item.role.includes('nCoordinator'))
  // console.log(volunteerList)

  // const [userDetailsList, setUserDetailsList] = useState([]);
  // useEffect(() => {
  //   const fetchUserDetails = () => {
  //     const promises = volunteerList.map(user =>
  //       axios.get(`https://serve-v1.evean.net/api/v1/serve-volunteering/user/user-profile/userId/${user.osid}`)
  //         .then(response => ({
  //           userDetails: user,
  //           userProfile: response.data,
  //         }))
  //         .catch(error => {
  //           // console.error(`Error fetching details for osid: ${user.osid}`, error);
  //           return null
  //           // return {
  //           //   userDetails: user,
  //           //   userProfile: null,
  //           // };
  //         })
  //     );

  //     Promise.all(promises).then(results => {
  //       const filteredResults = results.filter(result => result && result.userProfile !== null);
  //       setUserDetailsList(filteredResults);
  //     }).catch(error => {
  //       console.error('Error in Promise.all', error);
  //     });
  //   };

  //   fetchUserDetails();
  // }, []);
  
  const [userDetailsList, setUserDetailsList] = useState([
    {
        "userDetails": {
            "osUpdatedAt": "2023-09-01T10:22:35.150Z",
            "role": [
                "nCoordinator"
            ],
            "osCreatedAt": "2023-09-01T10:22:35.150Z",
            "osUpdatedBy": "anonymous",
            "osCreatedBy": "anonymous",
            "agencyId": "c57f8f28-929c-46ca-ab06-f6df83bb5cd7",
            "osid": "1-c5e52431-daa0-46b4-9778-ca80667aab29",
            "contactDetails": {
                "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                "address": {
                    "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                    "osCreatedAt": "2023-09-01T10:22:35.150Z",
                    "osUpdatedBy": "anonymous",
                    "osCreatedBy": "anonymous",
                    "osid": "1-5f86cac3-468c-41bf-80f0-d02376a2d2b2",
                    "state": "Telangana",
                    "city": "Suryapet",
                    "country": "India"
                },
                "osCreatedAt": "2023-09-01T10:22:35.150Z",
                "osUpdatedBy": "anonymous",
                "mobile": "9887123456",
                "osCreatedBy": "anonymous",
                "osid": "1-e0182255-002c-45d8-9b09-688208b5a6c4",
                "email": "motamanvitha@gmail.com"
            },
            "osOwner": [
                "anonymous"
            ],
            "identityDetails": {
                "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                "gender": "Female",
                "osCreatedAt": "2023-09-01T10:22:35.150Z",
                "osUpdatedBy": "anonymous",
                "dob": "2002-11-19",
                "name": "Manvitha Active",
                "osCreatedBy": "anonymous",
                "osid": "1-958374fc-1742-4874-a661-8050bdee13b0",
                "fullname": "Manvitha Active",
                "Nationality": "Indian"
            },
            "status": "Active"
        },
        "userProfile": {
            "referenceChannelId": "string",
            "osUpdatedAt": "2024-05-05T11:29:58.600Z",
            "genericDetails": {
                "qualification": "Graduate",
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "affiliation": "PESIT",
                "yearsOfExperience": "3",
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "osid": "1-a14977a5-6913-419e-b272-65d55dd72307",
                "employmentStatus": "Student"
            },
            "osUpdatedBy": "anonymous",
            "consentDetails": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "consentDescription": "string",
                "consentGiven": true,
                "osid": "1-17d3c56d-84be-44db-bfa3-51e4475dbffa",
                "consentDate": "2024-04-11"
            },
            "osid": "1-6609c166-f495-430c-a9a1-011d01c6ae2c",
            "userId": "1-c5e52431-daa0-46b4-9778-ca80667aab29",
            "osOwner": [
                "anonymous"
            ],
            "onboardDetails": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "profileCompletion": "50",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "refreshPeriod": "2",
                "onboardStatus": [
                    {
                        "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                        "osCreatedAt": "2024-04-11T11:21:17.207Z",
                        "osUpdatedBy": "anonymous",
                        "osCreatedBy": "anonymous",
                        "onboardStep": "Step 1",
                        "osid": "1-2c7fb269-d708-427f-9dc2-6e8d267e4a14",
                        "status": "Completed"
                    }
                ],
                "osCreatedBy": "anonymous",
                "osid": "1-2d0dd002-ce6f-49b0-9831-ec928e4b2f71"
            },
            "skills": [
                {
                    "skillName": "string",
                    "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                    "osCreatedAt": "2024-04-11T11:21:17.207Z",
                    "osUpdatedBy": "anonymous",
                    "osCreatedBy": "anonymous",
                    "osid": "1-850896b6-77b9-47de-9c8e-695863d5fb2b",
                    "skillLevel": "string"
                }
            ],
            "userPreference": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "timePreferred": [
                    "9AM"
                ],
                "interestArea": [
                    "Teaching"
                ],
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "dayPreferred": [
                    "Monday"
                ],
                "osCreatedBy": "anonymous",
                "language": [
                    "English"
                ],
                "osid": "1-e9411628-d341-4d1e-a4cb-f0ea510e4470"
            },
            "osCreatedAt": "2024-04-11T11:21:17.207Z",
            "osCreatedBy": "anonymous",
            "volunteeringHours": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "hoursPerWeek": 4,
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "totalHours": 3,
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "osid": "1-a38cfa1b-6782-4df3-824b-68899ab3146c"
            }
        }
    },
    {
        "userDetails": {
            "osUpdatedAt": "2023-09-01T10:22:35.150Z",
            "role": [
                "nCoordinator"
            ],
            "osCreatedAt": "2023-09-01T10:22:35.150Z",
            "osUpdatedBy": "anonymous",
            "osCreatedBy": "anonymous",
            "agencyId": "c57f8f28-929c-46ca-ab06-f6df83bb5cd7",
            "osid": "1-c5e52431-daa0-46b4-9778-ca80667aab29",
            "contactDetails": {
                "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                "address": {
                    "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                    "osCreatedAt": "2023-09-01T10:22:35.150Z",
                    "osUpdatedBy": "anonymous",
                    "osCreatedBy": "anonymous",
                    "osid": "1-5f86cac3-468c-41bf-80f0-d02376a2d2b2",
                    "state": "Telangana",
                    "city": "Mandamarri",
                    "country": "India"
                },
                "osCreatedAt": "2023-09-01T10:22:35.150Z",
                "osUpdatedBy": "anonymous",
                "mobile": "9887656785",
                "osCreatedBy": "anonymous",
                "osid": "1-e0182255-002c-45d8-9b09-688208b5a6c4",
                "email": "motamanvitha@gmail.com"
            },
            "osOwner": [
                "anonymous"
            ],
            "identityDetails": {
                "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                "gender": "Female",
                "osCreatedAt": "2023-09-01T10:22:35.150Z",
                "osUpdatedBy": "anonymous",
                "dob": "2002-11-19",
                "name": "Manvitha Registered",
                "osCreatedBy": "anonymous",
                "osid": "1-958374fc-1742-4874-a661-8050bdee13b0",
                "fullname": "Manvitha Registered",
                "Nationality": "Indian"
            },
            "status": "Registered"
        },
        "userProfile": {
            "referenceChannelId": "string",
            "osUpdatedAt": "2024-05-05T11:29:58.600Z",
            "genericDetails": {
                "qualification": "Graduate",
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "affiliation": "PESIT",
                "yearsOfExperience": "3",
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "osid": "1-a14977a5-6913-419e-b272-65d55dd72307",
                "employmentStatus": "Student"
            },
            "osUpdatedBy": "anonymous",
            "consentDetails": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "consentDescription": "string",
                "consentGiven": true,
                "osid": "1-17d3c56d-84be-44db-bfa3-51e4475dbffa",
                "consentDate": "2024-04-11"
            },
            "osid": "1-6609c166-f495-430c-a9a1-011d01c6ae2c",
            "userId": "1-c5e52431-daa0-46b4-9778-ca80667aab29",
            "osOwner": [
                "anonymous"
            ],
            "onboardDetails": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "profileCompletion": "50",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "refreshPeriod": "2",
                "onboardStatus": [
                    {
                        "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                        "osCreatedAt": "2024-04-11T11:21:17.207Z",
                        "osUpdatedBy": "anonymous",
                        "osCreatedBy": "anonymous",
                        "onboardStep": "Step 1",
                        "osid": "1-2c7fb269-d708-427f-9dc2-6e8d267e4a14",
                        "status": "Completed"
                    }
                ],
                "osCreatedBy": "anonymous",
                "osid": "1-2d0dd002-ce6f-49b0-9831-ec928e4b2f71"
            },
            "skills": [
                {
                    "skillName": "string",
                    "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                    "osCreatedAt": "2024-04-11T11:21:17.207Z",
                    "osUpdatedBy": "anonymous",
                    "osCreatedBy": "anonymous",
                    "osid": "1-850896b6-77b9-47de-9c8e-695863d5fb2b",
                    "skillLevel": "string"
                }
            ],
            "userPreference": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "timePreferred": [
                    "9AM"
                ],
                "interestArea": [
                    "Teaching"
                ],
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "dayPreferred": [
                    "Monday"
                ],
                "osCreatedBy": "anonymous",
                "language": [
                    "English"
                ],
                "osid": "1-e9411628-d341-4d1e-a4cb-f0ea510e4470"
            },
            "osCreatedAt": "2024-04-11T11:21:17.207Z",
            "osCreatedBy": "anonymous",
            "volunteeringHours": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "hoursPerWeek": 4,
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "totalHours": 3,
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "osid": "1-a38cfa1b-6782-4df3-824b-68899ab3146c"
            }
        }
    },
    {
        "userDetails": {
            "osUpdatedAt": "2023-09-01T10:22:35.150Z",
            "role": [
                "nCoordinator"
            ],
            "osCreatedAt": "2023-09-01T10:22:35.150Z",
            "osUpdatedBy": "anonymous",
            "osCreatedBy": "anonymous",
            "agencyId": "c57f8f28-929c-46ca-ab06-f6df83bb5cd7",
            "osid": "1-c5e52431-daa0-46b4-9778-ca80667aab29",
            "contactDetails": {
                "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                "address": {
                    "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                    "osCreatedAt": "2023-09-01T10:22:35.150Z",
                    "osUpdatedBy": "anonymous",
                    "osCreatedBy": "anonymous",
                    "osid": "1-5f86cac3-468c-41bf-80f0-d02376a2d2b2",
                    "state": "Telangana",
                    "city": "Hyderabad",
                    "country": "India"
                },
                "osCreatedAt": "2023-09-01T10:22:35.150Z",
                "osUpdatedBy": "anonymous",
                "mobile": "9887456789",
                "osCreatedBy": "anonymous",
                "osid": "1-e0182255-002c-45d8-9b09-688208b5a6c4",
                "email": "motamanvitha@gmail.com"
            },
            "osOwner": [
                "anonymous"
            ],
            "identityDetails": {
                "osUpdatedAt": "2023-09-01T10:22:35.150Z",
                "gender": "Female",
                "osCreatedAt": "2023-09-01T10:22:35.150Z",
                "osUpdatedBy": "anonymous",
                "dob": "2002-11-19",
                "name": "Manvitha Recommended",
                "osCreatedBy": "anonymous",
                "osid": "1-958374fc-1742-4874-a661-8050bdee13b0",
                "fullname": "Manvitha Recommended",
                "Nationality": "Indian"
            },
            "status": "Recommended"
        },
        "userProfile": {
            "referenceChannelId": "string",
            "osUpdatedAt": "2024-05-05T11:29:58.600Z",
            "genericDetails": {
                "qualification": "Graduate",
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "affiliation": "PESIT",
                "yearsOfExperience": "3",
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "osid": "1-a14977a5-6913-419e-b272-65d55dd72307",
                "employmentStatus": "Student"
            },
            "osUpdatedBy": "anonymous",
            "consentDetails": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "consentDescription": "string",
                "consentGiven": true,
                "osid": "1-17d3c56d-84be-44db-bfa3-51e4475dbffa",
                "consentDate": "2024-04-11"
            },
            "osid": "1-6609c166-f495-430c-a9a1-011d01c6ae2c",
            "userId": "1-c5e52431-daa0-46b4-9778-ca80667aab29",
            "osOwner": [
                "anonymous"
            ],
            "onboardDetails": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "profileCompletion": "50",
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "refreshPeriod": "2",
                "onboardStatus": [
                    {
                        "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                        "osCreatedAt": "2024-04-11T11:21:17.207Z",
                        "osUpdatedBy": "anonymous",
                        "osCreatedBy": "anonymous",
                        "onboardStep": "Step 1",
                        "osid": "1-2c7fb269-d708-427f-9dc2-6e8d267e4a14",
                        "status": "Completed"
                    }
                ],
                "osCreatedBy": "anonymous",
                "osid": "1-2d0dd002-ce6f-49b0-9831-ec928e4b2f71"
            },
            "skills": [
                {
                    "skillName": "string",
                    "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                    "osCreatedAt": "2024-04-11T11:21:17.207Z",
                    "osUpdatedBy": "anonymous",
                    "osCreatedBy": "anonymous",
                    "osid": "1-850896b6-77b9-47de-9c8e-695863d5fb2b",
                    "skillLevel": "string"
                }
            ],
            "userPreference": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "timePreferred": [
                    "9AM"
                ],
                "interestArea": [
                    "Teaching"
                ],
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "osUpdatedBy": "anonymous",
                "dayPreferred": [
                    "Monday"
                ],
                "osCreatedBy": "anonymous",
                "language": [
                    "English"
                ],
                "osid": "1-e9411628-d341-4d1e-a4cb-f0ea510e4470"
            },
            "osCreatedAt": "2024-04-11T11:21:17.207Z",
            "osCreatedBy": "anonymous",
            "volunteeringHours": {
                "osUpdatedAt": "2024-05-05T11:29:58.600Z",
                "hoursPerWeek": 4,
                "osCreatedAt": "2024-04-11T11:21:17.207Z",
                "totalHours": 3,
                "osUpdatedBy": "anonymous",
                "osCreatedBy": "anonymous",
                "osid": "1-a38cfa1b-6782-4df3-824b-68899ab3146c"
            }
        }
    }
  ]);
  console.log(userDetailsList)
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
        <div className="title-vHeader">Volunteer Dashboard</div>
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
            <div className={`tabs-vCoord ${activeTab === 'OnBoarded' ? 'activeVTab' : ''}`} onClick={() => handleTabClick('OnBoarded')}>
                <icon><CheckCircleOutlineIcon /> </icon>
                {statOnBoard ? statOnBoard.length : ''} On Boarded
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

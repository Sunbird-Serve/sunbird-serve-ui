import React, { useEffect, useState, useMemo } from 'react'
import './Nominations.css'
import axios from 'axios'
import { useTable, usePagination } from 'react-table'


const Nominations = props => {
  const [dataNoms,setDataNeed] = useState([
    {name:'raviteja',location:'warangal',dob:'20-08-1993',mobnum:'9000123456'},
    {name:'rajesh',location:'hyderabad',dob:'01-01-1996',mobnum:'9849456789 '}
  ]);
  const COLUMNS = [
    {Header:'Volunteer Name',accessor:'name'}, //
    {Header:'Location',accessor:'location'},
    {Header:'Date of Birth',accessor:'dob'},
    {Header:'Contact Info',accessor:'mobnum'},
    {Header:'Skills'},
    {Header:'Status'},
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

  return (
    <div className="wrapNominations">
        {/* table for reading list of nominations*/}
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
                    <tr {...row.getRowProps()} >
                        {row.cells.map((cell)=>{
                            return <td {...cell.getCellProps()}> {cell.render('Cell')}</td>
                        })}
                    </tr>
                )
            })}
        </tbody>
      </table>
    </div>
  )
}

export default Nominations
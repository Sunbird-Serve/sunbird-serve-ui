import React, {useState, useEffect,useMemo} from 'react'
import axios from 'axios'
import { useTable } from 'react-table'
import './NeedsTable.css'

export const NeedsTable = () => {
  const [dataNeed,setDataNeed] = useState([]);
  useEffect(()=> {
    axios.get('http://localhost:3031/Need').then(
      response => setDataNeed(response.data)
    );
  },[dataNeed])
  const COLUMNS = [
    { Header: 'Need Name', accessor: 'name'},
    { Header: 'Need Type', accessor: 'needTypeId'},
    { Header: 'Entity', accessor: 'entityId'},
    { Header: 'Volunteer'},
    { Header: 'Timeline'},
    { Header: 'Status', accessor: 'status'}
]
  const data = useMemo(() => dataNeed,[])
  const columns = useMemo(() => COLUMNS, [])

  const tableInstance = useTable ({
    columns,
    data
  })
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance

  return (
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
            {rows.map((row) => {
                prepareRow(row)
                return (
                    <tr {...row.getRowProps()}>
                        {row.cells.map((cell)=>{
                            return <td {...cell.getCellProps()}> {cell.render('Cell')}</td>
                        })}
                    </tr>
                )
            })}
        </tbody>
    </table>
  )
}

export default NeedsTable
import { useState } from "react"
import './AddRemoveInputField.css'

function AddRemoveInputField(){
    const [inputFields, setInputFields] = useState([{
        Name:'',
    } ]);
 
    const addInputField = ()=>{
        setInputFields([...inputFields, {
            Name:'',
        } ]) 
    }
    const removeInputFields = (index)=>{
        const rows = [...inputFields];
        rows.splice(index, 1);
        setInputFields(rows);
    }
    const handleChange = (index, evnt)=>{
        const { name, value } = evnt.target;
        const list = [...inputFields];
        list[index][name] = value;
        setInputFields(list);
    }

    return(
        <div className="container">
                {inputFields.map((data, index) => 
                    {const {Name, Details}= data;
                        return(
                            <div className="row" key={index}>
                                <div className="wrapName">
                                    <div className="col-name">
                                            <input type="text" onChange={(evnt)=>handleChange(index, evnt)} value={
                                            Name} name="Name" className="form-control"  placeholder="Name" />
                                    </div>
                                    <div className="col-remove"> {(inputFields.length!==1)? 
                                        <button className="btn btn-outline-danger" onClick={removeInputFields}>x</button>:''}
                                    </div>
                                </div>
                                <div className="col-details">
                                    <input type="text" onChange={(evnt)=>handleChange(index, evnt)} value={
                                            Details} name="Details" className="form-control"  placeholder="Details" />
                                </div>
                            </div>
                        )
                    })
                }
            <div className="rowAddNew">
                <button className="addNew" onClick={addInputField}>+</button>
            </div>
        </div>   
    )
}
export default AddRemoveInputField
//NEEDS raised by nCoordinator
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const configData = require('../configure.js');

const initialState = {
    data: [],
    status: 'idle',
    error: null
} 

export const fetchEntities = createAsyncThunk('needtypes/fetchEntities', 
    async ()=> {
    try {
        const response = await axios.get(`${configData.ENTITY_GET}/?page=0&size=200&status=Active`)
        return response.data
    } catch(error){
        throw error
    }
})

const entitySlice = createSlice({
    name: 'entities',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchEntities.pending, (state)=> {
            state.status = 'loading'
        })
        .addCase(fetchEntities.fulfilled,(state,action)=>{
            state.status = 'succeeded'
            state.data = action.payload
        })
        .addCase(fetchEntities.rejected,(state, action)=>{
            state.status = 'failed'
            state.error = action.error.message
        })
    }
})
export default entitySlice.reducer
//NEEDS raised by nCoordinator
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import configData from './../configData.json'

const initialState = {
    data: [],
    status: 'idle',
    error: null
}


export const fetchNeeds = createAsyncThunk('needs/fetchNeeds', 
    async ()=> {
    try {
        const response = await axios.get(`${configData.NEED_GET}/?page=0&size=10&status=New`)
        return response.data
    } catch(error){
        throw error
    }
})

const needSlice = createSlice({
    name: 'needs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchNeeds.pending, (state)=> {
            state.status = 'loading'
        })
        .addCase(fetchNeeds.fulfilled,(state,action)=>{
            state.status = 'succeeded'
            state.data = action.payload
        })
        .addCase(fetchNeeds.rejected,(state, action)=>{
            state.status = 'failed'
            state.error = action.error.message
        })
    }
})
export default needSlice.reducer
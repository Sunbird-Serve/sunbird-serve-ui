//NEEDS raised by a user
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import configData from './../configData.json'

const initialState = {
    data: [],
    status: 'idle',
    error: null
}

export const fetchNeedsByUid = createAsyncThunk('needs/fetchNeedsByUid', 
    async (userId)=> {
    try {
        const response = await axios.get(`${configData.NEED_GET}/user/${userId}?page=0&size=100&status=New`)
        return response.data
    } catch(error){
        throw error
    }
})

const needByUidSlice = createSlice({
    name: 'needsByUid',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchNeedsByUid.pending, (state)=> {
            state.status = 'loading'
        })
        .addCase(fetchNeedsByUid.fulfilled,(state,action)=>{
            state.status = 'succeeded'
            state.data = action.payload
        })
        .addCase(fetchNeedsByUid.rejected,(state, action)=>{
            state.status = 'failed'
            state.error = action.error.message
        })
    }
})
export default needByUidSlice.reducer
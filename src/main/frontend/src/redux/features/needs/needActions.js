import axios from 'axios'

//create actions
const FETCH_NEEDS_REQUEST = 'FETCH_NEEDS_REQUEST'
const FETCH_NEEDS_SUCCESS = 'FETCH_NEEDS_SUCCESS'
const FETCH_NEEDS_FAILURE = 'FETCH_NEEDS_FAILURE'

export const fetchNeedsRequest = () => {
    return {
        type: FETCH_NEEDS_REQUEST
    }
}

export const fetchNeedsSuccess = () => {
    return {
        type: FETCH_NEEDS_SUCCESS,
        payload: users
    }
}

export const fetchNeedsFailure = error => {
    return {
        type: FETCH_NEEDS_FAILURE,
        payload: error
    }
}  

export const fetchNeeds = () => {
    return (dispatch) => {
        dispatch(fetchNeedsRequest)
        axios.get('https://serve-v1.evean.net/api/v1/need/?page=0&size=10&status=Approved')
        .then(response => {
            const needs = response.data
            dispatch(fetchNeedsSuccess(needs))
        })
        .catch(error => {
            const errorMsg = error.message
            dispatch(fetchNeedsFailure(errorMsg))
        })
    }
}
// create reducer to operate on state in the store
const initialState = {
    loading: false,
    needs: [],
    errors: ''
}

const reducer = (state = initialState, action) => {
    switch(action.type){
        case FETCH_NEEDS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case FETCH_NEEDS_SUCCESS:
            return {
                ...state,
                loading: false,
                needs: action.payload,
                error: ''
            }
        case FETCH_NEEDS_FAILURE:
            return {
                ...state,
                loading: false,
                needs: [],
                error: action.payload
            }
    }
}
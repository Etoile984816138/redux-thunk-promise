const status = {
    START: 'START',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}

const asynAction = (dispatch, type, req) => {
    dispatch({
        type,
        status: status.START
    });
    return req().then(resp => {
        dispatch({
            type,
            status: status.SUCCESS,
            resp
        });
        return resp;
    }).catch(err => {
        dispatch({
            type,
            status: status.ERROR
        });
        return err;
    });

};
const createMiddleware = () => {
    return ({ dispatch }) => next => action => {
        if (action.request) {
            return asynAction(dispatch, action.type, action.request)
        }
        return next(action);
    }
}

export const asynReducers = (state, status, data) => {
    switch (status) {
        case status.START:
            return {
                ...state,
                loading: true
            };
        case status.SUCCESS:
            return {
                ...state,
                loading: false,
                ...data
            };
        case status.ERROR:
            return {
                ...state,
                loading: false
            };
    }
}

const middleware = createMiddleware();

export default middleware;
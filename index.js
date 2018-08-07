/** 
 * @file 创建一个基于redux-thunk的中间件
 * @description 对redux-thunk的promise请求进行再次封装，使action可以像同步代码一样写
 */

const status = {
    START: 'START',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}

const unset = (obj, prop) => {
    const result = Object.assign({}, obj);
    delete result[prop];
    return result;
}

const asynAction = (dispatch, action) => {
    const { type, request } = action;
    dispatch({
        type,
        status: status.START
    });
    return request().then(resp => {
        dispatch({
            ...unset(action, 'request'),
            status: status.SUCCESS,
            resp
        });
        return resp;
    }).catch(err => {
        dispatch({
            type,
            status: status.ERROR
        });
        throw err;
    });

};

export const asynReducers = (state, action, data = ()=>({})) => {
    const crtStatus = action.status;
    switch (crtStatus) {
        case status.START:
            return {
                ...state,
                loading: true
            };
        case status.SUCCESS:
            return {
                ...state,
                loading: false,
                ...data()
            };
        case status.ERROR:
            return {
                ...state,
                loading: false
            };
    }
};

const createMiddleware = () => {
    return ({ dispatch }) => next => action => {
        if (typeof (action.request) === 'function') {
            return asynAction(dispatch, action)
        }
        return next(action);
    }
};

const middleware = createMiddleware();

export default middleware;
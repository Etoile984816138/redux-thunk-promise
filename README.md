# redux-thunk-promise

对redux-thunk异步Action的一个简单封装，减少样板代码。

redux-thunk虽然可以满足我们对异步Action的大部分需求，但比较繁琐。首先我们需要创建三个Action Type(start,success,error)，然后在请求的三个阶段分别dispatch，在reducer中也需要对应这三个Action Type编写不同的state。虽然也可以使用其它的库，见异步[Action](http://cn.redux.js.org/docs/advanced/AsyncActions.html),但是redux-thunk的优势是通用，并且你可以发挥想象力无限拓展。

虽然每个异步请求不同，但大致过程是相同的，如都在start阶段把loading变成true，都在success、error阶段把loading变成false，都在success时更改数据等等等等……我们完全可以把这部分抽离出来，封装成函数调用。或者更进一步，既然是对action的处理，我们为什么不能把它封装成中间件呢？

### usage
#### 1. 引入middleware (创建store时)
``` js
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-thunk-promise';
import reducers from './reducers';

// middlewares
const middlewares = [];
if (process.env.NODE_ENV === 'development') {
    const {logger} = require('redux-logger');
    middlewares.push(logger);
}
middlewares.push(thunkMiddleware);
middlewares.push(promiseMiddleware);

// store
let store;
const createAppStore = () => {
    if (!store) {
        store = createStore(
            reducers, applyMiddleware(...middlewares)
        );
    }
    return store;
}

export default createAppStore;

```

#### 2. Action
``` js
export const getList = (param) => ({
    type: types.GET_LIST,
    request: () => api.getList(param)
});
```
api.getList为封装的fetch请求方法，返回promise对象。redux-thunk-promise中会判断request属性是否存在，存在则执行asynAction方法处理异步action，否则继续传递action到下个中间件。

#### 3. reducer
``` js
import { asynReducers } from 'redux-thunk-promise';

export default (state = initialState, action) => {
    switch (action.type) {
        case types.GET_AUDIT_LIST:
            return asynReducers(state, action.status, action.resp ? {
                list: action.resp.data.list,
                totalCount: action.resp.data.count
            } : {});
        default:
            return state;
    }
}
```


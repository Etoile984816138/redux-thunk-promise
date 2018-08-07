# redux-thunk-async

对redux-thunk异步Action的一个简单封装，减少样板代码。

redux-thunk虽然可以满足我们对异步Action的大部分需求，但比较繁琐。首先我们需要创建三个Action Type(start,success,error)，然后在请求的三个阶段分别dispatch，在reducer中也需要对应这三个Action Type编写不同的state。虽然也可以使用其它的库，见异步[Action](http://cn.redux.js.org/docs/advanced/AsyncActions.html),但是redux-thunk的优势是通用，并且你可以发挥想象力无限拓展组合。

虽然每个异步请求不同，但大致过程是相同的，如都在start阶段把loading变成true，都在success、error阶段把loading变成false，都在success时更改数据等等等等……我们完全可以把这部分抽离出来，封装成函数调用。或者更进一步，既然是对action的处理，我们为什么不能把它封装成中间件呢？

### usage
#### 1. 引入middleware (创建store时)
``` js
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-thunk-async';
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

#### 2. Action Creator
``` js
export const getList = (payload) => ({
    type: types.GET_LIST,
    request: () => api.getList(payload),
    payload
});
```

注意action参数中fetch方法需要使用request作为变量名，redux-thunk-async内部会判断action.request是否为function，是则判断为异步请求，否则为正常请求，数据流转到下一个中间件。api.getList为封装的fetch请求方法，返回promise对象。

属性 | 说明 
---- | --- 
type | 异步要执行的动作常量 
request |  fetch方法
payload |  action参数

#### 3. reducer

reducer中可以使用中间件所提供的asynReducers方法，在异步请求各个阶段为state添加相应数据，如loading等。当然也可以不引入自己写reducer。

``` js
import { asynReducers } from 'redux-thunk-async';

export default (state = initialState, action) => {
    switch (action.type) {
        case types.GET_LIST:
            return {
                ...asynReducers(state, action, () => ({
                    list: action.resp.data
                }))
            }
        default:
            return state;
    }
}
```

### asynReducers
#### Syntax 
asynReducers(state,action,data)
#### API
属性 | 说明 
---- | --- 
state | 当前state 
action |  当前action
data |  success时需修改的state业务数据

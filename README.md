## 目标

1. 使用Redux Toolkit实现一个主题切换功能
2. 使用Rust编写WebAssembly，通过Vite导入，再用Redux异步获取返回的数据



## 实现步骤

### 第一目标实现

#### 项目创建

```shell
pnpm create vite

✔ Project name: … redux-toolkit-example
✔ Select a framework: › react
✔ Select a variant: › react

cd redux-toolkit-example
pnpm i
pnpm dev
```



#### 依赖安装

```shell
pnpm i @reduxjs/toolkit react-redux
```

+ @reduxjs/toolkit：redux官方工具包，不需要再安装`redux` `redux-thunk` `redux-devtools-extension`等
+ react-redux：由于redux核心库适用于所有js框架，所以需要`react-redux`建立与react应用的联系



#### 修改模板代码

`src/index.css`

```css
* {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  margin: 0;
  padding: 0;
}
```

------

`src/App.jsx`

```react
import "./App.css"

function App() {
  return (
    <div className="App">

    </div>
  )
}

export default App
```

------

`src/App.css`

```css
.App {
  height: 100vh;
  width: 100vw;
}
```



#### 创建store

`src/store.js`

```javascript
import { configureStore } from "@reduxjs/toolkit"

const store = configureStore({
  reducer: {
    
  },
})

export default store
```

此处的`configureStore`做了以下工作：

+ 组合所有reducers，构建 root reducer，即传统写法中`combineReducers`的功能
+ 使用root reducer创建Redux store
+ 添加`thunk`中间件支持异步，即传统写法`redux-thunk`的功能
+ 添加错误提醒中间件
+ 建立与浏览器插件的连接，即传统写法`redux-devtools-extension`的功能



#### 创建slice

`src/features/themeSlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  background: "#261D1E",
  foreground: "#F5E6C4",
  primaryColor: "#F64404",
}

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    themeChanged: {
      reducer(state, action) {
        for (let i of Reflect.ownKeys(state)) {
          state[i] = action.payload[i]
        }
      }
    },
  },
})

export const { themeChanged } = themeSlice.actions

export default themeSlice.reducer

```

此处的`createSlice`做了以下工作：

+ 命名slice空间，相当于传统Redux action type`todos/added`中的`todos`
+ 传入初始状态`initialState`
+ 根据`reducers`下的属性名创建action函数，该函数返回一个action对象，此处`themeChanged`即是action函数
+ 创建reducer



注意点：

1. 传统Redux中是不能直接为state赋值的，state是不可变的，需要返回一个copy对象，但在Redux Toolkit中使用了`Immer`，这是react官方推荐的库，可以直接从***写法上***变为直接赋值，`Immer`内部会帮我们做copy
2. 由于reducer中的state是Proxy对象，不能对state直接赋值，如`state = action.payload`，这样会使redux无法工作
3. 不需要手动返回一个state，Redux Toolkit会监听state的变化，并发布给所有订阅者



#### 创建Card组件

`src/components/Card.jsx`

```react
import { useSelector } from "react-redux"

export default () => {
  const { background, foreground, primaryColor } = useSelector(
    (state) => state.theme
  )

  return (
    <div
      style={{
        backgroundColor: background,
        width: "50%",
        height: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        style={{
          backgroundColor: foreground,
          color: primaryColor,
          borderColor: foreground,
          fontSize: "2rem",
          lineHeight: "2.5rem",
          padding: "10px",
        }}
      >
        Change Theme
      </button>
    </div>
  )
}
```



#### 添加Card组件到App

`src/App.jsx`

```react
import "./App.css"
import Card from "./components/Card"

function App() {
  return (
    <div className="App">
      <Card />
    </div>
  )
}

export default App
```



#### 添加reducer到store

`src/store.js`

```js
import { configureStore } from "@reduxjs/toolkit"
import theme from "./features/themeSlice"

const store = configureStore({
  reducer: {
    theme,
  },
})

export default store
```

此处重命名状态为`theme`，可以通过`useSelector((state) => state.theme)`取值



#### 将store作为Provider的属性传递

`src/main.jsx`

```react
import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import store from "./store"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
```

此时应该可以看到Card组件的默认样式



#### 触发更改主题

`src/components/Card.jsx`

```react
import { useSelector, useDispatch } from "react-redux"
import { themeChanged } from "../features/themeSlice.js"

const fakeTheme = {
  background: "#F7F6DC",
  foreground: "#B1D7B4",
  primaryColor: "#7FB77E",
}

export default () => {
  const dispatch = useDispatch()
  const { background, foreground, primaryColor } = useSelector(
    (state) => state.theme
  )

  const handleClick = () => {
    dispatch(themeChanged(fakeTheme))
  }

  return (
    <div
      style={{
        backgroundColor: background,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        style={{
          backgroundColor: foreground,
          color: primaryColor,
          fontSize: "2rem",
          lineHeight: "2.5rem",
          padding: "10px",
        }}
        onClick={handleClick}
      >
        Change Theme
      </button>
    </div>
  )
}
```

使用`useDispatch`获取dispatch方法，`themeSlice`创建的`themeChanged`函数返回一个action对象作为dispatch方法的参数，此处的action对象为：

```js
{
    "type": "theme/themeChanged",
    "payload": {
        "background": "#F7F6DC",
        "foreground": "#B1D7B4",
        "primaryColor": "#7FB77E"
    }
}
```

可以看到，`type`属性的值为`themeSlice`的`name`属性值`theme`和reducer名（也与action函数同名）`themeChanged`组合而成。

再加上点击事件就完成了基本的Redux流程，第一目标Done！



### 第二目标实现

#### 安装wasm-pack

```shell
cargo install wasm-pack wasm-bindgen-cli
```



#### 使用wasm-pack创建模板项目

```shell
wasm-pack new color-changer
```

如果发生错误，可以手动执行`wasm-pack new color-changer`的动作：

1. 安装`cargo-generate`

   ```shell
   cargo install cargo-generate
   ```

2. 使用模板创建项目

   ```shell
   cargo generate --git https://github.com/rustwasm/wasm-pack-template --name color-changer
   ```



#### 修改模板代码

`color-changer/Cargo.toml`

```toml
[package]
authors = ["NaT5uK1 <o0desolation@hotmail.com>"]
edition = "2021"
name = "color-changer"
version = "0.1.0"

[lib]
crate-type = ["cdylib", "rlib"]

[features]
default = ["console_error_panic_hook"]

[dependencies]
wasm-bindgen = {version = "0.2.63", features = ["serde-serialize"]}
console_error_panic_hook = {version = "0.1.6", optional = true}
getrandom = {version = "0.2.7", features = ['js']}
rand = "0.8.5"
serde = {version = "1.0.144", features = ["derive"]}
wee_alloc = {version = "0.4.5", optional = true}

[dev-dependencies]
wasm-bindgen-test = "0.3.13"

[profile.release]
opt-level = "s"

[package.metadata.wasm-pack.profile.release]
wasm-opt = false
```

------

删除`color-changer/src/utils.rs`



#### 编写功能函数

`color-changer/src/lib.rs`

```rust
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Theme {
    name: String,
    background: String,
    foreground: String,
    primary: String,
}

#[wasm_bindgen]
impl Theme {
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str, background: &str, foreground: &str, primary: &str) -> Theme {
        Theme {
            name: name.to_string(),
            background: background.to_string(),
            foreground: foreground.to_string(),
            primary: primary.to_string(),
        }
    }
}

fn color_generate() -> Vec<Theme> {
    let warm: Theme = Theme::new("warm", "#B270A2", "#FF8FB1", "#FCE2DB");
    let cold: Theme = Theme::new("cold", "#AFB4FF", "#9C9EFE", "#A66CFF");
    vec![warm, cold]
}

#[wasm_bindgen]
pub fn color_changer(name: &str) -> JsValue {
    let theme_list = color_generate();
    let mut res = &theme_list[0];
    for theme in &theme_list {
        if name == theme.name {
            res = &theme;
        }
    }
    JsValue::from_serde(res).unwrap()
}

#[wasm_bindgen]
pub fn color_random() -> JsValue {
    let theme_list = color_generate();
    let mut rng = thread_rng();
    let index = rng.gen_range(0..theme_list.len());
    JsValue::from_serde(&theme_list[index]).unwrap()
}
```

在WebAssembly中，无法将复杂类型映射到JavaScript，如果函数的返回值是一个结构体，那么你在前端将会得到形如`MyStruct{ptr:12345678}`的对象。解决方案是通过Serde将结构体类型的值序列化后，返回`JsValue`即可。



#### 编译wasm

```shell
wasm-pack build
```

构建完毕后在`color-changer/pkg/`目录下可以找到构建结果，构建产物是一个缺失部分属性的Npm包



#### 配置Vite使项目可以通过ESM的方式引入WebAssembly

```shell
pnpm i -D vite-plugin-wasm@^2
```

`vite.config.js`

```js
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm(),react()],
  build: {
    target: "esnext",
  },
})
```



#### 前端模拟API

```shell
cd ..
```

`src/api/index.js`

```js
import { color_random as colorRandom } from "../../color-changer/pkg"

export const asyncColorRandom = () => {
  return new Promise((resolve) => {
    resolve(colorRandom())
  })
}

export { color_random as colorRandom } from "../../color-changer/pkg"
```



#### 为slice添加异步Action与Reducer

`src/features/themeSlice.js`

```js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { colorRandom, asyncColorRandom } from "../api/index"

const themeSlice = createSlice({
  name: "theme",
  initialState: colorRandom(),
  reducers: {
    themeChanged: {
      reducer(state, action) {
        for (let i of Reflect.ownKeys(state)) {
          state[i] = action.payload[i]
        }
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRandomColor.fulfilled, (state, action) => {
      for (let i of Reflect.ownKeys(state)) {
        state[i] = action.payload[i]
      }
    })
  },
})

export const getRandomColor = createAsyncThunk(
  "theme/getRandomColor",
  async () => {
    const response = await asyncColorRandom()
    return response
  }
)

export const { themeChanged } = themeSlice.actions

export default themeSlice.reducer
```



#### 修改组件派发异步Action

`src/components/Card.jsx`

```react
import { useSelector, useDispatch } from "react-redux"
import { getRandomColor } from "../features/themeSlice.js"


export default () => {
  const dispatch = useDispatch()
  const { background, foreground, primary } = useSelector(
    (state) => state.theme
  )

  const handleClick = () => {
    dispatch(getRandomColor())
  }

  return (
    <div
      style={{
        backgroundColor: background,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        style={{
          backgroundColor: foreground,
          color: primary,
          borderColor: foreground,
          fontSize: "2rem",
          lineHeight: "2.5rem",
          padding: "10px",
        }}
        onClick={handleClick}
      >
        Change Theme
      </button>
    </div>
  )
}
```



到此，第二目标完成！快使用`pnpm dev`试试吧！

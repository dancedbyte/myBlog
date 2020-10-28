---
title: Webpack4 使用总结
tags: Webpack
categories: 前端工程化
date: 2020-10-08
index_img: /img/webpack_1.jpg
---

# Webpack
1. webpack是一个模块打包器，主要实现将所有js文件打包在一起以供浏览器使用。

2. 能集成各种 loader plugin，以打包、转换任何类型（css、jsx、less ...）的资源。

3. webpack4 比 webpack3 构建速度快了98%，提倡零配置即可快速构建，当然要实现一个完整的项目也需要手动去完善，所以学好细化 webpack 还是很重要的。

## 核心概念

### 入口（entry）
webpack开始构建的地方，webpack通过入口文件，**递归**找出所有依赖文件。
```js
module.exports = {
    entry: './src/index.js'
}
```

>   多页开发时。如何优雅的遍历所有入口文件？

```js
const reg = /.+\/([a-zA-Z]+-[a-zA-Z]+)(\.entry\.js|jsx$)/g;
const str = './books-add.entry.jsx'; // 将 books 作为一级目录。将 add 作为模块名称。
const str1 = './books-add.entry.js';

if(reg.test(str)) {
  console.log(RegExp.$1); // books-add

  const [dist, template] = RegExp.$1.split("-"); // 拿到 一级目录 及 模板名称
} else {
  console.log('else')
}
```

### 输出（output）
通知webpack在哪里输出所构建的模块，以及如何命名这些输出文件。
```js
const isEnvProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        // 生产环境使用 hash 值来命名文件。文件内容变则 hash 值变
        filename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
    }
}
```

### 转换器（loader）
由于 webpack 自身只支持打包js文件，而 loader 能够让 webpack 处理那些非 js 文件，并且将它们转换为浏览器能识别的有效模块。

当 use 多个 loader 时，loader 的执行顺序是**从后往前**的。 

#### 基本使用
```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/i, // 正则匹配
                use: [
                    'cache-loader', // 对当前 loader 的处理过程进程缓存    
                    'style-loader', 
                    {
                        loader: 'css-loader',
                        // 给loader传入的任意配置项
                        options: {
                          minimize: true, 
                        }
                    }
                ]
            }
        ]
    }
}
```

#### 编写同步loader
loader就是一个函数，接收source（当前文件内容），处理后return一个新的文件内容。

如下示例中将字符串文本先转化成 ast，通过遍历 ast 将 const 或 let 转化成 var，最后再返回字符串。
```js
'use strict';

const loaderUtils = require('loader-utils'); // webpack 的一个工具类，通过一些方法配合 loader 处理文件
const acorn = require('acorn'); // 转换 ast
const walk = require('acorn-walk'); // 对 ast 进行操作
const MagicString = require('magic-string'); // 魔法字符串，提供内置方法可以直接操作字符串。如 overwrite append 等方法

module.exports = function (content) {
    const options = loaderUtils.getOptions(this); // 配置文件 如上面的 options: {minimize: true,}

    console.log('前置钩子', this.data.value); // 这里是 prev

    const ast = acorn.parse(content); // 生成 ast
    const code = new MagicString(content); // 用魔法字符串包裹

    walk.simple(ast, {
        // 指 ast 树中 type 为 VariableDeclaration 的变量声明部分
        VariableDeclaration(node) {
            const {start, kind} = node;
            const len = kind === 'const' ? 5 : 4; // kind 有 const 或 let
            
            code.overwrite(start, start + len, 'var'); // const result = '🏮'; 取前5位即 const -> 转化成 var
        },
    });
    return code.toString();
};

// loader 的前置钩子。在此 loader 执行前做一些操作
module.exports.pitch = function (remainingRequest, prevRequest, data) {
    data.value = '这里是 prev';
};
```

#### 编写异步loader
如果 loader 有些场景需要通过网络请求获取数据才能完成，如果采用同步的方式就会造成整个构建阻塞，所以可以编写 **异步loader**。
```js
module.exports = function(source) {
    // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
    const callback = this.async();
    
    this.props.ajax.get('/api/getData')
        .then(res => {
            // 通过 callback 返回异步执行后的结果
            // TODO 处理数据
            const result = JSON.stringify(res) + source; 
            
            callback(null, result);  
        })
};
```

### 插件（plugins）
webpack 使用 [tapable](https://github.com/webpack/tapable) 这个库实现整个构建流程上钩子函数的创建。

webpack 会在内部对象上创建多个生命周期钩子，插件本质是一个类，通过将插件挂载到合适的钩子上，webpack 执行到该钩子函数时就会触发所绑定的插件。

插件可以更精密地控制 webpack 的输出，包括：打包优化、资源整合等。

#### 基本使用
```js
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  plugins: [
    new HardSourceWebpackPlugin(), // 对前一次构建结果进行缓存（内存或硬盘上），只有第二次打包时才能看出来效果
  ]
};
```

#### 编写插件
可以利用 webpack 提供的钩子函数，编写自定义插件，相当于监听 webpack 的事件，做出对应的响应。
```js
function createHtml(type, array) {
    let result = "";
    if (type === "js") {
        array.forEach((url) => result += `<script src="${url}"></script>`);
    }
    if (type === "css") {
        array.forEach((url) => result += `<link href="${url}" rel="stylesheet"></link>`);
    }
    
    return result;
}

class AfterHtmlPlugin {
    apply(compiler) {
        // 通过 hooks 可以拿到 webpack 构建流程中的钩子函数
        // 在这个钩子函数 compilation 上挂载 AfterHtmlPlugin
        compiler.hooks.compilation.tap('AfterHtmlPlugin', (compilation) => { // compilation 一次编译过程
            // 拿取 js、css
            HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
                'AfterHtmlPlugin',
                (data, cb) => {
                    // data.assets 静态资源
                    this.jsArray = data.assets.js;
                    this.cssArray = data.assets.css;

                    cb(null, data); // 告诉 webpack 我做完了
                }
            );

            // 打包完成前，读取html，并重新写入 js、css
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                'AfterHtmlPlugin',
                (data, cb) => {
                    const scriptString = createHtml("js", this.jsArray);
                    const linkString = createHtml("css", this.cssArray);

                    data.html = data.html.replace("<!-- injectjs -->", scriptString);
                    data.html = data.html.replace("<!-- injectcss -->", linkString);

                    cb(null, data); // 告诉 webpack 我做完了
                }
            );
        });
    }
}
```

## webpack 优化
webpack4 取消了 UglifyjsWebpackPlugin，使用minimize进行压缩。

取消了CommonsChunkPlugin，使用splitChunks进行分包。

### 拆分文件（splitChunks）
<img src='/img/webpack_1_2.png' width=300 />

>   为什么webpack4默认帮我们做了分包，我们还需要自己配置分包呢？
    
    1. 通过webpack默认分包图可以看出不仅main.js，包括其他bundle.js，都含有 node_modules 和 src 下的代码。
    
    2. 这样造成的问题是每次业务(src)代码变动，都会导致 bundle 的 hash 发生变化，则js缓存失效就需要重新下载，但 node_modules 下的文件根本没有变动也需要一起打包。
    
    3. 因为webpack只做了入口文件的公共代码分析，也就是main.js，所以如果入口文件没有引入，那么其它chunk页面里的公共代码并没有抽出，导致每个bundle都有重复打包代码的情况，最后整个项目文件较大。

#### 默认配置
```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'async', // 参数可能是：all，async和initial，这里表示拆分异步模块。
      minSize: 30000, // 如果模块的大小大于30kb，才会被拆分
      maxAsyncRequests: 5, // 按需加载时最大的请求数，意思就是说，如果拆得很小，就会超过这个值，限制拆分的数量。
      maxInitialRequests: 3, // 入口处的最大请求数
      automaticNameDelimiter: '~', // webpack将块的名称和文件名称组合（例如vendors~main.js）
      
      // 上面说的这些属性，都将作用于 cacheGroups
    
      // splitChunks 根据 cacheGroups 去分割
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/, // 只筛选从 node_modules 文件夹下引入的模块，如 lodash 等
          priority: -10 // 优先级。数值越大，则越优先分配，如果一个模块满足了多个缓存组，则会根据该字段去判断。
        },
        // default 优先级低于 vendors            
        default: {
          minChunks: 2, // 一个模块至少出现2次引用时，才会被拆分
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 多线程打包（Happypack）
webpack 构建流程最耗时间的其实就是递归遍历各个 entry 入口文件寻找依赖，每次递归都需要经历 string -> ast-> string 的流程，且可能还需要 loader 进行转换。

HappyPack 可以将 Loader 的同步执行转换为并行的，这样就能充分利用系统资源来加快打包效率了。

**如果项目大、且大部分耗时在 loader 处理部分，推荐可以用 Happypack 。如果项目较小用 Happypack 耗时反而会增加**。

>   HappyPack 工作原理？

    1. 在Webpack和Loader之间多加了一层，改成了Webpack并不是直接去和某个Loader进行工作，而是Webpack 监测到需要编译某个类型的资源模块后，将该资源的处理任务交给了HappyPack。
    
    2. 由于 HappyPack 在内部线程池中进行任务调度，分配一个线程来处理该loader对应的资源，完成后上报处理结果给webpack，最后由Webpack输出到目的路径。
    
    3. 通过一系列操作，将原本都在一个Node.js线程内的工作，分配到了不同的线程中并行处理。
    
```js
// webpack.config.js
const HappyPack = require('happypack');
const os = require('os'); // 获取系统 cpu 内核数
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length }); // 创建线程池

module.exports = {
  module: {
      rules: [
          {
            test: /\.(js|jsx)$/,
            use: 'happypack/loader?id=jsx' // 该类型文件的处理交给 id 为 jsx 的线程
          },
        
          {
            test: /\.less$/,
            use: 'happypack/loader?id=styles'
          }                        
      ]
  },
  plugins: [
    new HappyPack({
      id: 'jsx',
      threadPool: happyThreadPool,
      loaders: ['babel-loader']
    }),
    new HappyPack({
      id: 'styles',
      threadPool: happyThreadPool,
      loaders: ['style-loader', 'css-loader', 'less-loader']
    })
  ]
};
```

### 细节优化

#### 常规优化
1. 在处理 loader 时，配置 include，缩小 loader 检查范围。

2. 使用 alias 配置别名可以更快地找到对应文件，如 @ 代表 /src。

3. 如果在 require 模块时不写后缀名，默认 webpack 会尝试.js,.json 等后缀名匹配，配置 extensions，可以让 webpack 少做一点后缀匹配。

4. 使用 cache-loader 对特定 loader 的处理过程启用持久化缓存。

```js
module.exports = {
      module: {
            rules: [
                  {
                    test: /\.js$/,
                    use: ['cache-loader', 'babel-loader'],
                    include: path.resolve('src'),
                  },
            ],
      },
};
```

5. 使用 noParse 属性，可以设置不必要的依赖解析，例如：我们知道 lodash 是无任何依赖包的，就可以设置此选项，缩小文件解析范围。

6. 使用插件 webpack-bundle-analyzer 对打包的统计文件进行分析。

#### 开发环境优化
1. 注意配置 mode。开发环境一般不需要代码压缩合并、单独提取文件等操作。

2. 使用 externals 配置全局对象，避免打包。
    
```
大致可以理解为：
1. 如果需要引用一个库，但是不想让webpack打包它（减少打包的时间）
2. 并且又不影响我们在程序中以CMD、AMD、es6Module 等方式进行使用，需要用户环境来提供，那就可以通过配置externals。
3. 如下示例。总得来说，externals配置就是为了使import _ from 'lodash'这句代码，在本身不引入lodash的情况下，能够在各个环境都能解释执行。
```
```
import _ from 'lodash'; // 在我们的组件中使用 lodash

// webpack 中做如下配置
externals: {
      "lodash": {
        commonjs: "lodash", // 如果我们的库运行在Node.js环境中，import _ from 'lodash'等价于const _ = require('lodash')
        amd: "lodash", // 如果我们的库使用require.js等加载,等价于 define(["lodash"], factory);
      }
}    
```

3. 使用 speed-measure-webpack-plugin 插件显示打包速度分析，如我们可以看到处理 Loader、Plugin 分别用了多少时间，以便做专项优化。

4. webpack 会在输出文件中**生成路径信息注释**。可以在 output.pathinfo 设置中关闭注释。

#### 生产环境优化
1. 静态资源上 cdn。

```
output: {
       publicPath: 'http://cdn.abc.com'  // 修改所有静态文件 url 的前缀（如 cdn 域名）
}
```

2. 使用 tree shaking，只打包用到的模块，删除没有用到的模块，但是 tree-shaking有一个问题，无法识别到函数作用域中没有用的函数变量等，所以可以用webpack-deep-scope-plugin。

3. scope hoisting 作用域提升，使打包出来的文件更小运行更快，减少了跨作用域互相调用的情况。尽可能将打散的模块合并到一个函数中，前提是不能造成代码冗余。 **因此只有那些被引用了一次的模块才能被合并**。如下：

```js
// 启用 scope hoisting。
// ① production模式下自动开启。
// ② 如果开发模式下想使用可以手动配置，webpack 内置了该插件。

module.exports = {
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
}
```
```js
// main.js
export default "hello~";

// index.js
import str from "./main.js";
console.log(str);


// 打包后代码分析

// 未开启 hoisting。会创建两个闭包，通过 webpack 封装的 exports 和 require 进行导出引入
[
    (function (module, __webpack_exports__, __webpack_require__) {
        var __WEBPACK_IMPORTED_MODULE_0__main_js__ = __webpack_require__(1);
        console.log(__WEBPACK_IMPORTED_MODULE_0__main_js__["a"]);
    }),
    (function (module, __webpack_exports__, __webpack_require__) {
        __webpack_exports__["a"] = ('hello~');
    })
]

// 开启 hoisting。 将引入的内容直接注入到模块中
[
  (function (module, __webpack_exports__, __webpack_require__) {
    var main = ('hello~');
    console.log(main);
  })
]
```

4. 使用 hard-source-webpack-plugin 插件对整个工程**开启缓存**。

#### 相关代码
```js
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer"); // 文件分析
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); // 整个工程开启缓存

module.exports = {
  output: {
    publicPath: '//xxx/cdn.com', // 静态资源上cdn
    pathinfo: false // 不生成「所包含模块信息」的相关注释
  },
  
  module: {
    noParse: /lodash/, // 不去解析 lodash 的依赖库
    rules: [
      {
        test: /\.txt$/,
        use: ['cache-loader', 'raw-loader'], // 通过 cache-loader 对具体的某个 loader 开启缓存
        include: path.join(__dirname, 'src') // 缩小loader检查范围
      }
    ]
  },
  
  plugins: [
    new ModuleConcatenationPlugin(), // 开启scope hoisting
    new HardSourceWebpackPlugin(), // 整个工程开启缓存
  ],
  
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src') // 使用别名，加快搜索
    },
    extensions: ['js', 'css'] // 配置用到的后缀名，方便webpack查找
  },
  
  // 开发阶段引用cdn上文件，可以避免打包库文件
  externals: {
    react: 'react',
    redux: 'redux',
    antd: 'antd'
  }
};
```

## webpack 构建流程
图片摘自 [Webpack 系列使用总结](https://lmjben.github.io/blog/devops-webpack.html)！

<img src='/img/webpack_1_1.png' width=550 />

1、读取 webpack.config.js 配置文件，生成 compiler 实例，并把 compiler 实例注入 plugin 中的 apply 方法中。

2、读取配置的 Entries，递归遍历所有的入口文件。

3、对入口文件进行编译，开始 compilation 过程，依次进入每一个入口文件，使用 loader 对文件内容编译，通过compilation可以读取到module的resource（资源路径）、loaders（使用的loader）等信息。再将编译好的文件内容使用 acorn 解析成 AST 静态语法树。在 AST 语法树中可以分析到模块之间的依赖关系，对应做出优化。

4、递归依赖的模块，**重复第 3 步**。

5、执行 compilation 的 seal 方法对每个 chunk 进行整理、优化。将所有模块中的 require 语法替换成 __webpack_require__ 来模拟模块化操作。

6、最后把所有的模块打包进一个自执行函数（IIFE）中。

## 常用插件汇总

### yargs-parser
解析命令行参数，一般传入 process.argv 来获取当前模式是开发还是生产。 

process.argv 属性会返回一个数组，其中包含当 Node.js 进程被启动时传入的命令行参数。

```json
{
  "scripts": {
    "build": "webpack --mode development"
  }
}
```

```js
// webpack.config.js

const argv =  require('yargs-parser')(process.argv.slice(2)); // {mode: "development"}
const _mode = argv.mode || "development";
```

### webpack-merge
合并 webpack 配置文件。

```js
// webpack.config.js

const _mergeConfig = require(`./config/webpack.${_mode}.config.js`);
const merge = require('webpack-merge');

const webpackConfig = {};

module.exports = merge(_mergeConfig, webpackConfig);
```

### hard-source-webpack-plugin
缓存技术，对前一次构建结果进行缓存，所以只有第二次打包时才能看出效果。

第一次构建时，插件就会默认把缓存结果（我理解是每个文件会有一个 hash 值，通过 hash 值去对应结果）存到内存或硬盘中，第二次构建的时候再取出缓存使用。
```js
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
    plugins: [
        new HardSourceWebpackPlugin()
    ]   
}
```

## 参考链接
- [Webpack官网](https://webpack.js.org/)
- [前端日志](https://lmjben.github.io/blog/)
- [CSDN博客](https://blog.csdn.net/wk843620202/article/details/106417113)

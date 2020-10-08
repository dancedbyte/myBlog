---
title: Webpack 使用记录（一）
tags: Webpack
categories: 前端工程化
date: 2020-10-08
index_img: /img/webpack_1.jpg
---

# Webpack
1. webpack是一个模块打包器，主要实现将所有js文件打包在一起以供浏览器使用。

2. 能打包、转换任何类型（css、jsx、less ...）的资源。

3. webpack4 比 webpack3 构建速度快了98%，提倡零配置即可快速构建，当然要实现一个完整的项目也需要手动去完善，所以学好细化 webpack 还是很重要的。

## 核心概念
1. 入口（entry）

2. 输出（output）

3. 转换器（loader）

4. 插件（plugins）

### 入口（entry）
webpack开始构建的地方，webpack通过入口文件，**递归**找出所有依赖文件。
```js
module.exports = {
    entry: './src/index.js'
}
```

### 输出（output）
通知webpack在哪里输出所构建的模块，以及如何命名这些输出文件。
```js
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.bundle.js'
    }
}
```

### 转换器（loader）
由于 webpack 自身只支持打包js文件，而 loader 能够让 webpack 处理那些非 js 文件，并且将它们转换为浏览器能识别的有效模块。

#### 基本使用
```js
module.exports = {
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/i, // 正则匹配
                use: [
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
```js
const loaderUtils = require('loader-utils');

module.exports = function(source) {
  // 获取loader中传递的options配置信息
  const options = loaderUtils.getOptions(this);
  
  // 返回处理后的内容
  // this.callback 是 Webpack 给 Loader 注入的 API，以方便 Loader 和 Webpack 之间通信.
  this.callback(null, '/ *增加一个注释 */' + source);
  
  return; // 当使用 this.callback 返回内容时，该 Loader 必须返回 一个 undefined，让webpack知道是通过 callback 去输出内容。
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
插件本质是一个类，通过监听 webpack 构建流程上的钩子函数，可以更精密地控制 webpack 的输出，包括：打包优化、资源整合等。

#### 基本使用
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })]
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
        compiler.hooks.compilation.tap('AfterHtmlPlugin', (compilation) => { // compilation 一次编译过程
            // 拿取 js、css
            HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
                'AfterHtmlPlugin',
                (data, cb) => {
                    // data.assets 静态资源
                    this.jsArray = data.assets.js;
                    this.cssArray = data.assets.css;

                    cb(null, data);
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

                    cb(null, data);
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
<img src='http://note.youdao.com/yws/res/10248/WEBRESOURCEdee9efc746caca3a2f8e2373d74b43c2' width=300 />

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
      minChunks: 1, // 引用次数大于1时该模块才会被拆分出来
      maxAsyncRequests: 5, // 按需加载时最大的请求数，意思就是说，如果拆得很小，就会超过这个值，限制拆分的数量。
      maxInitialRequests: 3, // 入口处的最大请求数
      automaticNameDelimiter: '~', // webpack将使用块的名称和名称生成名称（例如vendors~main.js）
      name: 'test', // 拆分块的名称 可自定义
      cacheGroups: {
        // 缓存splitchunks
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10 // 优先级，数值越大，越先执行
        },
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
  ],
  module: {
      rules: [
          {
            test: /\.js$/,
            use: 'happypack/loader?id=jsx'
          },
        
          {
            test: /\.less$/,
            use: 'happypack/loader?id=styles'
          }                        
      ]
  }
};
```

### 细节优化

#### 常规优化
1. 在处理 loader 时，配置 include，缩小 loader 检查范围。

2. 使用 alias 配置别名可以更快地找到对应文件，如 @ 代表 /src。

    
3. 如果在 require 模块时不写后缀名，默认 webpack 会尝试.js,.json 等后缀名匹配，配置 extensions，可以让 webpack 少做一点后缀匹配。

4. 使用 cache-loader 启用持久化缓存。

5. 使用 noParse 属性，可以设置不必要的依赖解析，例如：我们知道 lodash 是无任何依赖包的，就可以设置此选项，缩小文件解析范围。

6. 使用插件 webpack-bundle-analyzer 对打包的统计文件进行分析。

#### 开发环境优化
1. 注意配置 mode。开发环境一般不需要代码压缩合并、单独提取文件等操作。

2. 在开发阶段，可以直接引用 cdn 上的库文件，使用 externals 配置全局对象，避免打包。
    
    ```
    大致可以理解为：
    1. 如果需要引用一个库，但是不想让webpack打包它（减少打包的时间）
    2. 并且又不影响我们在程序中以CMD、AMD、es6Module 等方式进行使用，那就可以通过配置externals。
    ```

3. webpack 会在输出文件中生成路径信息注释。可以在 output.pathinfo 设置中关闭注释。

#### 生产环境优化
1. 静态资源上 cdn。

    ```
    output: {
           publicPath: 'http://cdn.abc.com'  // 修改所有静态文件 url 的前缀（如 cdn 域名）
    }
    ```

2. 使用 tree shaking，只打包用到的模块，删除没有用到的模块，但是 tree-shaking有一个问题，无法识别到函数作用域中没有用的函数变量等，所以可以用webpack-deep-scope-plugin。

3. 配置 scope hoisting 作用域提升，将多个函数合并为一个函数去执行，减少了跨作用域互相调用的情况。

#### 相关代码
```js
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer"); // 文件分析

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
        use: 'raw-loader',
        include: path.join(__dirname, 'src') // 缩小loader检查范围
      }
    ]
  },
  
  plugins: [
    new ModuleConcatenationPlugin() // 开启scope hoisting
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
    redux: 'redux'
    antd: 'antd'
  }
};
```

## webpack 构建流程
上大图！！图片摘自 [前端日志](https://lmjben.github.io/blog/)！

<img src='http://note.youdao.com/yws/res/10357/WEBRESOURCE4bad39013b4de8ad76c5e07df387603b' width=550 />

1、读取 webpack.config.js 配置文件，生成 compiler 实例，并把 compiler 实例注入 plugin 中的 apply 方法中。

2、读取配置的 Entries，递归遍历所有的入口文件。

3、对入口文件进行编译，开始 compilation 过程，依次进入每一个入口文件，使用 loader 对文件内容编译，通过compilation可以读取到module的resource（资源路径）、loaders（使用的loader）等信息。再将编译好的文件内容使用 acorn 解析成 AST 静态语法树。在 AST 语法树中可以分析到模块之间的依赖关系，对应做出优化。

4、递归依赖的模块，**重复第 3 步**。

5、执行 compilation 的 seal 方法对每个 chunk 进行整理、优化。将所有模块中的 require 语法替换成 __webpack_require__ 来模拟模块化操作。

6、最后把所有的模块打包进一个自执行函数（IIFE）中。

## 参考链接
- [Webpack官网](https://webpack.js.org/)
- [前端日志](https://lmjben.github.io/blog/)
- [CSDN博客](https://blog.csdn.net/wk843620202/article/details/106417113)

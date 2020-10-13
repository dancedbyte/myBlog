---
title: 现代化 CSS 
tags: CSS
categories: CSS
date: 2020-10-09
index_img: /img/css_1.jpg
---

## css 发展
1. 手写原生css
2. 使用预处理器（如less等）
    
    ```
    ① 原生css不支持嵌套、不支持声明变量、不支持父选择器等。
    ② 预处理器主要是强化了 css 的语法，弥补了编写原生css时的问题，但实际上打包出来的结果和原生的 css 都是一样的，只是对开发者友好，写起来更顺滑。
    ```

3. 使用后处理器（如postcss）

    ```
    ① postcss 可以称作为 css 界的 babel，它的实现原理是通过 ast 去分析我们的 css 代码，然后将分析的结果进行处理。
    ② 如自动增加浏览器前缀 -webkit、编译CSS next 语法、转换rem等。
    ③ 现在postcss基本实现前后通吃，比较强大。
    ```

4. css模块化

    ```
    ① 随着组件化和业务越来越复杂，很多类名会重名，则会出现样式覆盖等问题。
    ② 主要解决类名重复、代码难以复用、结构不清晰等问题
    ```

5. 使用 css in js

## css 模块化

### BEM 命名规范
BEM 即块（block）、元素（element）、修饰符（modifier）。

只是定义一个规则，在命名上去约束开发者，但是如果开发者不注意或不遵守则还是会造成重名的问题。

```css
.box_content_title {
    color: red;
}
```

### CSS Modules

#### 基本使用
css modules 允许我们像importjs 一样去引入css代码。css中的类名是引入对象的一个属性。

```css
.h1 {
  color: green;
}

/* 编写全局样式，在打包时该类名不会被转换成hash值 */
:global(.className) {
  color: red;
}

/* composes 继承类名 */
.otherClassName {
  composes: h1;
  color: yellow;
}

/* composes 继承引入的css中的类名 */
.otherClassName {
  composes: className from "./another.css";
}
```

#### 配置打包
css modules 不能直接使用，而是需要经过打包编译，一般通过配置 css-loader 中的 modules 属性即可完成 css modules 的配置。

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use:{
          loader: 'css-loader',
          options: {
            modules: {
              // 类名 + 5位 hash 字符串
              localIdentName: '[local]-[hash:base64:5]',
            }
          }
       }
    ]
  }
};
```

### css in js
一种编程思想，不需要css文件，将css全部写到js文件中，通过插件 styled-components 可以实现。

主要目的是可以充分利用js变量，实现样式复用，但违背了css、js分离的原则。

```js
import styled from "styled-components";

// 创建一个带样式的 section 标签
const Wrapper = styled.section`
  padding: 12px;
  background: red;
`;

<Wrapper>
  标题
</Wrapper>
```

## CSS Houdini 
1. js in css 模式的一种实现

2. CSS Houdini 希望建立一系列的 api，让开发者能够介入浏览器关于 css 的相关操作，以解決 css 浏览器兼容性等问题。

3. 关于更多 api 可参考 [CSS Houdini](https://lmjben.github.io/blog/css-houdini-star.html#css-houdini-%E7%AE%80%E4%BB%8B)

### 简单练习
用 CSS Houdini 实现星空的效果。

**HTML**
```html
<body>
    <script>
      // 通过 Worklets 引入 
      CSS?.paintWorklet?.addModule?.('./sky.js') ??
        (() => {
          console.log('很遗憾 您的浏览器暂不支持Houdini');
        })();
    </script>
</body>
```

**CSS**
```css
<style>
  body {
    margin: 0;
    color: #fff;
    font-size: 24px;
    background: #000;
  }
  
  /* 小技巧：通过对伪元素进行操作避免body反复发生重排重绘 */
  body:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    --star-density: 0.8;
    --star-opacity: 1;
    background-image: paint(yd-sky); /*调用paint函数*/
  }
  
  body:before {
    animation: shine 1s linear alternate infinite;
  }
  
  @keyframes shine {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.4;
    }
  }
</style>
```

**JS**
```js
// sky.js

class YdSky {
    static get inputProperties() {
        return ['--star-density', '--star-opacity'];
    }

    /*
        ctx: 当前上下文 可以理解为一块画布
        geom: PaintSize {width: 1680, height: 619}
        properties: 属性列表
     */
    paint(ctx, geom, properties) {
        const xMax = geom.width;
        const yMax = geom.height;

        ctx.fillRect(0, 0, xMax, yMax);

        const starDensity = properties.get('--star-density').toString() || 1; // 获取 星星密度
        const hmTimes = Math.round((xMax + yMax) * starDensity); // 绘制星星的数量
        
        for (let i = 0; i <= hmTimes; i++) {
            const x = Math.floor(Math.random() * xMax + 1);
            const y = Math.floor(Math.random() * yMax + 1);
            const size = Math.floor(Math.random() * 3 + 1);
            const opacity1 = Math.floor(Math.random() * 9 + 1);
            const opacity2 = Math.floor(Math.random() * 9 + 1);
            const opacity = +('.' + (opacity1 + opacity2)) * starDensity;
            const hue = Math.floor(Math.random() * 360 + 1);
            
            ctx.fillStyle = `hsla(${hue},30%,80%,${opacity})`;
            ctx.fillRect(x, y, size, size);
        }
    }
}

// 注册星星绘画方法，提供给页面paint函数调用
registerPaint('yd-sky', YdSky);
```

**浏览器Elements**

<img src='/img/css_1_1.png' width=400 />

**效果图**

<img src='/img/css_1_2.png' width=400 />

## CSS NEXT
css next 代表下一代的 css 规范，目前主流浏览器已经支持css next语法，以后就不需要再使用预处理器来实现这些规则了。

更多语法可参考：[CSS NEXT](https://cssnext.github.io/features/)

1. 自定义变量（--）、使用（var）

```css
/* 全局的 */
:root {
  --globalColor: red;
}

div {
  --innerColor: green; /* 局部的 */
  color: var(--globalColor);
  background: var(--innerColor);
}
```

2. 自定义一套规则，通过 @apply 复用

```css
:root {
    --centered: {
        display: flex;
        align-items: center;
        justify-content: center;
    };
}

.box {
    @apply --centered;
}
```

3. @custom-media 自定义媒体查询

```css
@custom-media --only-medium-screen (width >= 500px) and (width <= 1200px);

@media (--only-medium-screen) {
  color: red;
}
```

4. 嵌套选择器。（浏览器暂不支持，需经过postcss-loader处理）

```css
/* &指代上一级 */
a {
  & span {
    color: white;
  }
}
```

5. image-set() 函数。根据不同的屏幕分辨率，自动使用对应大小的图片

```css
.box {
  background-image: image-set(
    url(img/test.png) 1x,
    url(img/test-2x.png) 2x,
    url(my-img-print.png) 600dpi
  );
}
```

6. supports() 函数。类似于js的if，如果支持，则...

```css
@supports (display: flex) {
    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
}
```

## css-doodle
是用来绘制css图案的web组件，可以制造出很炫酷的图形。

写个练习。更多可参考 [官网](https://css-doodle.com/)

<img src='/img/css_1_3.png' width=240 />

#### css

```css
/* css基本样式 */
<style>
  * {
      margin: 0;
      padding: 0;
  }
  :root {
      --customUnitWidth: 100vw;
      --customUnitHeight: 100vh;
      --bgColor: #0a0c27;
  }
  html,
  body {
      width: var(--customUnitWidth);
      height: var(--customUnitHeight);
      background: var(--bgColor);
      display: flex;
      align-items: center;
      justify-content: center;
  }
</style>
```

#### html
1. 定义 10 列的栅格，除以 31.8vmax 来限定栅格整体大小。
2. hsla() 函数使用色相、饱和度、亮度、透明度来定义颜色。
3. @place-cell:center; 规定以中心点作为圆心。

```html
<body>
    <css-doodle>
      :doodle { @grid: 1 x 10 / 31.8vmax; } 
      @place-cell:center;
      @size:calc(@index() * 10%);
      border-width: calc(@index() * 1vmin);
      border-style: dashed;
      border-color: hsla(calc(20 * @index()),70%,68%,calc(3/@index()*.8));
      border-radius: 50%;
      --d:@rand(20s,40s);
      --rf:@rand(360deg);
      --rt:calc(var(--rf) + @pick(1turn,-1turn));
      animation: spin var(--d) linear infinite;
      @keyframes spin {
        from{
          transform: rotate(var(--rf));
        }
        to{
          transform: rotate(var(--rt));
        }
      }
    </css-doodle>
</body>
```

## 参考链接

- [CSS Modules 用法教程](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)
- [前端日志](https://lmjben.github.io/blog/css-next.html#css-next-%E8%A7%84%E5%88%99)

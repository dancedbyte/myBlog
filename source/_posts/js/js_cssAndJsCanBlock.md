---
title: css与js是否会影响dom的解析与渲染？
tags: JavaScript
categories: JavaScript
date: 2020-10-02
index_img: /img/js_cssAndJsCanBlock.jpg
---

## js加载 会影响 dom 的解析与渲染吗？ 
不会影响dom的解析，但是会影响dom的渲染！！

```html
<body>
<h1>标题</h1>
<script>
    prompt('等待'); // 会先弹出弹框，只有确定后才开始渲染h1
</script>
</body>
```

## css加载 会影响 dom 的解析与渲染吗？
不会影响dom的解析，但是会影响dom的渲染！！

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        h1 {
            color: red;
        }
    </style>
    <!--  css 加载会影响dom树的渲染，发现当css未加载回来时，标题不会渲染出来  -->
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap-grid.css" rel="stylesheet">
</head>
<body>
<h1>标题</h1>
</body>
</html>
```

## css加载 会阻塞它后面js语句的执行吗？
会阻塞！！因为可能js中会有addClass等方法去修改css，所以它必须等css都加载完再去执行js。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script>
        console.log('before css');
    </script>
    <!--  before css 会先输出，等css加载完，end css 才会输出  -->
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap-grid.css" rel="stylesheet">
</head>
<body>
<h1>标题</h1>
<script>
    console.log('end css');
</script>
</body>
</html>
```

## DOMContentLoaded 何时执行？
1. 当有css需要加载时，并且在css后面有js代码，那么 DOMContentLoaded 需要等待css加载完才去执行。
2. 其他情况下 DOMContentLoaded 会在dom解析完成之后直接执行，不会等待css、图片、视频等的加载。

>   为什么css后面一旦有了js语句，DOMContentLoaded就会后执行？
    
    因为 DOMContentLoaded 也不确定后面的js是否会去改变dom，比如removeChild等操作，所以它必须等js
    执行完成后才去触发。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded');
        })
    </script>
    <!-- 简单的打印 会在css加载完成之后先输出，然后输出 DOMContentLoaded。 -->
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap-grid.css" rel="stylesheet">
</head>
<body>
<h1>标题</h1>
<script>
    console.log('简单的打印');
</script>
</body>
</html>
```

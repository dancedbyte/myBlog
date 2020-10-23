---
title: TypeScript 基础使用（一）
tags: TypeScript
categories: TypeScript
date: 2020-10-17
index_img: /img/ts_1.jpg
---

# TypeScript
遵循es6语法，拓展了基于类的面向对象编程特性。

## 优势
- 允许支持类型检查，更友好的编辑器提示，所以在开发中可以减少错误的发生。
- 强大的IDE支持，例如修改某个变量名，所有使用它的都会被自动修改。
- 代码语义化，更清晰易懂，例如可以轻松知道一个函数需要的参数及类型。

## 特性
- js是动态类型的如声明一个string类型的变量，可以把它变成整型或其他类型。但ts是静态类型的，不可以改变变量的类型。
- 不能直接运行在浏览器，需要编译成js才可以。

## 搭建开发环境
将ts文件编译成js文件，ts是遵循es6语法的，但是很多浏览器还不支持es6语法，需要转成es5的。
```
npm i -g typescript

tsc --init // 初始化生成tsconfig.json
```

## 基本语法

### 基础类型
null, undefined, number, string, boolean, symbol, void(空值)，any，unknown(ts 3.0新增)，never

> unknown 是 any 的安全版本，虽然他们都可以代表任何类型。但 unknown 表示这个变量或函数还未被确定类型时，是不能进行实例化、函数执行等操作。

```typescript
// 方式1
let count: number;
count = 123;

// 方式2 用 | 代表或
let count: number | string = 123;
count = '123'; // 不会报错
```

```typescript
// never 表示那些永远不存在的值类型

const empty: never[] = []; // 空数组，而且永远是空的

// 抛出异常的函数，永远也不会有返回值
function error(message: string): never {
    throw new Error(message);
}
```

### 对象类型
class, object, function, array，enum（枚举）

**function**
```typescript
// 写法1
const func = (str: string): number => {
    return parseInt(str);
};

// 写法2 
// (str: string) => number 表示函数接收string为参数转化为number类型
// (str) => { return parseInt(str); } 是func1真正的函数体
const func1: (str: string) => number = (str) => {
    return parseInt(str);
}
```

**array 数组**
```typescript
// 数组中是基本类型
const arr: number[] = [1, 2, 3]; // 代表数组元素都是number类型
const arr: (number | string)[] = [1, '2', 3]; // 用|代表数组元素多样性

// 数组中是对象类型
type User = {name: string, age: number}; // 类型别名，将类型抽离出来
const arr: User[] = [{
    name: 'ghm',
    age: 24
}]
```

**array 元组**
```
// 当数组长度固定，且元素类型固定时，可用元组。
const info: [string, string, number] = ['1', '2', 3];

const infoList: [string, string, number][] = [
    ['1', '2', 3],
    ['4', '5', 6]
    ['7', '8', 9]
];
```

**enum 枚举**
```typescript
// 当一个元素有多种不同的取值时，可以用枚举来列出，如果不给他们赋值，则他们的值默认是从 0 开始累加的。

// 数字枚举
enum Direction {
    Up, // 默认 0 如果我们把 Up = 5 进行赋值后，那么 Down 会自动累加为 6
    Down // 默认 1
}

// 字符串枚举
enum Direction {
    Up = 'Up',
    Down = 'Down',
}
console.log(Direction['Right'], Direction.Up); // Right Up

// 反向映射
enum Direction {
    Up, 
    Down
}
console.log(Direction[0]); // Up

// 联合枚举类型
enum Direction {
    Up, 
    Down
}
declare let a:Direction;
a = Direction.Up; // 正确 因为 a 可以看作联合类型 Direction.Up | Direction.Down
```

### 类型注解 类型推断
类型推断是ts帮我们完成的。不需要去显式声明。
```typescript
interface Point {
    a: number,
    b: number
}

// add返回值一定是number类型，ts会通过函数推断。
// 所以不需要给add函数声明number类型。
function add(obj: Point) {
    return obj.a + obj.b;
}

const total = add({a: 1, b: 2}); // 如果a b 不是number类型则报错
console.log(total);
```

### 函数相关

**void**
```typescript
function add(num: number): void {
    console.log(111);
    // return 111; // 声明void则不能有返回值。return 的话则报错
}
```

**never**
```typescript
// 声明never的函数永远不能执行到最后。
function errorTest(): never {
    throw Error('');
    console.log(111); // 因为抛出了错误，所以不会执行到console。这样属于never类型的函数。
}
```

**解构时声明类型**
```typescript
// {} : {a: number, b: number} 的格式
function add({a, b} : {a: number, b: number}) {
    return a + b;
}
```

### 类型推断 as
在 js 中我们声明一个空对象，然后对空对象添加属性，这样是符合规范的。但是在 ts 中是不行的，所以需要类型推断。

```typescript
// js 
const obj = {};
obj.name = 'draw'; // js 是允许这样使用的

// ts
interface IUser {
  name: string
}
const obj = {} as IUser; // 因为ts一开始不知道我们以后会有 name 属性。所以加个类型推断
obj.name = 'draw'; // 现在可以正常使用了
```

### interface接口
interface只是约束我们在开发过程中的规范性，真正编译成js时interface相关代码会被剔除掉。

**基础使用**
```typescript
interface Person {
    readonly name: string, // readonly表示name属性是只读的，不能修改变量的值
    age?: number, // 加上?表示这个属性不是必须的，可有可无
    [propName: string]: any, // 允许接收string类型的属性，且允许属性值是任何类型
    say(): string, // 接收say方法，且返回值必须是string类型
}
```

**定义函数的类型声明**
```typescript
interface sayHi {
    (name: string, age: number): string,
}

const say: sayHi = (name, age) => name + age;

say('ghm', 24);
```

**类继承接口**
```typescript
// 类中必须声明接口里所有需要传递的属性
class User implements Person {
    name: 'ghm',
    say() {
        return '123';
    }
}
```

**接口抽离公共类型声明**
```
interface Common {
    name: string
}
interface Student extends Common {
    age: number
}
interface Teacher extends Common {
    teachingAge: number
}
const show = (user: Common) => {
    console.log(user.name); // 当只想要某个属性时，且很多接口都有这个属性，那么才可以把这个属性抽离到公共接口中
};
show({
    name: 'dell',
    age: 123, // 会报错 因为Common接口中没有age声明，所以抽离公用类型时，要注意。
});
```

### type类型映射
如果我们写好了一个接口，现在需要将里面的属性全变成可选的、或只读的。那么就需要类型映射。

ts 内置的映射方法有： Partial（可选）、Readonly（只读）、Pick（抽取）、Required(将属性变成必选)

**Partial**
```typescript
// Partial
interface IUser {
    username: string,
    id: number,
}
type TypeIUser = Partial<IUser> // ts 内置方法

const testFunc = (obj: TypeIUser) => {};
testFunc({username: 'a'});

// Partial 源码实现
type partial<T> = {
    [K in keyof T]?: T[K] // 也是应用了泛型的概念，配合 in keyof
}
interface IUser {
    username: string,
    id: number,
}
type TypeIUser = partial<IUser>

const testFunc = (obj: TypeIUser) => {};
testFunc({username: 'a'});

// Partial 如果是嵌套对象呢？就需要递归一下
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
  ? DeepPartial<T[K]>
  : T[K]
};
type DeepUser = DeepPartial<IUser>
```

**Pick**
```typescript
interface IUser {
    username: string,
    id: number,
    age: number
}
// 抽取出自己想要的类型声明
type PickIUser = Pick<IUser, 'username' | 'id'>;
/*
*   PickIUser = {
*       username: string,
        id: number,
*   }
* 
* */
```

### 类的基本使用

**super调用父类的中方法**
```typescript
class Person {
    name: string = 'g';
    getName() {
        return this.name;
    }
}
class Ghm extends Person {
    getName() {
        return super.getName() + 'hm'; 
    }
}
const ghm = new Ghm();
console.log(ghm.getName());
```

**constructor简化语法、进行初始化赋值**
```typescript
// 传统写法
class Person {
    public name: string;
    
    constructor(name) {
        this.name = name;
    }
}

// 简化写法
class Person {
    constructor(public name: string) {}
}
const ghm = new Person('ghm');
```

**类的继承**
```typescript
class Person {
    constructor(public name: string) {}
}
class Ghm extends Person {
    constructor(public age: number) {
        super('ghm'); // 必须手动调用super方法，且需把父类需要的参数传递过去
    }
}
const ghm = new Ghm(24);
console.log(ghm.name + ghm.age); // ghm24
```

**访问类型**
```
// 允许属性或方法在类的内外被调用。
public

// 允许属性或方法只能在类的内部被调用。
private

// 允许属性或方法在该类及子类的内部被调用。
protected
```

**静态属性 setter 和 getter**
```typescript
// 提供了一种能力，使可以访问私有变量。经常配合private使用。
class Person {
    constructor(private _name: string) {}

    // 当想访问私有变量时，可以定义get方法
    get name() {
        return this._name;
    }

    set name(name: string) {
        const realName = name.split(' '); // 提供set的能力，接收到变量后进行处理，再对私有变量进行设置。

        this._name = realName[0];
    }
}

const person = new Person('dell');
console.log(person.name); // dell 调用了name方法，但是不要加()。这是ts提供给get的能力，像调用属性一样去调用方法即可

person.name = 'dell lee';
console.log(person.name); // dell 
```

**单例模式**
```typescript
// 即一个类只能创建一个实例。
class Person {
    private static instance: Person;

    constructor(public name: string) {}

    static getInstance() {
        if(!this.instance) {
            this.instance = new Person('dell');
        }
        return this.instance;
    }
}

const p1 = Person.getInstance();
console.log(p1.name); // dell
const p2 = Person.getInstance();
console.log(p2.name); // dell 都是dell，说明Person类只被创建了一次。
```

### 抽象类
1. abstract声明，抽象类只能被继承，不能被实例化，主要作用是将一些公用方法进行封装。

2. 抽象类中可以定义抽象方法，抽象方法可以不用去实现，可以只声明。

3. 普通类继承抽象类后，抽象类中的抽象方法，普通类必须去实现，否则报错。

**基本使用**
```typescript
abstract class Common {
    width: number;
    getType() {
        return 'common'
    };
    abstract getArea(): number; // 抽象类中定义抽象方法。返回值是number类型
}

class Circle extends Common {
    // 必须去实现getArea。否则报错
    getArea(): number {
        return 123;
    }
}
```

## 装饰器
1. 装饰器其实就是一个函数，用来修改或增加类的行为。

2. 装饰器会在类创建完成后去执行，而不是实例化时。

3. 类装饰器接收的参数是**构造函数**。

4. 当一个类有多个装饰器时，装饰器中定义的方法执行顺序由下向上。

**工厂模式修饰类**
```typescript
function testDecorator() {
  return function<T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
      name = 'lee';
      getName() {
        return this.name;
      }
    };
  };
}

// 返回一个装饰器去修饰传进去的类
const Test = testDecorator()(
  class {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
);

const test = new Test('dell');
console.log(test.getName()); // lee
```

**修饰函数**
```typescript
// 普通方法，target 对应的是类的 prototype
// 静态方法，target 对应的是类的 构造函数
// key: 函数名字
// descriptor: 定义了一些方法操作相关的属性，例如writable等

function getNameDecorator(target: any, key: string, descriptor: PropertyDescriptor) {
  // console.log(target, key);
  // descriptor.writable = true;

  // 表示重写了getName
  descriptor.value = function() {
    return 'decorator';
  };
}

class Test {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  @getNameDecorator
  getName() {
    return this.name;
  }
}

const test = new Test('dell');
console.log(test.getName());
```

## 泛型
1. 设计泛型的关键目的是希望**在成员之间提供有意义的约束**。

2. 这些成员可以是：函数参数、函数返回值、类的方法、类的实例成员。

3. 泛型约束，如果我们要设计一个函数，该函数接受两个参数，一个是对象，一个是对象的某一个属性，通过这两个参数来完成该函数的返回值。

```typescript
function getVal<T extends object, U extends keyof T>(obj: T, key: U) {
    return obj[key]
}
```

### 使用场景 1
例如想实现一个队列，需要推入和类型和弹出的类型保持一致。**当然通过限制推入的类型也可以实现。但用泛型来实现可能会更优雅**。

```typescript
// 创建一个泛型类
class Queue<T> {
  private data: T[] = [];
  push = (item: T) => this.data.push(item);
  pop = (): T | undefined => this.data.shift();
}

// 简单的使用
const queue = new Queue<number>();
queue.push(0);

// 如果想实现也可以传入字符串。只需 const queue = new Queue<number | string>();
queue.push('1'); // Error：不能推入一个 string，只可以是 number 类型。
```

### 使用场景 2
例如一个用于加载请求返回值的函数，它返回你任何传入类型的 Promise。

```typescript
const getJSON = <T>(config: { url: string; headers?: { [key: string]: string } }): Promise<T> => {
    const fetchConfig = {
        method: 'GET',
        ...(config.headers || {})
    };
    
    return fetch(config.url, fetchConfig).then<T>(response => response.json());
};

type LoadUserResponse = {
    user: {
        name: string;
        email: string;
    }[];
};

// 不需要注解 loadUser 函数的返回类型，因为它能够被推出来
function loaderUser() {
    return getJSON<LoadUserResponse>({ url: 'https://example.com/users' });
}
```

### 使用场景 3
项目中配合 axios 使用。通常我们会把接口返回类型单独放在一个 interface 中。

```typescript
// 处理 接口数据 返回类型
export interface ResponseData<T = any> {
  code: number; // 状态码
  result: T; // 想要的数据
  message: string; // 提示信息
}

function getUser<T>() {
   return axios.get< ResponseData<T> >('/api/getUserList')
         .then(res => res.data)
         .catch(err => console.error(err));
}

// 定义 User 即我们想要的 result 的返回类型
interface User {
  name: string;
  age: number;
}

async function test() {
  /*
  user 被推断出为：
  {
      code: number,
      result: { name: string, age: number },
      message: string
  }
  */
  const user = await getUser<User>();
}
```

### 使用场景 4
实现一个 pick 函数，即可以从一个对象上取出指定的属性。

```js
const user = {
    username: 'Jessica Lee',
    id: 460000201904141743,
    token: '460000201904141743',
    avatar: 'http://dummyimage.com/200x200',
    role: 'vip'
}
```

```typescript
// js 实现
function pick(obj, keys) {
  return keys.map(it => obj[it])
}
pick(user, ['username'])

// ts 简单实现
interface IUser {
  [key: string]: any
}
function pick(obj: IUser, keys: string[]) {
  return keys.map(it => obj[it])
}
pick(user, ['username', 'avatar'])

// ts 泛型实现
// 实现思路：先编写参数 obj 和 names 对应的泛型。通过需求可发现 K 一定属于 keyof T。T[K][] 是 pick 函数返回值
function pick<T, K extends keyof T>(obj: T, names: K[]): T[K][] {
    return names.map(n => obj[n]);
}

pick(user, ['token', 'id',]);
```

## interface 与 type 区别

### 相同点

#### 都可以描述一个对象或函数

```typescript
interface User {
      name: string
      age: number
}
interface SetUser {
       (name: string, age: number): void;
}   
```

```typescript
type User = {
       name: string
       age: number
};
type SetUser = (name: string, age: number)=> void; 
```

#### 都允许实现继承。且允许互相去继承。

```typescript
// type 继承 type  
type User = {
      name: string
}
type User1 = User & {age: number}    
```

```typescript
// interface 继承 type  
type User = {
     name: string
}
interface User1 extends User {
       age: number
}    
```
   
### 不同点

#### type 可以但 interface 不行

1. type 可以声明基本类型、联合类型、元祖（数组的每个位置类型都可确定即元组）。**但 interface 只能声明对象类型**。

```typescript
// 基本类型别名
type Name = string

interface Dog {
    wong();
}
interface Cat {
    miao();
}
type Pet = Dog | Cat // 联合类型

// 具体定义数组每个位置的类型
type PetList = [Dog, Pet]
```

2. 通过 type 可以直接定义 typeof 返回的数据类型

```typescript
const user = {
    name: 'draw'
};

type B = typeof user;

const user1: B = {
    name: 'king'
};
```

#### interface 可以但 type 不行

1. interface 可以自动将声明合并

```typescript
interface User {
    name: string
    age: number
}
interface User {
    sex: string
}

/*
User 接口为 {
  name: string
  age: number
  sex: string 
}
*/
```

## 参考链接
- [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/typings/generices.html#%E5%8A%A8%E6%9C%BA%E5%92%8C%E7%A4%BA%E4%BE%8B)
- [interface 和 type 区别](https://juejin.im/post/6844903749501059085)

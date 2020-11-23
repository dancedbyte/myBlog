---
title: git 踩坑记录
tags: git
categories: 前端工程化
date: 2020-11-11
index_img: /img/git_1.jpg
---

## 前置知识
完整的 git 项目，一般分为：本地工作区、暂存区、本地仓库、远程仓库。

1. 工作区：在还没有 git add 前是属于本地工作区。

2. 暂存区：一旦 git add 了就会将某文件添加到暂存区。

3. 本地仓库：添加到暂存区后再执行 git commit 就会将所选文件推入到本地仓库。

4. 远程仓库：commit 后执行 git push 会将本地仓库的文件推入到远程仓库。

## 版本回退
需要回退的情况一般分为两种：commit 到本地仓库了想要回退、push 到远程仓库了需要回退。

### git reset

#### 本地仓库回退
git 的版本回退速度非常快，因为 git 在内部有个指向当前版本的 HEAD 指针，当你回退版本的时候，git 仅仅是把 HEAD 指向回退的版本号。

一般开发完 commit 到本地了，但是发现竟然是在 master 分支上开发的，这时候就需要撤销本次 commit。

1. 回退到上一次提交

```
# HEAD 代表：上一次提交。这样刚刚提交的就又回到本地的local changes 列表中。
git reset HEAD~
```

2. 回退到提交的指定版本

```
# 通过该命令可打印所有的 commit 记录，包括提交的版本号。如 abb2d1b79cfabdaa420b7307eda55ae1daa60aed 
git log

# 回退到指定版本
git reset commit_id
```

>   git reset 三个参数说明：

```
# 有三个参数：--mixed（默认）、–soft、–hard（慎用）

# --mixed（默认）和 --soft 都可以回退到某一版本，并且会在暂存区保留文件的修改信息。
git reset commit_id
git reset commit_id --soft # 改变了 HEAD 指针的指向

# --hard 回退到某一版本，取消之前的commit，取消暂存区的修改信息
git reset commit_id --hard
```

#### 远程仓库回退
如果不小心把代码提交到远程了，也不要慌。确保当前在你想要回退的分支上，然后执行如下命令。
```
# 1. 本地使用 get reset --hard ,切换到特定的 commit。当然 --hard --soft 等参数可以根据需要去修改。
git reset --hard commit_id

# 2. 使用 --force 推送到指定远程分支。这里推送到了远程的 master
git push --force origin master
```

### git revert
上面说了 git reset 。其实版本回退还有一个命令就是 git revert，叫“反做”。

用法 与 git reset 一致，**但有一个不同点**：reset 会将回退指定版本号后的所以 commit 都给删除。而 revert 不是，revert 会保留 commit 信息，并且这次回退会生成一个新的 commit。

## 随笔

### .gitignore 忽略已提交过的文件
如果不小心把多余的文件 push 到远程仓库了。可以用下面的命令表示不想再对该文件进行版本控制。然后在 .gitignore 中加入该忽略文件。

必须要执行该命令，**直接在 .gitignore 中加入是无效的**。

```
git rm -r --cached xxx   # xxx 表示不再想版本控制的文件或目录，--cached 表示不会把本地的 xxx 删除
git add . # 然后再次提交
git commit -m 'update .gitignore'
git push
```

### yarn.lock 文件的坑
yarn 是包管理工具，虽然不属于 git 部分，但也就写在这里吧。

yarn.lock 顾名思义是版本锁，在我们安装包时会默认在项目根目录下生成一个 yarn.lock 文件。

>   该文件作用？

1. 该文件包含有关已安装的每个依赖包的确切版本信息及代码校验，**以确保多人协作时或别人用你项目时因为包版本产生问题**。

2. 并且会避免由于开发人员意外更改或则更新版本，而导致意料之外的情况！

>   该文件使用时我遇到的坑？

1. 通过 jenkins 去构建项目时，执行 shell 脚本发现一些包一直提示连接超时，加了淘宝镜像也不管用，如下：

    ```
    yarn --registry=https://registry.npm.taobao.org
    yarn build
    ```

2. 通过排查发现，需要去修改项目中 yarn.lock 文件，在该文件中会为每一个包指定版本及镜像源。通过如下修改后部署成功。

    ```
    # 发现很多包的镜像源还是国外的
    resolved "https://registry.npmjs.org/@ant-design/icons-react/-/icons-react-1.1.2.tgz#df25c4560864f8a3b687b305c3238daff048ed72"
    # 全局搜索 registry.npmjs.org 然后改为淘宝镜像源 registry.npm.taobao.org
    resolved "https://registry.npm.taobao.org/@ant-design/icons-react/-/icons-react-1.1.2.tgz#df25c4560864f8a3b687b305c3238daff048ed72"
    ```

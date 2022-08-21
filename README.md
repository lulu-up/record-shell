## record-shell (记录命令行命令)

* 方便高效记录命令行命令, 利好记性不好的同学

<hr>

### github : https://github.com/lulu-up/record-shell

### 详细配置请看文章: https://segmentfault.com/a/1190000042353870

<hr>

### 一、安装

```shell
npm install record-shell -g
```
- 要安装在全局

### 二、使用

1. 查看列表 + 使用命令

```shell
  rs ls
```

- 查看详细信息, 展示命令详情
```shell
  rs ls -a

```
<hr>

2. 记录命令

```shell
  rs add
```

- 比如输入命令: echo [内容]  则执行命令时会可插入"内容"

<hr>

3. 移除命令

```shell
  rs rm

```

- 唤出多选列表: 批量删除

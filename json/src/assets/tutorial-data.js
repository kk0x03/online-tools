export const tutorialChapters = [
  {
    title: '一、什么是 JSON',
    content: `JSON (JavaScript Object Notation) 是一种轻量级的数据交换格式。它基于 JavaScript 的对象语法，但独立于编程语言，几乎所有现代语言都支持 JSON。

JSON 的特点：
- 易于人类阅读和编写
- 易于机器解析和生成
- 基于键值对和有序列表两种结构
- 使用 Unicode 编码，支持中文等多语言字符

JSON 的常见用途：
- Web API 的数据传输格式
- 配置文件（如 package.json、tsconfig.json）
- 数据存储和交换
- NoSQL 数据库（如 MongoDB）的存储格式

JSON 文件的扩展名为 .json，MIME 类型为 application/json。`
  },
  {
    title: '二、基础语法',
    content: `JSON 的核心语法规则：

1. 数据用键值对表示，键和值之间用冒号 : 分隔
   "name": "张三"

2. 键必须是双引号包裹的字符串（单引号不行）
   正确: {"name": "张三"}
   错误: {'name': '张三'}

3. 多个键值对之间用逗号 , 分隔
   {"name": "张三", "age": 25}

4. 对象用花括号 {} 包裹
   {"name": "张三", "age": 25}

5. 数组用方括号 [] 包裹
   ["Vue", "React", "Angular"]

6. 最后一个元素后面不能有逗号
   正确: {"a": 1, "b": 2}
   错误: {"a": 1, "b": 2,}

7. 不支持注释（没有 // 或 /* */ 语法）`
  },
  {
    title: '三、数据类型',
    content: `JSON 支持以下 6 种数据类型：

1. 字符串 (String)
   用双引号包裹的文本
   "hello"
   "你好世界"
   "C:\\\\Users\\\\name"（反斜杠需要转义）

2. 数字 (Number)
   整数或浮点数，不区分 int 和 float
   42
   -3.14
   1.2e10（科学计数法）

3. 布尔值 (Boolean)
   只有两个值：true 或 false（小写）
   true
   false

4. 空值 (Null)
   表示空值，只有 null（小写）
   null

5. 对象 (Object)
   无序的键值对集合
   {"name": "张三", "age": 25}

6. 数组 (Array)
   有序的值列表，可以混合类型
   [1, "hello", true, null, {"key": "value"}]`
  },
  {
    title: '四、对象与数组',
    content: `对象（Object）是键值对的无序集合：
{
  "name": "张三",
  "age": 25,
  "email": "zhangsan@example.com"
}

对象的键必须是字符串，值可以是任意类型：
{
  "count": 100,
  "active": true,
  "tags": ["admin", "user"],
  "metadata": null
}

数组（Array）是值的有序列表：
["apple", "banana", "cherry"]

数组可以包含任意类型的值：
[42, "hello", true, null, {"key": "value"}, [1, 2, 3]]

通过索引访问数组元素（从 0 开始）：
fruits[0] → "apple"
fruits[2] → "cherry"

对象和数组可以相互嵌套，构成复杂的数据结构。`
  },
  {
    title: '五、嵌套结构',
    content: `JSON 的强大之处在于支持任意深度的嵌套：

对象嵌套对象：
{
  "user": {
    "name": "张三",
    "address": {
      "city": "北京",
      "district": "海淀区"
    }
  }
}

数组嵌套对象：
{
  "users": [
    {"name": "张三", "age": 25},
    {"name": "李四", "age": 30}
  ]
}

复杂的混合嵌套：
{
  "company": "ABC科技",
  "departments": [
    {
      "name": "技术部",
      "members": [
        {"name": "张三", "role": "前端"},
        {"name": "李四", "role": "后端"}
      ],
      "budget": 1000000.5
    }
  ]
}

访问嵌套数据使用点号或方括号：
company.departments[0].members[1].name → "李四"`
  },
  {
    title: '六、常见错误',
    content: `以下是编写 JSON 时常见的错误：

1. 使用单引号包裹字符串
   错误: {'name': '张三'}
   正确: {"name": "张三"}

2. 键没有用引号包裹
   错误: {name: "张三"}
   正确: {"name": "张三"}

3. 多余的尾随逗号
   错误: {"a": 1, "b": 2,}
   正确: {"a": 1, "b": 2}

4. 使用了 JSON 不支持的值
   错误: {"time": new Date()}
   错误: {"fn": function() {}}
   错误: {"val": undefined}
   正确: {"time": "2024-01-01T00:00:00Z"}

5. 特殊字符没有转义
   错误: {"path": "C:\\Users\\name"}
   正确: {"path": "C:\\\\Users\\\\name"}
   常见转义: \\" \\\\ \\/ \\b \\f \\n \\r \\t \\uXXXX

6. 注释语法
   错误: {"a": 1 /* comment */}
   JSON 不支持注释，如需说明可使用特殊键:
   正确: {"a": 1, "_comment": "this is a comment"}

7. 十六进制数字
   错误: {"color": 0xFF0000}
   正确: {"color": 16711680}
   或者使用字符串: {"color": "#FF0000"}`
  }
]

export default {
  slug: 'classdiagram',
  title: '类图',
  subtitle: 'Class Diagram',
  description: '类图用于描述面向对象编程中的类结构、属性、方法以及类之间的关系（继承、组合、依赖等）。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 classDiagram 关键字声明。class 定义类，: 后面定义方法和属性。+ 表示 public，- 表示 private，# 表示 protected。',
      code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +String breed
        +fetch() void
    }
    Animal <|-- Dog`
    },
    {
      title: '类关系',
      explanation: '类之间可以有多种关系：<|-- 继承，*-- 组合，o-- 聚合，--> 关联，..> 依赖，..|> 实现。可以在关系上添加标签。',
      code: `classDiagram
    class Engine {
        +start() void
        +stop() void
    }
    class Car {
        +String model
        +drive() void
    }
    class Driver {
        +String name
    }
    Car *-- Engine : 包含
    Driver --> Car : 驾驶`
    },
    {
      title: '接口与泛型',
      explanation: '使用 <<interface>> 标注接口，<<abstract>> 标注抽象类。支持泛型表示和命名空间。',
      code: `classDiagram
    class Shape {
        <<abstract>>
        +draw() void
        +area() float
    }
    class Circle {
        +float radius
        +draw() void
        +area() float
    }
    class Rectangle {
        +float width
        +float height
        +draw() void
        +area() float
    }
    Shape <|-- Circle
    Shape <|-- Rectangle`
    }
  ]
}

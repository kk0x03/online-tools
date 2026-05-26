export default {
  slug: 'erdiagram',
  title: 'ER 图',
  subtitle: 'Entity Relationship Diagram',
  description: '实体关系图用于描述数据模型中实体之间的关系，常用于数据库设计和数据建模。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 erDiagram 关键字声明。定义实体及其属性，属性类型写在名称前。实体之间的关系用 ||, |}, ||-- 等符号表示。',
      code: `erDiagram
    CUSTOMER ||--o{ ORDER : "下单"
    CUSTOMER {
        string name
        string email
        int id
    }
    ORDER ||--|{ ORDER_ITEM : "包含"
    ORDER {
        int id
        datetime created_at
        string status
    }
    ORDER_ITEM }o--|| PRODUCT : "引用"
    PRODUCT {
        int id
        string name
        float price
    }`
    },
    {
      title: '关系类型',
      explanation: '支持多种关系类型：|| 一对一，|o 零或一，||-- 一对多，}o-- 多对多。箭头方向表示关系的方向。',
      code: `erDiagram
    TEACHER ||--o{ COURSE : "教授"
    STUDENT }o--o{ COURSE : "选修"
    CLASSROOM ||--o{ COURSE : "使用"
    TEACHER {
        int id
        string name
    }
    STUDENT {
        int id
        string name
    }
    COURSE {
        int id
        string title
    }`
    }
  ]
}

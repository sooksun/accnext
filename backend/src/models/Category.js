module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุชื่อหมวดหมู่'
        },
        len: {
          args: [1, 100],
          msg: 'ชื่อหมวดหมู่ต้องมีความยาว 1-100 ตัวอักษร'
        }
      }
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['income', 'expense']],
          msg: 'ประเภทหมวดหมู่ต้องเป็น income หรือ expense เท่านั้น'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7), // รูปแบบ #FFFFFF
      allowNull: true,
      defaultValue: '#6B7280',
      validate: {
        is: {
          args: /^#[0-9A-F]{6}$/i,
          msg: 'รูปแบบสีไม่ถูกต้อง (ต้องเป็น #RRGGBB)'
        }
      }
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'folder'
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['type', 'is_active']
      },
      {
        fields: ['created_by']
      },
      {
        unique: true,
        fields: ['name', 'type'],
        name: 'unique_category_name_type'
      }
    ],
    scopes: {
      active: {
        where: { is_active: true }
      },
      income: {
        where: { type: 'income', is_active: true }
      },
      expense: {
        where: { type: 'expense', is_active: true }
      },
      default: {
        where: { is_default: true, is_active: true }
      }
    }
  });

  // Instance Methods
  Category.prototype.getTransactionCount = async function() {
    const { Income, Expense } = sequelize.models;
    
    if (this.type === 'income') {
      return await Income.count({ where: { category_id: this.id } });
    } else {
      return await Expense.count({ where: { category_id: this.id } });
    }
  };

  // Class Methods
  Category.getByType = function(type) {
    return this.scope('active').findAll({
      where: { type: type },
      order: [
        ['is_default', 'DESC'],
        ['name', 'ASC']
      ]
    });
  };

  Category.getDefaultCategories = function() {
    return this.scope('default').findAll({
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
  };

  // Associations
  Category.associate = function(models) {
    // หมวดหมู่สร้างโดยผู้ใช้
    Category.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // หมวดหมู่มีหลายรายการรายรับ
    Category.hasMany(models.Income, {
      foreignKey: 'category_id',
      as: 'incomes'
    });

    // หมวดหมู่มีหลายรายการรายจ่าย
    Category.hasMany(models.Expense, {
      foreignKey: 'category_id',
      as: 'expenses'
    });
  };

  return Category;
};
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว'
      },
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุชื่อผู้ใช้'
        },
        len: {
          args: [3, 50],
          msg: 'ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'อีเมลนี้ถูกใช้งานแล้ว'
      },
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุอีเมล'
        },
        isEmail: {
          msg: 'รูปแบบอีเมลไม่ถูกต้อง'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุรหัสผ่าน'
        },
        len: {
          args: [6, 255],
          msg: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
        }
      }
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุชื่อ'
        }
      }
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุนามสกุล'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'accountant', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer',
      validate: {
        isIn: {
          args: [['admin', 'accountant', 'viewer']],
          msg: 'บทบาทต้องเป็น admin, accountant หรือ viewer เท่านั้น'
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\d\-\+\(\)\s]+$/,
          msg: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // เข้ารหัสรหัสผ่านก่อนบันทึก
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      active: {
        where: { is_active: true }
      },
      byRole: (role) => ({
        where: { role: role }
      })
    }
  });

  // Instance Methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  // Class Methods
  User.findByEmail = function(email) {
    return this.scope('withPassword').findOne({
      where: { email: email, is_active: true }
    });
  };

  User.findByUsername = function(username) {
    return this.scope('withPassword').findOne({
      where: { username: username, is_active: true }
    });
  };

  // Associations
  User.associate = function(models) {
    // ผู้ใช้มีหลายรายการรายรับ
    User.hasMany(models.Income, {
      foreignKey: 'user_id',
      as: 'incomes'
    });

    // ผู้ใช้มีหลายรายการรายจ่าย
    User.hasMany(models.Expense, {
      foreignKey: 'user_id',
      as: 'expenses'
    });

    // ผู้ใช้สร้างหลายหมวดหมู่
    User.hasMany(models.Category, {
      foreignKey: 'created_by',
      as: 'categories'
    });
  };

  return User;
};
module.exports = (sequelize, DataTypes) => {
  const Income = sequelize.define('Income', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุจำนวนเงิน'
        },
        min: {
          args: [0.01],
          msg: 'จำนวนเงินต้องมากกว่า 0'
        },
        isDecimal: {
          msg: 'จำนวนเงินต้องเป็นตัวเลข'
        }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุรายละเอียด'
        },
        len: {
          args: [1, 255],
          msg: 'รายละเอียดต้องมีความยาว 1-255 ตัวอักษร'
        }
      }
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        notEmpty: {
          msg: 'กรุณาระบุวันที่'
        },
        isDate: {
          msg: 'รูปแบบวันที่ไม่ถูกต้อง'
        }
      }
    },
    reference_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'เลขที่อ้างอิงต้องมีความยาวไม่เกิน 50 ตัวอักษร'
        }
      }
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'check', 'credit_card', 'other'),
      allowNull: false,
      defaultValue: 'cash',
      validate: {
        isIn: {
          args: [['cash', 'bank_transfer', 'check', 'credit_card', 'other']],
          msg: 'วิธีการชำระเงินไม่ถูกต้อง'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    receipt_file: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
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
    tableName: 'incomes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['transaction_date']
      },
      {
        fields: ['user_id', 'transaction_date']
      },
      {
        fields: ['amount']
      }
    ],
    scopes: {
      byUser: (userId) => ({
        where: { user_id: userId }
      }),
      byCategory: (categoryId) => ({
        where: { category_id: categoryId }
      }),
      byDateRange: (startDate, endDate) => ({
        where: {
          transaction_date: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
          }
        }
      }),
      thisMonth: () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return {
          where: {
            transaction_date: {
              [sequelize.Sequelize.Op.between]: [startOfMonth, endOfMonth]
            }
          }
        };
      },
      thisYear: () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        
        return {
          where: {
            transaction_date: {
              [sequelize.Sequelize.Op.between]: [startOfYear, endOfYear]
            }
          }
        };
      }
    }
  });

  // Instance Methods
  Income.prototype.getFormattedAmount = function() {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(this.amount);
  };

  Income.prototype.getPaymentMethodText = function() {
    const methods = {
      cash: 'เงินสด',
      bank_transfer: 'โอนเงิน',
      check: 'เช็ค',
      credit_card: 'บัตรเครดิต',
      other: 'อื่นๆ'
    };
    return methods[this.payment_method] || this.payment_method;
  };

  // Class Methods
  Income.getTotalByUser = async function(userId, startDate = null, endDate = null) {
    const whereClause = { user_id: userId };
    
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const result = await this.sum('amount', { where: whereClause });
    return result || 0;
  };

  Income.getMonthlyTotal = async function(userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.getTotalByUser(userId, startDate, endDate);
  };

  Income.getYearlyTotal = async function(userId, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return await this.getTotalByUser(userId, startDate, endDate);
  };

  Income.getCategoryStats = async function(userId, startDate = null, endDate = null) {
    const whereClause = { user_id: userId };
    
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    return await this.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      include: [{
        model: sequelize.models.Category,
        as: 'category',
        attributes: ['name', 'color', 'icon']
      }],
      group: ['category_id'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });
  };

  // Associations
  Income.associate = function(models) {
    // รายรับเป็นของผู้ใช้
    Income.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // รายรับมีหมวดหมู่
    Income.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  return Income;
};
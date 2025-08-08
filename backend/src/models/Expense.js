module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
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
    vendor: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'ชื่อผู้ขายต้องมีความยาวไม่เกิน 100 ตัวอักษร'
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
    is_recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    recurring_period: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['daily', 'weekly', 'monthly', 'yearly']],
          msg: 'รอบการเกิดซ้ำไม่ถูกต้อง'
        }
      }
    },
    budget_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'งบประมาณต้องมากกว่าหรือเท่ากับ 0'
        }
      }
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
    tableName: 'expenses',
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
      },
      {
        fields: ['is_recurring']
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
      recurring: {
        where: { is_recurring: true }
      },
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
  Expense.prototype.getFormattedAmount = function() {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(this.amount);
  };

  Expense.prototype.getPaymentMethodText = function() {
    const methods = {
      cash: 'เงินสด',
      bank_transfer: 'โอนเงิน',
      check: 'เช็ค',
      credit_card: 'บัตรเครดิต',
      other: 'อื่นๆ'
    };
    return methods[this.payment_method] || this.payment_method;
  };

  Expense.prototype.getRecurringPeriodText = function() {
    const periods = {
      daily: 'รายวัน',
      weekly: 'รายสัปดาห์',
      monthly: 'รายเดือน',
      yearly: 'รายปี'
    };
    return periods[this.recurring_period] || this.recurring_period;
  };

  Expense.prototype.checkBudgetExceeded = async function() {
    if (!this.budget_limit) return false;
    
    const totalThisMonth = await Expense.getMonthlyTotal(
      this.user_id, 
      new Date().getFullYear(), 
      new Date().getMonth() + 1
    );
    
    return totalThisMonth > this.budget_limit;
  };

  // Class Methods
  Expense.getTotalByUser = async function(userId, startDate = null, endDate = null) {
    const whereClause = { user_id: userId };
    
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const result = await this.sum('amount', { where: whereClause });
    return result || 0;
  };

  Expense.getMonthlyTotal = async function(userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.getTotalByUser(userId, startDate, endDate);
  };

  Expense.getYearlyTotal = async function(userId, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return await this.getTotalByUser(userId, startDate, endDate);
  };

  Expense.getCategoryStats = async function(userId, startDate = null, endDate = null) {
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

  Expense.getBudgetAlerts = async function(userId) {
    // หาค่าใช้จ่ายที่มี budget_limit และเกินงบประมาณ
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const expenses = await this.findAll({
      where: {
        user_id: userId,
        budget_limit: { [sequelize.Sequelize.Op.not]: null }
      },
      include: [{
        model: sequelize.models.Category,
        as: 'category',
        attributes: ['name', 'color']
      }]
    });

    const alerts = [];
    
    for (const expense of expenses) {
      const monthlyTotal = await this.getMonthlyTotal(userId, currentYear, currentMonth);
      if (monthlyTotal > expense.budget_limit) {
        alerts.push({
          category: expense.category.name,
          budgetLimit: expense.budget_limit,
          actualSpent: monthlyTotal,
          exceeded: monthlyTotal - expense.budget_limit
        });
      }
    }

    return alerts;
  };

  // Associations
  Expense.associate = function(models) {
    // รายจ่ายเป็นของผู้ใช้
    Expense.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // รายจ่ายมีหมวดหมู่
    Expense.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  return Expense;
};
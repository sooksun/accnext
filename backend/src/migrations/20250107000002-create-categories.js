'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('income', 'expense'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#6B7280'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'folder'
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // เพิ่ม indexes
    await queryInterface.addIndex('categories', ['type', 'is_active']);
    await queryInterface.addIndex('categories', ['created_by']);
    
    // เพิ่ม unique constraint
    await queryInterface.addConstraint('categories', {
      fields: ['name', 'type'],
      type: 'unique',
      name: 'unique_category_name_type'
    });
  },

  async down(queryInterface, Sequelize) {
    // ลบ foreign key constraint ทั้งหมดก่อน
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_2');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_4');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_6');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_8');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_10');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_12');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_14');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_16');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    try {
      await queryInterface.removeConstraint('expenses', 'expenses_ibfk_18');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table
    try {
      await queryInterface.removeConstraint('categories', 'categories_ibfk_1');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table ด้วยชื่อที่ถูกต้อง
    try {
      await queryInterface.removeConstraint('categories', 'categories_created_by_users_fk');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table ด้วยชื่อที่ถูกต้อง
    try {
      await queryInterface.removeConstraint('categories', 'categories_created_by_fkey');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table ด้วยชื่อที่ถูกต้อง
    try {
      await queryInterface.removeConstraint('categories', 'categories_created_by_fkey');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table ด้วยชื่อที่ถูกต้อง
    try {
      await queryInterface.removeConstraint('categories', 'categories_created_by_fkey');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table ด้วยชื่อที่ถูกต้อง
    try {
      await queryInterface.removeConstraint('categories', 'categories_created_by_fkey');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    // ลบ foreign key constraint ของ categories table ด้วยชื่อที่ถูกต้อง
    try {
      await queryInterface.removeConstraint('categories', 'categories_created_by_fkey');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    
    await queryInterface.dropTable('categories');
  }
};
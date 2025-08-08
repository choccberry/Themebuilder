'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Car extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Car.belongsTo(models.Vendor, {
        foreignKey: 'vendorId',
        onDelete: 'CASCADE',
      });
      Car.belongsTo(models.Category, {
        foreignKey: 'categoryId',
      });
    }
  }
  Car.init({
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('Nigerian Used', 'Foreign Used/Tokunbo', 'Brand New'),
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
  }, {
    sequelize,
    modelName: 'Car',
  });
  return Car;
};

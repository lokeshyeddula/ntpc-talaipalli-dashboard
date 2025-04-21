const { DataTypes } = require('sequelize');
const sequelize = require('../database');


const Production = sequelize.define('Production', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    production_date: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
    },
    pit: {type: DataTypes.STRING,allowNull: false },
    shift: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    totalCoal: { 
        type: DataTypes.FLOAT, 
        defaultValue: 0 
    },
    totalOB: { 
        type: DataTypes.FLOAT, 
        defaultValue: 0 
    },
    rainfall: { 
        type:DataTypes.DECIMAL(5, 2), 
        allowNull: true 
    },
    remarks: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }
}, {
    tableName: 'production',
    timestamps: true
});

// Define the 'Trips' model
const Trips = sequelize.define('Trips', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    production_id: { 
        type: DataTypes.STRING, 
        allowNull: false
    },
    production_date: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
    },
    pit: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    shift: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    material: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    materialType: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    vehicle: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    destination: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    tripCount: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    tableName: 'trips',
    timestamps: true
});


Production.hasMany(Trips, { 
    foreignKey: 'production_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Trips.belongsTo(Production, { 
    foreignKey: 'production_id',
    targetKey: 'id'
});


Production.beforeCreate((production, options) => {
    production.id = `${production.production_date}-${production.pit}-${production.shift}`;
});

module.exports = { Production, Trips };

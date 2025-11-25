import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

export class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public ownerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public owner?: User;
  public collaborators?: User[];
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    ownerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
    indexes: [
      {
        fields: ['ownerId'],
      },
    ],
  }
);

Project.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});

Project.belongsToMany(User, {
  through: 'project_collaborators',
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'collaborators',
});

User.belongsToMany(Project, {
  through: 'project_collaborators',
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'collaboratedProjects',
});

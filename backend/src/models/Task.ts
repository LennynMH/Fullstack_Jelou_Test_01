import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Project } from './Project';
import { User } from './User';

export enum TaskStatus {
  PENDING = 'pendiente',
  IN_PROGRESS = 'en progreso',
  COMPLETED = 'completada',
}

export enum TaskPriority {
  LOW = 'baja',
  MEDIUM = 'media',
  HIGH = 'alta',
}

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assignedToId?: number;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'description' | 'status' | 'priority' | 'assignedToId' | 'dueDate' | 'createdAt' | 'updatedAt'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: TaskStatus;
  public priority!: TaskPriority;
  public projectId!: number;
  public assignedToId?: number;
  public dueDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public project?: Project;
  public assignedTo?: User;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.PENDING,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(TaskPriority)),
      allowNull: false,
      defaultValue: TaskPriority.MEDIUM,
    },
    projectId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    assignedToId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['projectId'],
      },
      {
        fields: ['projectId', 'status'],
      },
      {
        fields: ['projectId', 'priority'],
      },
      {
        fields: ['assignedToId'],
      },
      {
        fields: ['status', 'priority'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

Task.belongsTo(User, {
  foreignKey: 'assignedToId',
  as: 'assignedTo',
});

Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
});

User.hasMany(Task, {
  foreignKey: 'assignedToId',
  as: 'assignedTasks',
});

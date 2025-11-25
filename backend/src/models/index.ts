import { Profile } from './Profile';
import { User } from './User';
import { Project } from './Project';
import { Task } from './Task';

Profile.hasMany(User, {
  foreignKey: 'profileId',
  as: 'users',
});

User.belongsTo(Profile, {
  foreignKey: 'profileId',
  as: 'profile',
});


export { Profile, User, Project, Task };


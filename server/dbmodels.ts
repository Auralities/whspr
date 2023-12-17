import { Sequelize, DataTypes } from 'sequelize'

const HOST = 'localhost'

const db = new Sequelize({
  host: HOST,
  port: 5432,
  dialect: 'postgres',
  username: 'postgres',
  database: 'whspr',
  password: 'ok',
  logging: false
})
// interface User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
//   id: CreationOptional<number>;
//   username: string;
//   profileImgUrl: string;
// };

// interface Follower extends Model<InferAttributes<Follower>, InferCreationAttributes<Follower>> {
//   id: CreationOptional<number>;
// };
export const User = db.define('User', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING
  },
  profileImgUrl: {
    type: DataTypes.STRING
  },
  googleId: {
    type: DataTypes.STRING
  },
})

export const MagicConch = db.define('MagicConch', {
  sendingUserId: {
    type: DataTypes.INTEGER
  },
  receivingUserId: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING
  },
  url: {
    type: DataTypes.STRING
  },
  soundUrl: {
    type: DataTypes.STRING
  }
})

export const Sound = db.define('Sound', {
  postId: {
    type: DataTypes.BIGINT
  },
  soundUrl: {
    type: DataTypes.STRING
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  detune: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  }
})

export const Post = db.define('Post', {
  userId: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  soundUrl: {
    type: DataTypes.STRING
  },
  commentCount: {
    type: DataTypes.INTEGER
  },
  likeCount: {
    type: DataTypes.INTEGER
  },
  listenCount: {
    type: DataTypes.INTEGER
  }
})

export const Comment = db.define('Comment', {
  userId: {
    type: DataTypes.INTEGER
  },
  postId: {
    type: DataTypes.INTEGER
  },
  soundUrl: {
    type: DataTypes.STRING
  }
})

export const Listen = db.define('Listen', {
  userId: {
    type: DataTypes.INTEGER
  },
  postId: {
    type: DataTypes.INTEGER
  }
} )

export const Radio = db.define('Radio', {
  hostId: {
    type: DataTypes.INTEGER
  },
  listenerCount: {
    type: DataTypes.INTEGER
  },
  url: {
    type: DataTypes.STRING
  },
  title: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING
  }
})

export const Like = db.define('Like', {
  userId: {
    type: DataTypes.INTEGER
  },
  postId: {
    type: DataTypes.INTEGER
  }
})

export const UsersRadio = db.define('UsersRadio', {
  socketId: {
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.INTEGER
  },
  radiosId: {
    type: DataTypes.INTEGER
  }
})

export const Follower = db.define('Follower', {
  userId: {
    type: DataTypes.BIGINT
  },
  followingId: {
    type: DataTypes.BIGINT
  }
})

export const Stat = db.define('Stat', {
  userId: {
    type: DataTypes.INTEGER
  },
  postId: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.STRING
  }
})
// defines table relations
User.hasMany(MagicConch, { foreignKey: 'sendingUserId'})
MagicConch.belongsTo(User, { foreignKey: 'sendingUserId' })
User.hasMany(MagicConch, { foreignKey: 'receivingUserId'})
MagicConch.belongsTo(User, { foreignKey: 'receivingUserId' })
//MagicConch.belongsTo(Sound, { foreignKey: 'soundUrl' })
User.hasMany(Like, {foreignKey: 'userId'})
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Post.hasMany(Like, {foreignKey: 'postId'})
Like.belongsTo(Post, { foreignKey: 'postId'})

User.hasMany(Listen, {foreignKey: 'userId'})
Listen.belongsTo(User, { foreignKey: 'userId'})
Post.hasMany(Listen, {foreignKey: 'postId'})
Listen.belongsTo(Post, { foreignKey: 'postId'})

User.hasMany(Comment, {foreignKey: 'userId'})
Comment.belongsTo(User, { foreignKey: 'userId' })
Post.hasMany(Comment, {foreignKey: 'postId'})
Comment.belongsTo(Post, { foreignKey: 'postId'})

UsersRadio.belongsTo(User, { foreignKey: 'userId', as: 'user' })
UsersRadio.belongsTo(Radio, { foreignKey: 'radiosId', as: 'radio' })

Radio.belongsTo(User, { foreignKey: 'hostId', as: 'host' })

User.hasMany(Post, { foreignKey: 'userId'})
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Post.hasMany(Sound, { foreignKey: 'postId' })
// Sound.belongsTo(Post, { foreignKey: 'postId' })

Stat.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Stat.belongsTo(Post, { foreignKey: 'postId', as: 'post' })

User.hasMany(Follower, { foreignKey: 'userId'})
Follower.belongsTo(User, { foreignKey: 'userId'})

User.hasMany(Follower, { foreignKey: 'followingId'})
Follower.belongsTo(User, { foreignKey: 'followingId'});

db.authenticate()
  .then(() => {
    console.info(`Successfully connected to the database on ${HOST}`)
  })
  .catch((error: any) => {
    console.error('Error connecting to the database:', error.message)
  })

// export script funcs that ref db:

export const authenticateDatabase = async (): Promise<void> => {
  try {
    await db.authenticate()
    console.info(`Successfully connected to the database on ${HOST}`)
  } catch (error) {
    console.error('Error connecting to the database:', error)
  }
}

export const syncDatabase = async (): Promise<void> => {
  try {
    await db.sync({ force: false })
    console.info('Database synced!')
  } catch (error) {
    console.error('Error syncing database:', error)
  }
}

export const dropDatabase = async (): Promise<void> => {
  try {
    await db.query('DROP DATABASE IF EXISTS "whspr";')
    console.info('Database dropped')
  } catch (error) {
    console.error('Error dropping the database:', error)
  }
}

export const createDatabase = async (): Promise<void> => {
  try {
    await db.query('CREATE DATABASE "whspr";')
    console.info('Database created')
  } catch (error) {
    console.error('Error creating the database:', error)
  }
}

export const closeDatabase = async (): Promise<void> => {
  try {
    await db.close()
    console.info('Database closed.')
  } catch (error) {
    console.error('Error closing the database:', error)
  }
}
import { Model } from 'sequelize'

export interface UserAttributes {
  username: string;
  profileImgUrl: string; 
}
export interface UserInstance  extends Model<UserAttributes>, UserAttributes  {}

export interface MagicConchAttributes {
  sendingUserId: number;
  receivingUserId: number;
  title: string;
  url: string;
  soundUrl: string; 
}
export interface MagicConchInstance  extends Model<MagicConchAttributes>, MagicConchAttributes  {}

export interface SoundAttributes {
    postId: number;
    soundUrl: string; 
}
export interface SoundInstance extends Model<SoundAttributes>, SoundAttributes {}

export interface PostAttributes {
  userId: number;
  title: string;
  categories: string[];
  soundUrl: string; 
}
export interface PostInstance extends Model<PostAttributes>, PostAttributes {}
export interface CommentAttributes {
  userId: number;
  postId: number;
  soundUrl: string; 
}
export interface CommentInstance extends Model<CommentAttributes>, CommentAttributes {}
export interface RadioAttributes {
  hostId: number;
  listenerCount: number;
  url: string;
  title: string;
  category: string; 
}
export interface RadioInstance extends Model<RadioAttributes>, RadioAttributes {}

export interface LikeAttributes {
  userId: number;
  postId: number; 
}
export interface LikeInstance extends Model<LikeAttributes>, LikeAttributes {}

export interface UsersRadioAttributes {
  socketId: number;
  userId: number;
  radiosId: number; 
}
export interface UsersRadioInstance extends Model<UsersRadioAttributes>, UsersRadioAttributes {}

export interface FollowerAttributes {
  userId: number;
  followingId: number; 
}
export interface FollowerInstance extends Model<FollowerAttributes>, FollowerAttributes {}

export interface StatAttributes {
  userId: number;
  postId: number;
  type: string; 
}
export interface StatInstance extends Model<StatAttributes>, StatAttributes {}


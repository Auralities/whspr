import { Sound, User, Post, Follower, Radio, Comment } from '../../dbmodels';
//function to create posts with random engagement counts 
//set to 10 posts rn but if you want more or less change in for loop
const getRandomPosts = () => {
  let postArr:any = []
  const hashtags = ['love', 'instagood', 'fashion', 'photography', 'art', 'beautiful', 'nature', 'happy', 'travel', 'cute', 'style', 'summer', 'beauty', 'fitness', 'food', 'photo', 'friends', 'music', 'smile', 'family', 'life']
  
  function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  const possibleCategories = ['comedy', 'sports', 'music', 'gaming', 'news', 'politics', 'random']
  for(let i = 0; i < 10; i++){
    let samplePost:any = {
      categories: Array.from({ length: Math.floor(Math.random() * 5) + 1}, () =>
        possibleCategories[Math.floor(Math.random() * possibleCategories.length)]
      ),

  function getRandomTags (){
    let tags:any = []
    for(let i = 0; i < 5; i++){
      tags.push(hashtags[Math.floor(Math.random() * 18)])
    }
    return tags
  }
  for(let i = 0; i < 10; i++){
    let samplePost:any = {
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1702167980979.wav'
    }
    samplePost.userId = Math.floor(Math.random() * 5) + 1
    samplePost.title = `title${i}`
    samplePost.createdAt = getRandomDate(new Date(2023, 11, 13), new Date())
    samplePost.updatedAt = samplePost.createdAt
    samplePost.likeCount = Math.floor(Math.random() * 50) + 1
    samplePost.listenCount = Math.floor(Math.random() * 200) + 20
    samplePost.commentCount = Math.floor(Math.random() * 50) + 1
    samplePost.categories = getRandomTags()

    postArr.push(samplePost)
  }
return postArr
}
export const seedDatabase = async () => {
  try {

    await User.bulkCreate([
      {
      username: 'RandomUser',
      profileImgUrl: 'https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/ear.png',
      googleId: 'kjhjo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: 'Rando',
      profileImgUrl: 'https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/ear.png',
      googleId: 'jhgouy',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: 'dom',
      profileImgUrl: 'https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/ear.png',
      googleId: 'o;uhul',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: 'angel',
      profileImgUrl: 'https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/ear.png',
      googleId: 'ljkhgjuh',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: 'thisguyoverhere',
      profileImgUrl: 'https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/ear.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);


  await Post.bulkCreate(
    getRandomPosts()
  );


  await Sound.bulkCreate([
    {
      postId: 1,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1702167980979.wav',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      postId: 2,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1702265197317.wav',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

    await Follower.bulkCreate([
      {
        userId: 1,
        followingId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 1,
        followingId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await Comment.bulkCreate([
      {
        userId: 1,
        postId: 2,
        soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
      },
    {
      userId: 2,
      postId: 2,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
    },
    {
      userId: 1,
      postId: 1,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
    },
    {
      userId: 3,
      postId: 1,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
    }
  ])

/**
 *  {
userId: 3,
category: 'The Categorical',
title: 'The Titular',
soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1702167980979.wav',
createdAt: new Date(),
updatedAt: new Date(),
},
*/

//keep this at the bottom of the seed and keep seeds within the try block.
console.info('\x1b[32m%s\x1b[0m', 'Seed script executed successfully');
} catch (error) {
console.error('\x1b[31m%s\x1b[0m', 'Seed script failed', error);
}

}
seedDatabase();

let samplePost:any = {}
for(let i = 0; i < 10; i++){
  samplePost.userId 
  samplePost.categories
  samplePost.title
  samplePost.soundUrl
  samplePost.createdAt
  samplePost.updatedAt
  samplePost.likeCount
  samplePost.listenCount
  samplePost.commentCount
}
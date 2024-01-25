import { Sound, User, Post, Follower, Radio, Comment } from '../../dbmodels';
//function to create posts with random engagement counts 
//set to 10 posts rn but if you want more or less change in for loop
// const getRandomPosts = () => {
//   let postArr:any = []
//   const hashtags = ['love', 'instagood', 'fashion', 'photography', 'art', 'beautiful', 'nature', 'happy', 'travel', 'cute', 'style', 'summer', 'beauty', 'fitness', 'food', 'photo', 'friends', 'music', 'smile', 'family', 'life']

//   function getRandomDate(start, end) {
//     return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
//   }
//   const possibleCategories = ['comedy', 'sports', 'music', 'gaming', 'news', 'politics', 'random']
//   for(let i = 0; i < 10; i++){
//     let samplePost:any = {
//       categories: Array.from({ length: Math.floor(Math.random() * 5) + 1}, () =>
//         possibleCategories[Math.floor(Math.random() * possibleCategories.length)]
//       ),
//     }

//   function getRandomTags (){
//     let tags:any = []
//     for(let i = 0; i < 5; i++){
//       tags.push(hashtags[Math.floor(Math.random() * 18)])
//     }
//     return tags
//   }
//   for(let i = 0; i < 10; i++){
//     let samplePost:any = {
//       commentCount: 0,
//       soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1704992206087.wav'
//     }
//     samplePost.userId = Math.floor(Math.random() * 5) + 1
//     samplePost.title = `title${i}`
//     samplePost.createdAt = getRandomDate(new Date(2024, 1, 3), new Date())
//     samplePost.updatedAt = samplePost.createdAt
//     samplePost.likeCount = Math.floor(Math.random() * 50) + 1
//     samplePost.listenCount = Math.floor(Math.random() * 200) + 20
//     samplePost.categories = getRandomTags()

//     postArr.push(samplePost)
//   }
// return postArr
// }
//}
export const seedDatabase = async () => {
  try {

    await User.bulkCreate([
      {
        profileImgUrl: 'https://storage.googleapis.com/whspr-sounds/images/6-74b6a2a6-107b-414d-893b-6b0e4349932c',
        username: 'Nelson Stephenson',
        googleId: 'kjhjo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Jane Daniels',
        profileImgUrl: 'https://storage.googleapis.com/whspr-sounds/images/6-a2a07e02-c7e7-4524-84e7-5e1fd16d9e51',
        googleId: 'jhgouy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Bella Anthony',
        profileImgUrl: 'https://storage.googleapis.com/whspr-sounds/images/6-6a42ee02-a3cc-495f-bf1e-b1368504e6de',
        googleId: 'o;uhul',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Buck Alecander',
        profileImgUrl: 'https://storage.googleapis.com/whspr-sounds/images/6-44a6aa95-fc80-465e-a45b-4074915c48df',
        googleId: 'ljkhgjuh',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Andrew Sydmond',
        profileImgUrl: 'https://storage.googleapis.com/whspr-sounds/images/6-3f9435b9-f0db-4faa-8a50-c93ed797e3c6',
        googleId: 'o;uhuldd',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
  ]);


  await Post.bulkCreate(
    [
      {
        userId: 1,
        title: 'Stand Up Sneak Peek',
        categories: ['hilarious', 'FunnyStory', 'silly'],
        soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1706051338812.wav',
        commentCount: 0,
        likeCount: 49,
        listenCount: 54,
      },
      {
        userId: 2,
        title: 'Sick Drum Solo',
        categories: ['SickBeats', 'drummer', 'music', 'rad' ],
        soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/Stephen%203.wav',
        commentCount: 0,
        likeCount: 55,
        listenCount: 144,
      },
      {
        userId: 3,
        title: 'Hot Celeb Gossip',
        categories: ['DidYouHear', 'OMG', 'celebrity', 'hot', 'GoldenGlobes' ],
        soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1706051620334.wav',
        commentCount: 0,
        likeCount: 65,
        listenCount: 104,
      },
      {
        userId: 4,
        title: 'Dance Tunes',
        categories: ['NameThatBand', 'NoPosersAllowed', 'music'],
        soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/wawsabdance.mp3',
        commentCount: 0,
        likeCount: 72,
        listenCount: 125,
      },
      {
        userId: 5,
        title: 'JavaScript Tips',
        categories: ['DidYouKnow', 'FreshDev', 'programming', 'javascript', 'SmartGuy' ],
        soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1706051221204.wav',
        commentCount: 0,
        likeCount: 55,
        listenCount: 144,
      },
    ]
  );


  await Radio.bulkCreate([
    {
      host: 'Anthony',
      category: 'The Categorical',
      title: 'The Titular',
      listenerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      host: 'RandomUser',
      category: 'The Categorical',
      title: 'The Titular2',
      listenerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      host: 'Rando',
      category: 'The Categorical',
      title: 'The Titular3',
      listenerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await Sound.bulkCreate([
    {
      postId: 1,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1704992206087.wav',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      postId: 2,
      soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/1704992206087.wav',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

    await Follower.bulkCreate([
      {
        userId: 1,
        followingId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        followingId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    
  //   await Comment.bulkCreate([
  //     {
  //       userId: 1,
  //       postId: 2,
  //       soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
  //     },
  //   {
  //     userId: 2,
  //     postId: 2,
  //     soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
  //   },
  //   {
  //     userId: 1,
  //     postId: 1,
  //     soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
  //   },
  //   {
  //     userId: 3,
  //     postId: 1,
  //     soundUrl: 'https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3',
  //   }
  // ])

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
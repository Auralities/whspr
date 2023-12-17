const express = require('express')
import { Request, Response } from 'express'
const router = express.Router()
import sequelize, { Op } from 'sequelize'
import { User, Follower, Post, Like, Comment, Listen} from '../dbmodels' 
import { getTagsByEngagement } from '../algorithmHelpers'
// ****HELPER FUNCTIONS***********
const addIsLikedPair =  (postArr, likedPostIdArr) => {
  for(let i = 0; i < postArr.length; i++){
    if(likedPostIdArr.includes(postArr[i].id)){
      //console.log('true')
      postArr[i].dataValues.isLiked = true
    }else {
      postArr[i].dataValues.isLiked = false
    }
  }
}


// ************* GET ROUTES **************
//gets posts and adds personalized ranking and isLiked field to each postObj before sending to client (for explore page)
router.get('/explore/:userId/:tag', async (req:Request, res: Response) => {
  const { userId, tag } = req.params
try{
  //get all posts
  let allPosts:any;
  if(tag === 'none'){
    allPosts = await Post.findAll({
      where: {
        userId: {
          [Op.ne]: userId
        }
      },
      include: [
        Like,
        Comment,
        { model: User,
          as: 'user'}
        ]
      })
    } else {
      allPosts = await Post.findAll({
        where: {
          categories: {
            [Op.contains]: [tag]
          }
        },
        include: [
          Like,
          Comment,
          { model: User,
            as: 'user'}
          ]
        })
    }
      //find all likes from this user
  const likedPosts = await Like.findAll({
    where: {userId}
  })
   //if user has liked posts add all liked post ids to array and addIsLikedPair
   if(likedPosts.length > 0){
    const likedPostIdArr = await likedPosts.map((post:any) => post.postId)
    await addIsLikedPair(allPosts, likedPostIdArr)
  }
      //clean query response to only include dataValues
  const postDataValues = await allPosts.map((post) => post.dataValues)

  //add popularity ranking based on overall likes, comments, and listen counts
  const postsWRanks = postDataValues.map((post) => {
    let score = (post.likeCount * .1) + (post.commentCount * .05) + (post.listenCount * .0025)
    let today = new Date().getTime()
    let timeSinceCreation = (today - post.createdAt.getTime()) / 14400000
    let decay = .05 * (timeSinceCreation ** 2)
    let rank = score / decay
    post.rank = rank
    return post
  })
  // const ranksb4Tags = postsWRanks.map((post:any) => {
  //   return {id: post.id, rank: post.rank}
  // })
  // console.log(ranksb4Tags.sort((a, b) => (a.rank > b.rank ? -1 : 1)))

   //find all listens from this user
  const listenedPosts = await Listen.findAll({
    where: {userId}
  })
 // console.log(likedPosts, listenedPosts)
   //function that adds isLiked property to post obj with boolean and removes previously listened or liked posts
   const decayRankWhenPrevListened =  (postArr, listenIdArr) => {
    for(let i = 0; i < postArr.length; i++){
      if(listenIdArr.includes(postArr[i].id)){
        //removes previously liked or listened posts
        postArr[i].rank -= .25
      }
    }
  }

  //if user has listened posts add all listened post ids to array to check incoming posts
  if(listenedPosts.length > 0){
    const listenedPostIdArr = await listenedPosts.map((post:any) => post.postId)
    //console.log(listenedPostIdArr)
    await decayRankWhenPrevListened(postsWRanks, listenedPostIdArr)
  }

  //get user specific tag rankings (function definition in server/algorithmHelpers)
  const tagRanks = await getTagsByEngagement(userId)
  //console.log(postsWRanks[0])
  //function to add user specific tag ranking to current rank field
  const getFinalRanking = (postRanks, tagRanks) => {
    for(let i = 0; i < postRanks.length; i++){
    for(let key in tagRanks){
      if(postRanks[i].categories){
        if(postRanks[i].categories.includes(key)){
            postRanks[i].rank += tagRanks[key]
          }
        }
      //console.log('qwz', postRanks[i])
    }
  }
}
await getFinalRanking(postsWRanks, tagRanks)
//console.log('posts to send', postsWRanks)
//send posts in order of ranking
await res.send(postsWRanks.sort((a, b) => (a.rank > b.rank ? -1 : 1)))
}catch(error){
  console.error('ranked', error)
}
})

//gets updated post obj after user engages
router.get('/updatedPost/:postId/:userId', async (req: Request, res: Response) => {
  const { postId, userId } = req.params;

  try{
    //find post by id
    const post:any = await Post.findByPk(postId, {include: [
      Like,
      Comment,
      { model: User,
        as: 'user'}
    ]})

    
    const likedPost = await Like.findAll({
      where: {userId, postId}
    })

    if(likedPost.length > 0){
      post.dataValues.isLiked = true
    } else {
      post.dataValues.isLiked = false
    }
   

    res.status(200).send(post)
  }catch(error){
    console.error('updated like count', error)
  }
})

//gets all users
router.get('/users', async (req: Request, res: Response) => {
  try{
    const users = await User.findAll({})
    res.status(200).send(users)
  }catch(error){
    console.error('could not get all users', error)
    res.sendStatus(500)
  }
})

//Gets all posts from people user is following (for following feed)
router.get('/following/:userId/:tag', async (req: Request, res: Response) => {
const { userId, tag } = req.params;
try{
  const following = await Follower.findAll({
    where: {
      userId
    }
  })
  const followingArr = following.map((follow: any) => {
    let obj: any = {}
    obj.userId = follow.followingId
    return obj
  })
  const followingPosts:any = await Post.findAll({
    where: {
      [Op.or]: followingArr
    },
    include: [
      {
        model: User,
        as: 'user'
      },
      {
        model: Like
      }
    ], 
    order: [
      ['createdAt', 'DESC']
    ],
  })

  const likedPosts = await Like.findAll({
    where: {userId}
  })
  
  const likedPostIdArr = await likedPosts.map((post:any) => post.postId)
  //console.log(likedPostIdArr)

    await addIsLikedPair(followingPosts, likedPostIdArr)
    //console.log(followingPosts)
    await res.status(200).send(followingPosts)

}catch(error){
  res.sendStatus(500)
  console.error('could not get following posts', error)
}

})


//gets all comments for one post
router.get('/comment/:postId', async (req: Request, res: Response) => {
  const { postId } = req.params;
try{
  const postComments = await Comment.findAll({
    where: {
      postId
    },
    include: User,
    order: [
      ['createdAt', 'DESC']
    ],
  })

  res.status(200).send(postComments)

} catch(error){
  console.error('could not get post comments', error)
  res.sendStatus(500)
}
 })
//get only one user's posts
 router.get('/selected/:id', async (req: Request, res: Response) => {
  const { id } = req.params

  try{
    const selectedUserPosts = await Post.findAll({ 
      where: {userId: id},
      include: [{
        model: User,
        as: 'user'
      },
    Like,
    Comment]
    }
  )
    //console.log('got user posts', selectedUserPosts)

    const likedPosts = await Like.findAll({
      where: {id}
    })

    const likedPostIdArr = await likedPosts.map((post:any) => post.postId)
    //console.log(likedPostIdArr)

    await addIsLikedPair(selectedUserPosts, likedPostIdArr)
    res.status(200).send(selectedUserPosts)
  } catch(error) {
    console.error('query failed: could not get selected user', error)
    res.sendStatus(500)
  }
 })

 router.get('/isFollowing/:userId/:followingId', async (req:Request, res:Response) => {
  const { userId, followingId } = req.params
  try {
    const isFollowing = await Follower.findAll({
      where: {
        userId,
        followingId
      }
    })

    if(isFollowing.length > 0){
      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }

  }catch(error){
    console.error('error checking following relationship', error)
  }
 })
// *************POST REQUESTS***********************
//creates comment
  router.post('/createCommentRecord', async (req: Request, res: Response) => {
    const { userId, postId, soundUrl } = req.body
    try{
      await Comment.create({userId, postId, soundUrl})
      res.sendStatus(201)
    }catch(error){
      console.error('could not add comment', error)
      res.sendStatus(500)
    }
  })

//creates following relationship
  router.post('/startFollowing', async(req: Request, res: Response) =>{
    const {userId, followingId} = req.body
    //console.log(userId, followingId)
    try{
      const startFollowing = await Follower.create({userId, followingId})
      res.sendStatus(201)
    }catch(error){
      console.error('could not follow', error)
      res.sendStatus(500)
    }
   })

// add a record to the like table when user likes post
router.post('/like', async (req: Request, res: Response) => {
  const {userId, postId} = req.body;
    try {
      const createdLike = await Like.create({
        userId,
        postId
      })
      //console.log(createdLike)
      res.sendStatus(201)
    } catch(error) {
      console.error('could not add like', error)
      res.sendStatus(500)
    }
 })

// add a record to the listen table when user completely listens to a post
 router.post('/listen', async (req: Request, res: Response) => {
  const {userId, postId} = req.body;
    try {
      const createdListen = await Listen.create({
        userId,
        postId
      })
      //console.log(createdListen)
      res.sendStatus(201)
    } catch(error) {
      console.error('could not add listen', error)
      res.sendStatus(500)
    }
 })

 //*******************PUT REQUESTS ********************** */
 router.put('/updateCount', async (req: Request, res: Response) => {
  const { column, type, id } = req.body

try{
let updateResult;

  const postToUpdate:any = await Post.findByPk(id)
  if(type === "increment"){
    updateResult = await postToUpdate.increment(column)
    //console.log(updateResult)
  }

  if(type === "decrement"){
    updateResult = await postToUpdate.decrement(column)
    //console.log(updateResult)
  }
  res.status(200).send(updateResult)
}catch(error){
  console.error('could not update count', error)
}
 } )

 // **********************DELETE REQUESTS****************************
 //allows user to unlike a post and removes like record from db
 router.delete('/unlike/:userId/:postId', async (req: Request, res: Response) => {
  const { userId, postId } = req.params;

  try {
    const destroyLike = await Like.destroy({
      where: {
        userId,
        postId
      }
    })
    //console.log('unliked', destroyLike)
    res.sendStatus(201)

  } catch(error){
    console.error('could not remove like', error)
    res.sendStatus(500)
  }
 })

//allows user to unfollow another user
router.delete('/stopFollowing/:userId/:followingId', async (req: Request, res: Response) => {
  const { userId, followingId } = req.params

  try{
    const destroyFollowing = await Follower.destroy({
      where: {
        userId,
        followingId
      }
    })
    console.log('unfollowed', destroyFollowing)
    res.sendStatus(201)
  }catch(error){
    console.error('server could not unfollow', error)
  }
})
module.exports = router

import { User, Follower, Post, Like, Comment, Listen} from '../server/dbmodels'
//function to rank tags 
const rankTags = (tagObjArr, score) => {
  let today = new Date().getTime()

  return tagObjArr
    .map((post) => {
    let timeSinceCreation = (today - post.dataValues.Post.dataValues.createdAt.getTime()) / 14400000
    //console.log(timeSinceCreation, date)
    let decay = (.05 * timeSinceCreation)
    //console.log(date, .025/decay, .5/decay, 1/decay)
    if(post.dataValues.Post.dataValues.categories){
      return {
        decay,
        tags: post.dataValues.Post.dataValues.categories
      }
    } else {
      return {
        decay,
        tags: []
      }
    }
    } )
  .reduce((acc, curr:any) =>  {
    for(let i = 0; i < curr.tags.length; i++){
      acc[curr.tags[i]] ? acc[curr.tags[i]] += score/curr.decay : acc[curr.tags[i]] = score/curr.decay
    }
    return acc
  }, {})
}

export const getTagsByEngagement = async(userId) => {
  try{
  //get user likes
    const userLikesData:any = await Like.findAll({
      where: {
        userId
      },
      include: Post
    })
    //get listened tags
    const userListensData = await Listen.findAll({
      where: {
        userId
      },
      include: Post
    })
    
    //get commented tags
    const userCommentData:any = await Comment.findAll({
      where: {
        userId
      },
      include: Post
    })

    //rank tag by type
    const userCommentedTagObj = await rankTags(userCommentData, .5)
    const userListenedTagObj = await rankTags(userListensData, .025)
    const userLikedTagObj = await rankTags(userLikesData, 1)

    //combine tag rankings 
    let rankedTags = {}
    const combineTagRanks = (rankedTagObj) => {
      for(let key in rankedTagObj){
        rankedTags[key] ? rankedTags[key] += rankedTagObj[key] : rankedTags[key] = rankedTagObj[key]
      }
    }
    await combineTagRanks(userCommentedTagObj)
    await combineTagRanks(userListenedTagObj)
    await combineTagRanks(userLikedTagObj)
    
    //console.log(rankedTags)
    return rankedTags
  }catch(error){
    console.error('[algorithmHelpers.ts] tag ranking error:', error)
  }
}
getTagsByEngagement(6)
// .flatMap((comment) => comment.dataValues.Post.dataValues.categories)
// .reduce((acc, curr) =>  {
//   acc[curr] ? acc[curr] += 1 : acc[curr] = 1
//   return acc
// }, {})
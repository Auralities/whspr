const express = require("express");
import { Request, Response } from "express";
const router = express.Router();
import sequelize, { Op } from "sequelize";
import {
  User,
  Follower,
  Post,
  Like,
  Comment,
  Listen,
  Radio,
  SharedPost,
  MagicConch
} from "../dbmodels";
import { getTagsByEngagement } from "../algorithmHelpers";
// ****HELPER FUNCTIONS***********
const addIsLikedPair = (postArr, likedPostIdArr) => {
  for (let i = 0; i < postArr.length; i++) {
    if (likedPostIdArr.includes(postArr[i].id)) {
      postArr[i].dataValues.isLiked = true;
    } else {
      postArr[i].dataValues.isLiked = false;
    }
  }
};

const rankPostsByPopularity = (postArr) => {
  return postArr.map((post) => {
    const score =
      post.likeCount * 0.1 +
      post.commentCount * 0.05 +
      post.listenCount * 0.0025;
    const today = new Date().getTime();
    const timeSinceCreation = (today - post.createdAt.getTime()) / 14400000;
    const decay = 0.05 * timeSinceCreation ** 2;
    const rank = score / decay;
    post.rank = rank;
    return post;
  });
};
// ************* GET ROUTES **************
//gets posts and adds personalized ranking and isLiked field to each postObj before sending to client (for explore page)
router.get("/explore/:userId/:tag", async (req: Request, res: Response) => {
  const { userId, tag } = req.params;
  try {
    //get all posts
    let allPosts: any;
    if (tag === "none") {
      allPosts = await Post.findAll({
        where: {
          userId: {
            [Op.ne]: userId,
          },
        },
        include: [Like, Comment, { model: User, as: "user" }],
      });
    } else {
      allPosts = await Post.findAll({
        where: {
          categories: {
            [Op.contains]: [tag],
          },
        },
        include: [Like, Comment, { model: User, as: "user" }],
      });
    }
    //find all likes from this user
    const likedPosts = await Like.findAll({
      where: { userId },
    });
    //if user has liked posts add all liked post ids to array and addIsLikedPair
    if (likedPosts.length > 0) {
      const likedPostIdArr = await likedPosts.map((post: any) => post.postId);
      await addIsLikedPair(allPosts, likedPostIdArr);
    }

    //clean query response to only include dataValues
    const postDataValues = await allPosts.map((post) => post.dataValues);

    //add popularity ranking based on overall likes, comments, and listen counts
    const postsWRanks = rankPostsByPopularity(postDataValues);

    //find all listens from this user
    const listenedPosts = await Listen.findAll({
      where: { userId },
    });
    //function that adds isLiked property to post obj with boolean and removes previously listened or liked posts
    const decayRankWhenPrevListened = (postArr, listenIdArr) => {
      for (let i = 0; i < postArr.length; i++) {
        if (listenIdArr.includes(postArr[i].id)) {
          //removes previously liked or listened posts
          postArr[i].rank -= 0.25;
        }
      }
    };

    //if user has listened posts add all listened post ids to array to check incoming posts
    if (listenedPosts.length > 0) {
      const listenedPostIdArr = await listenedPosts.map(
        (post: any) => post.postId
      );
      await decayRankWhenPrevListened(postsWRanks, listenedPostIdArr);
    }

    //get user specific tag rankings (function definition in server/algorithmHelpers)
    const tagRanks = await getTagsByEngagement(userId);
    //function to add user specific tag ranking to current rank field
    const getFinalRanking = (postRanks, tagRanks) => {
      for (let i = 0; i < postRanks.length; i++) {
        for (const key in tagRanks) {
          if (postRanks[i].categories) {
            if (postRanks[i].categories.includes(key)) {
              postRanks[i].rank += tagRanks[key];
            }
          }
        }
      }
    };
    await getFinalRanking(postsWRanks, tagRanks);
    //send posts in order of ranking
    await res.send(postsWRanks.sort((a, b) => (a.rank > b.rank ? -1 : 1)));
  } catch (error) {
    console.error("ranked", error);
  }
});

//gets updated post obj after user engages
router.get(
  "/updatedPost/:postId/:userId",
  async (req: Request, res: Response) => {
    const { postId, userId } = req.params;

    try {
      //find post by id
      const post: any = await Post.findByPk(postId, {
        include: [Like, Comment, { model: User, as: "user" }],
      });

      const likedPost = await Like.findAll({
        where: { userId, postId },
      });

      if (likedPost.length > 0) {
        post.dataValues.isLiked = true;
      } else {
        post.dataValues.isLiked = false;
      }

      res.status(200).send(post);
    } catch (error) {
      console.error("updated like count", error);
    }
  }
);

// gets all categories from posts in the db
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const allCategories = await Post.findAll({
      attributes: ['categories']
    })
    //console.log('allCategories', allCategories)
    const categories = allCategories.map((post: any) => post.dataValues.categories)
    // map through and extract only unique categories
    const uniqueCategories = [...new Set(categories.flat())]
    res.send(uniqueCategories)
  } catch (error) {
    console.error('error getting all categories', error)
  }
})

//gets all users
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({});
    res.status(200).send(users);
  } catch (error) {
    console.error("could not get all users", error);
    res.sendStatus(500);
  }
});
// searches selected user's followers for matching username
router.get(
  "/user/:userId/followers/search/:searchInput",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, searchInput } = req.params;
      const followers = await Follower.findAll({
        where: {
          followingId: userId,
        },
      });
      const followerDisplayInformation = await User.findAll({
        where: {
          id: followers.map((follower: any) => follower.userId),
          username: {
            [Op.iLike]: `%${searchInput}%`,
          },
        },
      });
      const extractedFollowerInfo = followerDisplayInformation.map(
        (follower: any) => {
          return {
            id: follower.id,
            username: follower.username,
            profileImgUrl: follower.profileImgUrl,
          };
        }
      );
      res.send(extractedFollowerInfo);
    } catch (error) {
      console.error("Error searching the followers", error);
      res.sendStatus(500);
    }
  }
);

router.get('/radio/:name', async (req: Request, res: Response) => {
  const {name} = req.params

 
  try {
    const getRadio = Radio.findAll({
      where: {
        title: name
      }
    })
    getRadio.then((info) => {
      res.send(info).status(200)
    })
    //console.log('gotten', getRadio)
  }catch{
    console.log('no')
  }
 })

// gets the selected users following and searches for matching username
router.get(
  "/user/:userId/following/search/:searchInput",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, searchInput } = req.params;
      const following = await Follower.findAll({
        where: {
          userId,
        },
      });
      const followingDisplayInformation = await User.findAll({
        where: {
          id: following.map((follower: any) => follower.followingId),
          username: {
            [Op.iLike]: `%${searchInput}%`,
          },
        },
      });
      const extractedFollowingInfo = followingDisplayInformation.map(
        (following: any) => {
          return {
            id: following.id,
            username: following.username,
            profileImgUrl: following.profileImgUrl,
          };
        }
      );
      res.send(extractedFollowingInfo);
    } catch (error) {
      console.error("Error searching the followers", error);
      res.sendStatus(500);
    }
  }
);

//gets all the selected Users Followers
router.get(
  "/user/:userId/followers",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      // fetch the followers and extract the user Id's to cross reference with the users table to get the user info
      const followers = await Follower.findAll({
        where: {
          followingId: userId,
        },
      });
      const followerDisplayInformation = await User.findAll({
        where: {
          id: followers.map((follower: any) => follower.userId),
        },
      });
      const extractedFollowerInfo = followerDisplayInformation.map(
        (follower: any) => {
          return {
            id: follower.id,
            username: follower.username,
            profileImgUrl: follower.profileImgUrl,
          };
        }
      );
      res.send(extractedFollowerInfo);
    } catch (error) {
      console.error("could not get followers", error);
      res.sendStatus(500);
    }
  }
);
// Gets all the users that the selected user is following
router.get(
  "/user/:userId/following",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      // fetch the following and get the user id's to cross ref
      const following = await Follower.findAll({
        where: {
          userId,
        },
      });
      const followingDisplayInformation = await User.findAll({
        where: {
          id: following.map((follower: any) => follower.followingId),
        },
      });
      const extractedFollowingInfo = followingDisplayInformation.map(
        (following: any) => {
          return {
            id: following.id,
            username: following.username,
            profileImgUrl: following.profileImgUrl,
          };
        }
      );
      res.send(extractedFollowingInfo);
    } catch (error) {
      console.error("could not get following", error);
      res.sendStatus(500);
    }
  }
);

//Gets all posts from people user is following (for following feed)
router.get(
  "/following/:userId/:tag",
  async (req: Request, res: Response): Promise<void> => {
    const { userId, tag } = req.params;
    try {
      const following = await Follower.findAll({
        where: {
          userId,
        },
      });
      const followingArr = following.map((follow: any) => {
        const obj: any = {};
        obj.userId = follow.followingId;
        return obj;
      });
      const followingPosts: any = await Post.findAll({
        where: {
          [Op.or]: followingArr,
        },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: Like,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const likedPosts = await Like.findAll({
        where: { userId },
      });

      const likedPostIdArr = await likedPosts.map((post: any) => post.postId);

      await addIsLikedPair(followingPosts, likedPostIdArr);
      await res.status(200).send(followingPosts);
    } catch (error) {
      res.sendStatus(500);
      console.error("could not get following posts", error);
    }
  }
);

//gets posts ranked by popularity for home pages before user signs in
router.get("/home", async (req: Request, res: Response) => {
  try {
    const allPosts = await Post.findAll({
      include: [Like, Comment, { model: User, as: "user" }],
    });

    //clean query response to only include dataValues
    const postDataValues = await allPosts.map((post) => post.dataValues);

    //add popularity ranking based on overall likes, comments, and listen counts
    const postsWRanks = rankPostsByPopularity(postDataValues);

    res
      .status(200)
      .send(postsWRanks.sort((a, b) => (a.rank > b.rank ? -1 : 1)));
  } catch (error) {
    console.error("server error getting home feed:", error);
  }
});
router.get("/use/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const users = await User.findOne({
      where: {
        id,
      },
    });
    res.status(200).send(users);
  } catch (error) {
    res.sendStatus(500);
    console.error("could not get following posts", error);
  }
});

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).send(users);
  } catch (error) {
    res.sendStatus(500);
    console.error("could not get following posts", error);
  }

})
// Gets all the users that the selected user is following
router.get('/user/:userId/following', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    // fetch the following and get the user id's to cross ref
    const following = await Follower.findAll({
      where: {
        userId
      }
    })
    const followingDisplayInformation = await User.findAll({
      where: {
        id: following.map((follower: any) => follower.followingId),
      }
    })
    const extractedFollowingInfo = followingDisplayInformation.map((following: any) => {
      return {
        id: following.id,
        username: following.username,
        profileImgUrl: following.profileImgUrl,
      }
    });
    res.send(extractedFollowingInfo);
  } catch (error) {
    console.error('could not get following', error)
    res.sendStatus(500)
  }
})

//Gets all posts from people user is following (for following feed)
router.get('/following/:userId/:tag', async (req: Request, res: Response): Promise<void> => {
const { userId, tag } = req.params;
try{
  const following = await Follower.findAll({
    where: {
      userId
    }
  })
  const followingArr = following.map((follow: any) => {
    const obj: any = {}
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
  console.log('could not get following posts', error)
}

})

//gets posts ranked by popularity for home pages before user signs in
router.get('/home', async (req: Request, res: Response) => {
  try{
    const allPosts = await Post.findAll({
      include: [
        Like,
        Comment,
        { model: User,
          as: 'user'}
        ]
      })
      
      //clean query response to only include dataValues
      const postDataValues = await allPosts.map((post) => post.dataValues)
      //console.log('home', postDataValues)

  //add popularity ranking based on overall likes, comments, and listen counts
  const postsWRanks = rankPostsByPopularity(postDataValues)

  res.status(200).send(postsWRanks.sort((a, b) => (a.rank > b.rank ? -1 : 1)))
  }catch (error){
    console.error('server error getting home feed:', error)
  }
})
router.get('/use/:id', async (req: Request, res: Response) => {
  const {id} = req.params
  try{
    const users = await User.findOne({
      where: {
        id
      }
    })
    res.status(200).send(users)
  
  }catch(error){
    res.sendStatus(500)
    console.log('could not get following posts', error)
  }
  
  })


router.get('/users', async (req: Request, res: Response) => {

  try{
    const users = await User.findAll()
    res.status(200).send(users)
  
  }catch(error){
    res.sendStatus(500)
    console.log('could not get following posts', error)
  }
  
  })

  router.get('/user/:username', async (req: Request, res: Response) => {
    
    const {username} = req.params
    try{
      const users = await User.findAll({
        where: {
          username: username
        }
      })
      res.status(200).send(users)
    
    }catch(error){
      res.sendStatus(500)
      console.log('could not get user', error)
    }
    
    })


//gets all posts
router.get("/explore/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const postsArr = await Post.findAll({
      //need to figure this out so you can exclude viewing user
      // where: {
      //   [Op.ne]: userId
      // },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Like,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).send(postsArr);
  } catch (error) {
    res.sendStatus(500);
    console.error("could not get following posts", error);
  }
});
//creates comment
router.post("/createCommentRecord", async (req: Request, res: Response) => {
  const { userId, postId, soundUrl } = req.body;
  try {
    await Comment.create({ userId, postId, soundUrl });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not add comment", error);
    res.sendStatus(500);
  }
});
//add following relationship
router.post("/startFollowing", async (req: Request, res: Response) => {
  const { userId, followingId } = req.body;
  try {
    const startFollowing = await Follower.create({ userId, followingId });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not follow", error);
    res.sendStatus(500);
  }
});

router.post("/radio", async (req: Request, res: Response) => {
  const { host, listenerCount, category, soundUrl, title } = req.body;

  try {
    const radio = await Radio.create({ host, listenerCount: 0, title });
    res.status(201).send(radio);
  } catch {}
});
//allows user to like a post and add a record to the like table
router.post("/like", async (req: Request, res: Response) => {
  const { userId, postId } = req.body;
  try {
    const createdLike = await Like.create({
      userId,
      postId,
    });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not add like", error);
    res.sendStatus(500);
  }
});

//allows user to unlike a post and removes like record from db
router.delete(
  "/unlike/:postId/:userId",
  async (req: Request, res: Response) => {
    const { postId, userId } = req.params;

    try {
      const destroyLike = await Like.destroy({
        where: {
          postId,
          userId,
        },
      });
      res.sendStatus(201);
    } catch (error) {
      console.error("could not remove like", error);
      res.sendStatus(500);
    }
  }
);
//gets all comments for one post
router.get("/comment/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const postComments = await Comment.findAll({
      where: {
        postId,
      },
      include: User,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).send(postComments);
  } catch (error) {
    console.error("could not get post comments", error);
    res.sendStatus(500);
  }
});
//get only one user's posts
router.get("/selected/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const selectedUserPosts = await Post.findAll({
      where: { userId: id },
      include: [
        {
          model: User,
          as: "user",
        },
        Like,
        Comment,
      ],
      order: [["createdAt", "DESC"]],
    });

    const likedPosts = await Like.findAll({
      where: { id },
    });

    const likedPostIdArr = await likedPosts.map((post: any) => post.postId);

    await addIsLikedPair(selectedUserPosts, likedPostIdArr);
    res.status(200).send(selectedUserPosts);
  } catch (error) {
    console.error("query failed: could not get selected user", error);
    res.sendStatus(500);
  }
});

router.get(
  "/isFollowing/:userId/:followingId",
  async (req: Request, res: Response) => {
    const { userId, followingId } = req.params;
    try {
      const isFollowing = await Follower.findAll({
        where: {
          userId,
          followingId,
        },
      });

      if (isFollowing.length > 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error("error checking following relationship", error);
    }
  }
);

router.get("/followers/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const followers = await Follower.findAll({
      where: {
        followingId: 4,
      },
    });
    res.status(200).send(followers);
  } catch (error) {
    console.error("error checking following relationship", error);
  }
});

//get top tags
router.get("/tags", async (req: Request, res: Response) => {
  try {
    const tags = await Post.findAll({
      where: {
        categories: {
          [Op.ne]: null,
        },
      },
      attributes: ["categories"],
    });

    const tagFrequencyObj = tags
      .flatMap((tagObj) => tagObj.dataValues.categories)
      .reduce((tagCounterObj, tag) => {
        if (tagCounterObj[tag]) {
          tagCounterObj[tag] += 1;
        } else {
          tagCounterObj[tag] = 1;
        }
        return tagCounterObj;
      }, {});

    const sortedTopTags = Object.entries(tagFrequencyObj)
      .sort((a: any, b: any) => b[1] - a[1])
      .flatMap((tagArr) => tagArr[0]);

    const tagsToSend =
      sortedTopTags.length > 20 ? sortedTopTags.slice(0, 20) : sortedTopTags;
    res.status(200).send(tagsToSend);
  } catch (error) {
    console.error("get tags error:", error);
    res.sendStatus(500);
  }
});
 router.get('/shared/:id/:type', async (req: Request, res: Response) => {
  const { id, type } = req.params;
 
  let sharedPosts;
  try{
   if(type === 'notification'){
    sharedPosts = await SharedPost.findAll({
      where: {
        sentToId: id,
        hasSeen: false
      }
     })
   } else {
    const userModel = type === 'sentToId' ? 'sentFromUser' : 'sentToUser'
    sharedPosts = await SharedPost.findAll({
      where: {[type]: id},
      include: [Post, { model: User,
        as: userModel }],
      order:[
          ['createdAt', 'DESC']
        ],
     })
   }
    res.send(sharedPosts)
  }catch(error){
    console.error('error getting shared posts', error)
  }
 })

// *************POST REQUESTS***********************

 router.post('/radio', async(req: Request, res: Response) => {
  const {host, listenerCount, category, soundUrl, title} = req.body

  try {
    const radio = await Radio.create({host, listenerCount: 0, title})
    res.status(201).send(radio)
  }catch {

  }
 })

//creates comment
router.post("/createCommentRecord", async (req: Request, res: Response) => {
  const { userId, postId, soundUrl } = req.body;
  try {
    await Comment.create({ userId, postId, soundUrl });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not add comment", error);
    res.sendStatus(500);
  }
});

//creates following relationship
router.post("/startFollowing", async (req: Request, res: Response) => {
  const { userId, followingId } = req.body;
  try {
    const startFollowing = await Follower.create({ userId, followingId });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not follow", error);
    res.sendStatus(500);
  }
});

// add a record to the like table when user likes post
router.post("/like", async (req: Request, res: Response) => {
  const { userId, postId } = req.body;
  try {
    const createdLike = await Like.create({
      userId,
      postId,
    });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not add like", error);
    res.sendStatus(500);
  }
});

// add a record to the listen table when user completely listens to a post
router.post("/listen", async (req: Request, res: Response) => {
  const { userId, postId } = req.body;
  try {
    const createdListen = await Listen.create({
      userId,
      postId,
    });
    res.sendStatus(201);
  } catch (error) {
    console.error("could not add listen", error);
    res.sendStatus(500);
  }
});

//*******************PUT REQUESTS ********************** */
router.put("/updateCount", async (req: Request, res: Response) => {
  const { column, type, id } = req.body;

  try {
    let updateResult;

    const postToUpdate: any = await Post.findByPk(id);
    if (type === "increment") {
      updateResult = await postToUpdate.increment(column);
    }

    if (type === "decrement") {
      updateResult = await postToUpdate.decrement(column);
    }
    res.status(200).send(updateResult);
  } catch (error) {
    console.error("could not update count", error);
  }
});

router.put("/selectedTags/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    await User.update(
      { selectedTags: tags },
      {
        where: {
          id,
        },
      }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error("could not add selected tags to user", error);
    res.send(500);
  }
});

router.put('/hasSeen', async (req:Request, res:Response) => {
  const { id, bool, userType, modelType } = req.body;
 // console.log('magic conch has seen', id, bool, userType, modelType)
  const userModel = userType === 'sentToId' ? 'sentFromUser' : 'sentToUser'
  const model = modelType === 'SharedPost' ? SharedPost : MagicConch
  let updated;  
  try {
    const updateHasSeen = await model.update({hasSeen: bool}, {where: {id}})
    if(modelType === 'SharedPost'){
      updated = await model.findByPk(id, {include: [Post, { model: User,
        as: userModel }] })
    } else {
      updated = await model.findByPk(id)
    }
    res.send(updated)
  }catch (error){
    console.error('could not update hasSeen on share post', error)
    res.sendStatus(500)
  }
})
// **********************DELETE REQUESTS****************************
//allows user to unlike a post and removes like record from db
router.delete(
  "/unlike/:userId/:postId",
  async (req: Request, res: Response) => {
    const { userId, postId } = req.params;

    try {
      const destroyLike = await Like.destroy({
        where: {
          userId,
          postId,
        },
      });
      res.sendStatus(201);
    } catch (error) {
      console.error("could not remove like", error);
      res.sendStatus(500);
    }
  }
);

router.delete("/radio/:name", async (req: Request, res: Response) => {
  const { name } = req.params;

  //console.log("hete", name);
  try {
    const destroyRadio = Radio.destroy({
      where: {
        host: name
      }
    })
    //console.log('deleted', destroyRadio)
    res.sendStatus(201)
  }catch{
    console.error('no')
  }
});

//allows user to unfollow another user
router.delete(
  "/stopFollowing/:userId/:followingId",
  async (req: Request, res: Response) => {
    const { userId, followingId } = req.params;

    try {
      const destroyFollowing = await Follower.destroy({
        where: {
          userId,
          followingId,
        },
      });
      res.sendStatus(201);
    } catch (error) {
      console.error("server could not unfollow", error);
    }
  }
);
module.exports = router;

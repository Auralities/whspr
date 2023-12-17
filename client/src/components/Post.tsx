import React, {useState, useEffect} from "react";
import axios, {AxiosResponse} from "axios";
import Comment from "./Comment";
import { RecordComment } from "./RecordComment"
import WaveSurferComponent from "./WaveSurfer";

 const Post = (props) => {
  const { postObj, audioContext, user, updatePost } = props
  const [commentInputOpen, setCommentInputOpen] = useState<boolean>(false)
  const [commentOpen, setCommentOpen] = useState<boolean>(false)
  const [comments, setComments] = useState<any>()
  
  //const [likedPosts, setLikedPosts] = useState<any>([])
  //const userId = 1
  const userObj = {
    username: 'syd'
  }
  const handleLike = async()=> {
    try{
       await axios.post('/post/like', {userId: user.id, postId: postObj.id})
       await axios.put('/post/updateCount', {type: 'increment', column: 'likeCount', id: postObj.id})
       await updatePost(postObj.id, user.id)
    } catch(error){
      console.log('client could not like', error)
    }
  }
const handleUnlike = async() => {
  try{
    //const likeObj = postObj.Likes.filter((likeObj) => likeObj.userId == user.id)
    //console.log(likeObj)
    await axios.delete(`/post/unlike/${user.id}/${postObj.id}`)
    await axios.put('/post/updateCount', {type: 'decrement', column: 'likeCount', id: postObj.id})
    await updatePost(postObj.id, user.id)
  } catch(error){
    console.log('client could not unlike', error)
  }
}

const getComments = async() => {
try{
const commentsArr = await axios.get(`/post/comment/${postObj.id}`)
if(commentsArr.data.length > 0){
  setComments(commentsArr.data)
  console.log('got comments', commentsArr.data)
}
}catch(error) {
  console.error('could not get comments', error)
}
}

useEffect(() => {
  getComments()
}, [])
//style={{borderRadius: "75px"}}
  return(
    <div className="card" >
      
      <div className="card-body" >
        {/* <a href="#" className="card-link">{postObj.user.username}</a>
        <h3>{postObj.title}</h3> */}
        {/* <audio controls>
          <source src={postObj.soundUrl} type="audio/webm" />
        </audio> */}
        {/* <h4>{`category: ${postObj.category}`}</h4> */}
        {postObj.isLiked
        ?
         <div> <button
        type="button"
        className="btn"
        onClick={()=> handleUnlike()}
        style={{backgroundColor:'white', borderColor:'white'}}
        ><svg width="26" height="26" fill='black' className="bi bi-heart-fill" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"></path> 
  
        </svg>
       </button>
       {postObj.likeCount ? <p>{postObj.likeCount}</p> : <p></p>} </div>
        : <div> <button
        type="button"
        className="btn"
        onClick={()=> handleLike()}
        style={{backgroundColor:'white', borderColor:'white'}}
        > <svg width="26" height="26" fill="black" className="bi bi-heart" viewBox="0 0 16 16">
        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"></path>
      </svg>
        </button>
       {postObj.likeCount ? <p>{postObj.likeCount}</p> : <p></p>}</div>}
      </div>
      {postObj.commentCount 
                ?<div>{`comments: ${postObj.commentCount}`}</div>
                :<div>Be the first to comment!</div>}
      <div className="accordion" id="commentBox">
        <div className="accordion-item"></div>
        <h4 className="accordion-header">
          <button className="accordion-button collapsed"
           type="button"
           onClick={() => setCommentInputOpen(() => !commentInputOpen)}
           >Comment</button>
        </h4>
       {commentInputOpen ?
       <div id="commentInput" className="accordion-collapse show" data-bs-parent="#commentBox">
       <div className="accordion-body">
        <p>Record Your Comment</p>
         <RecordComment
         audioContext={audioContext}
         postObj={postObj}
         getComments={getComments}
         user={user}
         updatePost={updatePost}
         />
        <div className="accordion" id="previousComments">
        <div className="accordion-item"></div>
        <h4 className="accordion-header">
          <button className="accordion-button collapsed"
           type="button"
           onClick={() => setCommentOpen(() => !commentOpen)}
           >Show Comment</button>
        </h4>
        {commentOpen ?
        <div id="pastComments" className="accordion-collapse show" data-bs-parent="#commentBox"> 
        <div className="accordion-body">
          { comments
          ? comments.map((commentObj: any) => (
            <Comment 
            key={commentObj.id}
            comment={commentObj}
            />
          ))
          : <div>No Comments Yet!</div>
          }
        </div>
        </div>
        : <div id="pastComments" className="accordion-collapse collapse" /> }
        </div>
       </div>
     </div>
       : <div id="commentInput" className="accordion-collapse collapse" />}
      </div>
    </div>
  )
}
export default Post
import React, {useState, useEffect} from "react";
import axios, {AxiosResponse} from "axios";
import Comment from "./Comment";
import { RecordComment } from "./RecordComment";
//import WaveSurferComponent from "./WaveSurfer";

 const Post = (props) => {
  const { postObj, userId, updatePost, audioContext } = props
  // const [commentInputOpen, setCommentInputOpen] = useState<boolean>(false)
  const [hearLess, setHearLess] = useState<boolean>(false)
  const [comments, setComments] = useState<any>([])
  
//   const handleLike = async()=> {
//     try{
//        await axios.post('/post/like', {userId, postId: postObj.id})
//        await axios.put('/post/updateCount', {type: 'increment', column: 'likeCount', id: postObj.id})
//        await updatePost(postObj.id, userId)
//     } catch(error){
//       console.log('client could not like', error)
//     }
//   };
//   const handleUnlike = async () => {
//     try {
//     //const likeObj = postObj.Likes.filter((likeObj) => likeObj.userId == user.id)
//     //console.log(likeObj)
//     await axios.delete(`/post/unlike/${userId}/${postObj.id}`)
//     await axios.put('/post/updateCount', {type: 'decrement', column: 'likeCount', id: postObj.id})
//     await updatePost(postObj.id, userId)
//   } catch(error){
//     console.log('client could not unlike', error)
//   }
// }

const getComments = async(limit: number, type: string) => {
try{
const commentsArr = await axios.get(`/post/comment/${postObj.id}/${limit}`)
if(commentsArr.data.length > 0 && type === 'more'){
  setComments(commentsArr.data)
  setHearLess(true)
  console.log('got new comments', commentsArr.data)
} else if(commentsArr.data.length > 0 && type === 'first'){
  setComments(commentsArr.data)
  console.log('got comments', commentsArr.data)
}
}catch(error) {
  console.error('could not get comments', error)
}
}

const handleHearLess = () => {
  const lessComments = comments.slice(0, 2)
  setComments(lessComments)
  setHearLess(false)
}

useEffect(() => {
  getComments(2, 'first')
}, [])
//style={{borderRadius: "75px"}}
  return(
    <div  >
      <div id="header" style={{margin: '16px', display: 'flex', flexDirection: 'column', alignContent:'center'}}>
      <h3 style={{marginLeft: '55px', marginTop:'20px'}}>Record Your Comment</h3>
         <RecordComment
         audioContext={audioContext}
         postObj={postObj}
         commentStateLength={comments.length}
         getComments={getComments}
         userId={userId}
         updatePost={updatePost}
         />
      </div>
      { comments
          ? comments.map((commentObj: any) => (
            <Comment 
            key={commentObj.id}
            comment={commentObj}
            audioContext={audioContext}
            />
          ))
          : <div>No Comments Yet!</div>
          }
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'end'}}>
            { comments && postObj.commentCount > comments.length
                  ? <button
                    style={{margin:'5px'}}
                    className='btn btn-light'
                    onClick={() => {getComments(comments.length + 5, 'more')}}
                    >hear more</button>
                  : <div></div>
              }
            {hearLess
            ? <button
            style={{margin:'5px'}}
              className= 'btn btn-light'
              onClick={() => handleHearLess()}>
              hear less
              </button> 
            : <div></div>}
          </div>
          
    </div>
  );
};
export default Post;
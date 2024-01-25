import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import Comment from './Comment';
import { RecordComment } from './RecordComment';
import { Button } from 'react-bootstrap';
import { addSyntheticLeadingComment } from 'typescript';
import { Modal } from 'react-bootstrap';
//import WaveSurferComponent from "./WaveSurfer";

interface PostProps {
  postObj: any,
  userId: number,
  updatePost: any,
  audioContext: AudioContext,
  addComment: boolean,
  setAddComment: any,
  onProfile: boolean,
  onUserProfile: boolean,
  waveHeight: number,
  onConch: boolean,
  deleting: boolean
  setDeleting: any
  setSelectedUserPosts: any
}
const Post = (props) => {
  const { postObj, userId, updatePost, audioContext, addComment, setAddComment, onProfile, onUserProfile, onConch, deleting, setSelectedUserPosts, setDeleting, waveHeight } = props;
  const [hearLess, setHearLess] = useState<boolean>(false);
  const [comments, setComments] = useState<any>([]);
  const getComments = async () => {
    try {
      const commentsArr = await axios.get(`/post/comment/${postObj.id}`);
      setComments(commentsArr.data);
      setHearLess(true);
    } catch (error) {
      console.error('could not get comments', error);
    }
  };

  const handleHearLess = () => {
    //const lessComments = comments.slice(0, 2);
    setComments([]);
    setHearLess(false);
  };

  const handleDelete: (postId: number) => void = async (postId) => {
    try {
      const deletePost = await axios.delete(`/deletePost/${userId}/${postId}`);
      const getPosts = await axios.get(`/post/selected/${userId}`);
      setSelectedUserPosts(getPosts.data);
      setDeleting(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ minHeight: '50px' }} >
      {
        addComment ?
        // <Modal show={addComment}>
        //<div className='shadow'>
        <div className= 'post-bottom-overlay on-profile-tags' style={{ margin: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '10.5rem', maxHeight: '10.5rem', overflow: 'scroll' }}>
          <div onClick={() => setAddComment(false)}style={{ margin: '.5rem auto .5rem .5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#e1e1e1" className="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </div>
          <div style={{ margin: '.5rem 0 .25rem 0', fontSize: onProfile || onUserProfile || onConch ? '1rem' : '2rem', color: '#e1e1e1' }}>Record Your Comment</div>
          <RecordComment
            audioContext={audioContext}
            postObj={postObj}
            commentStateLength={comments.length}
            getComments={getComments}
            userId={userId}
            updatePost={updatePost}
            addComment={addComment}
            setAddComment={setAddComment}
            onProfile={onProfile || onUserProfile}
          />
      </div>
      //</div>
          : <div></div>
        }
        {deleting ?
        <div className= 'post-bottom-overlay on-profile-tags text-white' style={{ margin: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '10.5rem', maxHeight: '10.5rem', overflow: 'scroll' }}>
          <div onClick={() => {
            if (addComment) {
              setAddComment(false);
            } else if (deleting) {
              setDeleting(false);
            }
          } } 
          id='hover'
          style={{ margin: '.5rem auto .5rem .5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#e1e1e1" className="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </div>
          <div style={{ margin: '.5rem 0 .25rem 0', fontSize: onProfile || onUserProfile || onConch ? '1rem' : '2rem', color: '#e1e1e1' }}>Delete this post?</div>
          <div style={{ display: 'flex-row', margin: 'auto' }}>
            <Button className="activeButton" style={{ marginRight: '1rem' }} onClick={() => handleDelete(postObj.id)}>Yes</Button>
            <Button className="btn-secondary" style={{ marginLeft: '1rem' }} onClick={() => setDeleting(false)}>No</Button>
          </div>
        </div>
          : <div></div>
        }

      { comments.length > 0
        ? <div className='post-bottom-overlay on-profile-tags' style={{ margin: '1rem', maxHeight: '20rem', height: '20rem', overflow: 'scroll', display: 'flex', flexDirection: 'column' }} >
          <div onClick={() => handleHearLess()} style={{ margin: '.5rem' }}> 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#e1e1e1" className="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </div>
          <div style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: onProfile || onUserProfile || onConch ? '1rem' : '2rem', color: '#e1e1e5' }}>Comments</div>
      { comments.map((commentObj: any) => (
          <Comment 
          key={commentObj.id}
          comment={commentObj}
          audioContext={audioContext}
          onProfile={onProfile || onUserProfile}
          />
      ))}
          </div>
        : <div></div>
        }
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'start' }}>
          { comments && postObj.commentCount > comments.length
            ? <button
                  style={{ marginLeft: '10px', marginBottom: '1rem', color: '#e1e1e5', background: 'transparent', textDecoration: 'underline', border: 'none' }}
                  //className='btn-link'
                  onClick={() => { getComments(); }}
                  >{`Listen to all ${postObj.commentCount} comments`}</button>
            : <div> <button className='simple-btn'></button></div>
            }
            {/* {hearLess
              ? <button
              style={{ margin: '10px', marginBottom: '1rem', color: '#e1e1e5', background: 'transparent', textDecoration: 'underline', border: 'none' }}
              //className= 'btn-link'
              onClick={() => handleHearLess()}>
              Done Listening
              </button> 
              : <div></div>} */}
      </div>
          
    </div>
  );
};
export default Post;
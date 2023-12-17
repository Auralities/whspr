import React, { useEffect, useState } from "react";
import axios, {AxiosResponse} from "axios";
import PostCard from "./PostCard"
import Post from "./Post";
import WaveSurferComponent from "./WaveSurfer";
import { useLoaderData } from 'react-router-dom';

const Feed = ({ audioContext }: { audioContext: BaseAudioContext }) => {
const [posts, setPosts] = useState<any>()
const [feed, setFeed] = useState<string>('explore')
const [title, setTitle] = useState<string>('Explore WHSPR')
const [onProfile, setOnProfile] =useState<boolean>(false)
const user: any = useLoaderData();
// console.log(user)

const getPosts = async(type, tag) => {
  setFeed(type)
  try{
   // console.log('request variables', type, user.id, tag)
    const allPosts: AxiosResponse = await axios.get(`/post/${type}/${user.id}/${tag}`)
    setPosts(allPosts.data)
    if(tag !== 'none'){
        setTitle(`Explore #${tag}`)
    } else if(type === 'following'){
        setTitle('Posts from your Friends')
    } else {
        setTitle('Explore WHSPR')
    }
    console.log('all posts', allPosts.data)
  } catch(error) {
    console.log('client get friends', error)
  }
}

const updatePost = async(postId, updateType) => {
    try{
        const updatedPost:any = await axios.get(`/post/updatedPost/${postId}/${user.id}`)
        console.log('updated post obj', updatedPost)
        const postIndex = posts.findIndex((post) => post.id === updatedPost.data.id)
        updatedPost.data.rank = posts[postIndex].rank
        //console.log('post index', updatePostIndex)
        const postsWUpdatedPost = posts.toSpliced(postIndex, 1, updatedPost.data )
        console.log(postsWUpdatedPost)
        setPosts(postsWUpdatedPost)
    } catch(error){
        console.log('could not update post', error)
    }
}
useEffect(() => {
  getPosts('explore', 'none')
}, [])
  return (
    <div>
    <div className="centered">
<PostCard audioContext={audioContext}/>
    </div>
    <h2 style={{color: 'white'}}>{title}</h2>
    {feed === 'following' ?
    <div>
        <button
        type="button"
        className="btn btn-dark"
        onClick={() => getPosts('following', 'none')}
        >Following</button>
        <button
        type="button"
        className="btn btn-light"
        onClick={() => getPosts('explore', 'none')}
        >Explore</button>
    </div>
    : <div>
      <button
        type="button"
        className="btn btn-light"
        onClick={() => getPosts('following', 'none')}
        >Following</button>
        <button
        type="button"
        className="btn btn-dark"
        onClick={() => getPosts('explore', 'none')}
        >Explore</button>
      </div>}
      {posts ? posts.map((post: any) => (
        <div>
          <WaveSurferComponent 
          postObj={post} 
          audioUrl={post.soundUrl} 
          postId={post.id} 
          userId={user.id}
          getPosts={getPosts}
          updatePost={updatePost}
          />
          <Post
            key = {post.id}
            postObj = {post}
            updatePost={updatePost}
            audioContext={audioContext}
            feed={feed}
            user={user}
          />
          {/* each post should have its own instance of a waveSurfer comp */}

        </div>
      )) : <div>Loading...</div>}
    </div>

  )
}
export default Feed;

/**
 * const test = { data: [
   {
      "id": 8,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.289Z",
      "updatedAt": "2023-12-07T14:43:27.289Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": [
          {
              "id": 3,
              "userId": 1,
              "postId": 8,
              "createdAt": "2023-12-07T20:22:24.877Z",
              "updatedAt": "2023-12-07T20:22:24.877Z"
          },
          {
              "id": 5,
              "userId": 2,
              "postId": 8,
              "createdAt": "2023-12-07T21:46:16.579Z",
              "updatedAt": "2023-12-07T21:46:16.579Z"
          }
      ]
  },
  {
      "id": 10,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.318Z",
      "updatedAt": "2023-12-07T14:43:27.318Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": [
          {
              "id": 4,
              "userId": 1,
              "postId": 10,
              "createdAt": "2023-12-07T21:32:52.225Z",
              "updatedAt": "2023-12-07T21:32:52.225Z"
          }
      ]
  },
  {
      "id": 2,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:38:40.022Z",
      "updatedAt": "2023-12-07T14:38:40.022Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": [
          {
              "id": 6,
              "userId": 1,
              "postId": 2,
              "createdAt": "2023-12-07T21:55:25.800Z",
              "updatedAt": "2023-12-07T21:55:25.800Z"
          }
      ]
  },
  {
      "id": 5,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.649Z",
      "updatedAt": "2023-12-07T14:39:38.649Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 6,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.649Z",
      "updatedAt": "2023-12-07T14:39:38.649Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 4,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.605Z",
      "updatedAt": "2023-12-07T14:39:38.605Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 1,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:38:40.022Z",
      "updatedAt": "2023-12-07T14:38:40.022Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 3,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.605Z",
      "updatedAt": "2023-12-07T14:39:38.605Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 9,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.318Z",
      "updatedAt": "2023-12-07T14:43:27.318Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 7,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.289Z",
      "updatedAt": "2023-12-07T14:43:27.289Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  }
]}
 */
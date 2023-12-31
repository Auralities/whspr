import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLoaderData } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import CardTitle from 'react-bootstrap/esm/CardTitle';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Post from './Post';
import RadioConfig from './RadioConfig';
import Container from 'react-bootstrap/Container';
import WaveSurferComponent from './WaveSurfer';
import WaveSurferSimple from './WaveSurferSimple';
import { Link } from 'react-router-dom';
interface PostAttributes {
  id: number;
  userId: number;
  title: string;
  categories: string[];
  soundUrl: string;
  commentCount: number;
  likeCount: number;
  listenCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    profileImgUrl: string;
    googleId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  Likes: {
    id: number;
    userId: number;
    postId: number;
    createdAt: Date;
    updatedAt: Date;
  };
  Comments: {
    id: number;
    userId: number;
    postId: number;
    soundUrl: string;
    createdAt: Date;
    updatedAt: Date;
  }
  isLiked: boolean;
}
interface followerAttributes {
  id: number;
  username: string;
  profileImgUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
const UserProfile = ({ audioContext, setRoomProps }) => {
  const [selectedUserPosts, setSelectedUserPosts] = useState<PostAttributes[]>([]);
  const [onProfile, setOnProfile] = useState<boolean>(true);
  const [onUserProfile, setOnUserProfile] = useState<boolean>(true);
  const [selectedUserFollowers, setSelectedUserFollowers] = useState<followerAttributes[]>([]);
  const currentUser: any = useLoaderData();
  


  const getSelectedUserInfo = async () => {
    try {
      const selectedUserObj = await axios.get(`/post/selected/${currentUser.id}`);
      setSelectedUserPosts(selectedUserObj.data);
      // setUserPosts(selectedUserObj.data[0].Posts)
      console.log('heyx2', selectedUserObj);
    } catch (error) {
      console.error('could not get selected user info', error);
    }
  };
  const updatePost = async (postId, updateType) => {
    try {
      const updatedPost = await axios.get(`/post/updatedPost/${postId}/${currentUser.id}`);
      const postIndex = selectedUserPosts.findIndex((post) => post.id === updatedPost.data.id);
      updatedPost.data.rank = selectedUserPosts[postIndex].rank;
      const postsWUpdatedPost = selectedUserPosts.splice(postIndex, 1, updatedPost.data);
     
    } catch (error) {
      console.log('could not update post', error);
    }
  };
  const getSelectedUserFollowers = async () => {
    try {
      const followers = await axios.get(`/post/user/${currentUser.id}/followers`);
      setSelectedUserFollowers(followers.data);
    } catch (error) {
      console.log('error fetching current user followers', error);
    }
  };
  // use effect to load user posts on page load and the followers
  useEffect(() => {
    getSelectedUserInfo();
    getSelectedUserFollowers();
  }, []);
  // code to separate the posts on the user profile into a grid
  const numberOfPostsPerRow = 3;
  const rows: PostAttributes[][] = [];
  for (let i = 0; i < selectedUserPosts.length; i += numberOfPostsPerRow) {
    const row = selectedUserPosts.slice(i, i + numberOfPostsPerRow);
    rows.push(row);
  }
  return (
    
    <Container>
      <div className="user-main" style={{ display: 'flex' }}>
        <Col xs={12} lg={5}>
          <Row>
            <div className="card user-profile-card" style={{ justifyContent: 'center' }}>
              <div className="user-profile-image">
                <img 
                src={currentUser.profileImgUrl} 
                alt="user profile image" 
                style={{ borderRadius: '50%', width: '100px', height: '100px' }}
                />
              </div>
              <div className="user-profile-info">
                <h2 style={{ color: 'white' }}>{currentUser.username}</h2>
              </div>
                <RadioConfig setRoomProps={setRoomProps}/>

            </div>
          </Row>
        <Row>
          <Col xs={12} lg={6}>
        <div className="card user-profile-followers-card">
          <h2 style={{ color: 'white' }}>Followers</h2>
          <div className="user-profile-followers">
            {selectedUserFollowers.map((follower, index) => (
              <div className="user-profile-follower" key={index}>
                <Link to={`/protected/profile/${follower.id}`}>
                <img
                  src={follower.profileImgUrl}
                  alt="user profile image"
                  style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                />
                <h5 style={{ 
                  color: 'white', 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden', 
                  whiteSpace: 'nowrap',
                }}>{follower.username}</h5>
                  </Link>
              </div>
            ))}
          </div>
        </div>
            </Col>
          </Row>
        </Col>
        <div className="grid-post-container">
          {rows.map((row, index) => (
            <Row key={index}>
              {row.map((post) => (
                <Col key={post.id}>
                  <div className="grid-post-item">
                    <WaveSurferComponent
                      audioContext={audioContext}
                      postObj={post}
                      audioUrl={post.soundUrl}
                      postId={post.id}
                      userId={currentUser.id}
                      updatePost={updatePost}
                      getPosts={getSelectedUserInfo}
                      onProfile={onProfile}
                      onUserProfile={onUserProfile}
                      setOnProfile={setOnProfile}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          ))}
        </div>
      
      </div>
    </Container>

  );
};

export default UserProfile;

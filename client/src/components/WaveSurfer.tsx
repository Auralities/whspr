import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import React, { useEffect, useState } from 'react';
import Delete from './Delete';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Post from './Post';
import HoverPlugin from 'wavesurfer.js/plugins/hover';
import { use } from 'passport';
import { MdOutlineAddComment } from 'react-icons/md';
import { MdOutlineFavoriteBorder } from 'react-icons/md';
import { MdOutlineFavorite } from 'react-icons/md';
import { MdArrowOutward } from 'react-icons/md';
import { MdDeleteOutline } from 'react-icons/md';
import { MdDeleteOutline } from 'react-icons/md';
import { TooltipComponent } from './Tooltip';
import Modal from 'react-bootstrap/Modal';
import { SharePost } from './SharePost';
import toast, { Toaster } from 'react-hot-toast';


dayjs.extend(relativeTime);
interface WaveSurferProps {
  audioUrl: string;
  postId: number;
  postObj: any;
  userId: number;
  getPosts: any;
  updatePost: any;
  onProfile: boolean;
  onUserProfile: boolean;
  setOnProfile: any;
  audioContext: AudioContext;
  feed: string;
  setCorrectPostId: any
  setSelectedUserPosts: any
  setCurrentDeletePostId: any
  onHome: boolean
  onConch: boolean
  waveHeight: number;
  isConch: boolean;
  containerType: string;
  setSelectedUserPosts: any
  // showBigPost: boolean,
  // setShowBigPost: any,
  // bigPost: any,
  // setBigPost: any,
}

const WaveSurferComponent: React.FC<WaveSurferProps> = ({
  postObj,
  audioUrl,
  postId,
  userId,
  getPosts,
  updatePost,
  onProfile,
  onUserProfile,
  setOnProfile,
  audioContext,
  feed,
  setSelectedUserPosts,
  onHome,
  onConch,
  waveHeight,
  isConch,
  containerType,

}) => {
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [display, setDisplay] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [decodedData, setDecodedData] = useState<any>();
  const [following, setFollowing] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [duration, setDuration] = useState<string>();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [addComment, setAddComment] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const containerId = `waveform-${postId || ''}-${containerType}`;
  // toast notifications
  const notifyLike = (): void => {
    toast.success('Post liked!', {
      icon: '❤️‍🔥',
      style: {
        background: 'rgba(34, 221, 84, 0.785)',
      },
      position: 'top-right',
    });
  };
  const notifyUnlike = (): void => {
    toast.error('Post unliked!', {
      icon: '💔',
      style: {
        background: 'rgba(221, 34, 34, 0.785)',
      },
      position: 'top-right',
    });
  };
  const notifyFollow = (): void => {
    toast.success('Followed!', {
      icon: '🤝',
      style: {
        background: 'rgba(34, 221, 84, 0.785)',
      },
      position: 'top-right',
    });
  };
  const notifyUnfollow = (): void => {
    toast.error('Unfollowed!', {
      icon: '👋',
      style: {
        background: 'rgba(221, 34, 34, 0.785)',
      },
      position: 'top-right',
    });
  };

  const handleLike = async ():Promise <void> => {
    try {
      await axios.post('/post/like', { userId, postId: postObj.id });
      await axios.put('/post/updateCount', {
        column: 'likeCount',
        type: 'increment',
        id: postId,
      });
      await updatePost(postId, userId);
      notifyLike();
    } catch (error) {
      console.error('client could not like', error);
    }
  };
  const handleUnlike = async ():Promise <void> => {
    try {
      // const likeObj = postObj.Likes.filter((likeObj) => likeObj.userId === userId);
      await axios.delete(`/post/unlike/${postId}/${userId}`);
      await axios.put('/post/updateCount', {
        column: 'likeCount',
        type: 'decrement',
        id: postId,
      });
      await updatePost(postId, userId);
      notifyUnlike();
    } catch (error) {
      console.error('client could not unlike', error);
    }
  };
  const isFollowing = async ():Promise <void> => {
    try {
      const findFollowing = await axios.get(
        `/post/isFollowing/${userId}/${postObj.user.id}`,
      );
      if (findFollowing.status === 200) {
        setFollowing(true);
      }
    } catch (error: any) {
      if (error.response.status === 404) {
        setFollowing(false);
      }
      console.error('following error', error);
    }
  };
  const startFollowing = async ():Promise <void> => {
    try {
      const createFollowing = await axios.post('/post/startFollowing', {
        userId,
        followingId: postObj.user.id,
      });
      if (createFollowing.data === 'Created') {
        setFollowing(true);
        notifyFollow();
      }
    } catch (error) {
      console.error('could not follow user', error);
    }
  };
  const stopFollowing = async ():Promise <void> => {
    try {
      const createFollowing = await axios.delete(
        `/post/stopFollowing/${userId}/${postObj.user.id}`,
      );
      if (createFollowing.data === 'Created') {
        setFollowing(false);
        notifyUnfollow();
      }
    } catch (error) {
      console.error('could not follow user', error);
    }
  };
  const createSoundWaves = ():void => {
    let regions: RegionsPlugin;
    let hover: HoverPlugin;
    //if there is a wavesurfer already, destroy it
    if (wave) {
      wave.destroy();
    }
    //create the new wave
    const wavesurfer = WaveSurfer.create({
      // barWidth: 15,
      // barRadius: 5,
      // barGap: 2,
      //autoplay: true,
      interact: true,
      container: `#${containerId}`,
      waveColor: 'rgb(166, 197, 255)',
      progressColor: 'rgb(60, 53, 86)',
      url: audioUrl,
      width: 'auto',
      height: waveHeight, //TODO: maybe change this back to auto
      normalize: true,

      renderFunction: (channels, ctx) => {
        const { width, height } = ctx.canvas;
        const scale = channels[0].length / width;
        const step = 10;

        ctx.translate(0, height / 2);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();

        for (let i = 0; i < width; i += step * 2) {
          const index = Math.floor(i * scale);
          const value = Math.abs(channels[0][index]);
          let x = i;
          let y = value * height;

          ctx.moveTo(x, 0);
          ctx.lineTo(x, y);
          ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true);
          ctx.lineTo(x + step, 0);

          x = x + step;
          y = -y;

          ctx.moveTo(x, 0);
          ctx.lineTo(x, y);
          ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false);
          ctx.lineTo(x + step, 0);
        }

        ctx.stroke();
        ctx.closePath();
      },
    });
    hover = wavesurfer.registerPlugin(HoverPlugin.create());

    regions = wavesurfer.registerPlugin(RegionsPlugin.create());

    // wavesurfer.on("click", () => {
    //   regions.addRegion({
    //     start: wavesurfer.getCurrentTime(),
    //     end: wavesurfer.getCurrentTime() + 0.25,
    //     drag: true,
    //     color: "hsla(250, 100%, 30%, 0.5)",
    //     id: "test",
    //   });
    // });
    // wavesurfer.on('scroll', (visibleStartTime, visibleEndTime) => {
    //   console.log('Scroll', visibleStartTime + 's', visibleEndTime + 's')
    // })
    wavesurfer.on('ready', (waveDuration) => {
      if (waveDuration > 60) {
        const seconds = Math.floor(waveDuration % 60);
        const minutes = Math.floor(waveDuration / 60);
        setDuration(`${minutes}:${seconds}`);
      } else {
        const seconds = Math.ceil(waveDuration);
        if (seconds < 10) {
          setDuration(`00:0${seconds}`);
        } else {
          setDuration(`00:${seconds}`);
        }
      }

    });
    wavesurfer.on('finish', async () => {
      setIsPlaying(false);
      try {
        const addListen = await axios.post('/post/listen', { userId, postId });
        const updateListenCount = await axios.put('/post/updateCount', {
          column: 'listenCount',
          type: 'increment',
          id: postId,
        });
        await updatePost(postId, userId);
      } catch (error) {
        console.error('on audio finish error', error);
      }
    });

    setWave(wavesurfer);

  };

  useEffect(() => {
    createSoundWaves();
    isFollowing();
  }, [audioUrl]);
  return (
    <div
      className="container"
      id="feed-container"
      style={{ width: onUserProfile || onProfile ? '315px' : '100%', height: '100%', marginTop: '1rem', marginBottom: '1rem' }}
    >


      <div className="row" id="feed-row">
        <div className="col-sm" id="feed-col-sm">
          <div className="card" id="feed-card" style={{ marginBottom: '1rem' }}>
            {/* <br/> */}
            <div className="card-body" style={{ height: onConch ? '400px' : '100%' }}>
              {onProfile ? (
                <a></a>
              ) : (
                <div
                  className="d-flex flex-row align-items-center justify-content-start"
                  id="header"
                  style={{
                    padding: '10px',
                  }}
                >
                  <img
                    src={postObj.user.profileImgUrl}
                    className="rounded-circle"
                    style={{
                      width: onConch ? '35px' : '70px',
                      height: onConch ? '35px' : '70px',
                      margin: onConch ? '10px' : '20px',
                      objectFit: 'fill',
                      borderStyle: 'solid',
                      borderWidth: 'medium',
                      borderColor: '#3c3556',
                    }}
                  />
                  <a
                    href={onConch ? `feed/profile/${postObj.user.id}` : `profile/${postObj.user.id}`}
                    style={{ fontSize: onConch ? '1.5rem' : '2rem', color: '#0f0c0c', fontFamily: 'headerFont', textDecoration: 'none' }}
                    id="feed-username"
                  >
                    {postObj.user.displayUsername || postObj.user.username}
                  </a>
                  {feed === 'explore' ? (
                    following ? (
                      <button
                        className="p-2 btn btn-danger"
                        style={{ marginLeft: 'auto', marginRight: '2%', background: '#7c3030', border: 'none' }}
                        onClick={() => stopFollowing()}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        className="p-2 btn btn-primary"
                        style={{ marginLeft: 'auto', marginRight: '2%', background: 'rgb(54, 89, 169)', border: 'none' }}
                        onClick={() => startFollowing()}
                      >
                        Follow
                      </button>
                    )
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
              <div hidden={!onProfile} style={{
                display: 'flex',
                flexDirection: 'column',
                paddingTop: '1rem',
                paddingLeft: '1rem',
                justifyContent: 'start',
                alignContent: 'end',
              }}
              onClick= {() => handleBigPost(postObj) }
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'start',
                    alignItems: 'center',
                    //flexWrap: 'wrap',
                    marginTop: '-2rem',
                    marginLeft: '-1rem',
                    marginBottom: '.5rem',
                  }}
                >
                  <TooltipComponent tooltip={postObj.title} id={`${postObj.id}`}>
                    <div
                      style={{
                        fontSize: onUserProfile || onProfile ? '1.5rem' : '4rem',
                        color: '#e1e1e5',
                        marginTop: '.5rem',
                        width: '190px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                    >

                      {postObj.title}
                    </div>
                  </TooltipComponent>
                  <div
                    style={{
                      marginTop: '.5rem',
                      marginLeft: 'auto',
                      fontSize: '.5rem',
                      color: '#e1e1e5',
                    }}
                  >
                    {dayjs(postObj.createdAt).fromNow()}
                  </div>
                </div>
                <div
                  className='on-profile-tags'
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: '-1rem',
                    flexWrap: 'wrap',
                    overflow: 'scroll',
                    height: '2.5rem',
                    justifyContent: 'start',
                    marginLeft: '-1.5rem',
                    //width:'15rem'
                  }}
                >
                  {postObj.categories ? (
                    postObj.categories.map((cat, index) => (
                      <button
                        className="btn btn-link"
                        style={{
                          color: '#e1e1e5',
                          textDecoration: 'none',
                          margin: '-.5rem',
                          // overflow:'hidden',
                          // whiteSpace:'nowrap',
                          // textOverflow: 'ellipsis',
                          //width:'5rem'
                        }}
                        onClick={() => getPosts('explore', cat)}
                        key={(index + 1).toString()}
                      >{`#${cat}`}</button>
                    ))
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
              <div
                className="wavesurfer-container"
                style={{
                  marginTop: onProfile ? '0px' : '1rem',
                  height: waveHeight,
                  borderRadius: '6px',
                  position: 'relative',
                }}
              >
                <div id={containerId}></div>
                <div
                  className="overlay-container"
                  style={{
                    position: 'absolute',
                    zIndex: '999',
                    top: '0px',
                    left: '0px',
                    right: '0px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2rem',
                    justifyContent: 'start',
                    width: '100%',
                    height: waveHeight,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'start',
                      alignItems: 'start',
                      flexWrap: 'wrap',
                      marginTop: '-2rem',
                      marginLeft: '-1rem',

                    }}
                    hidden={onProfile}
                  >
                    <div
                      style={{
                        fontSize: onConch ? '2.5rem' : '4rem',
                        color: '#e1e1e5',
                      }}
                    >
                      {postObj.title}
                    </div>
                    <div
                      style={{
                        marginTop: '1.5rem',
                        marginLeft: 'auto',
                        fontSize: onConch ? '1rem' : 'large',
                        color: '#e1e1e5',
                      }}
                    >
                      {dayjs(postObj.createdAt).fromNow()}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      textOverflow: 'ellipsis',
                      marginTop: '-1rem',
                      flexWrap: 'wrap',
                      justifyContent: 'start',
                      marginLeft: '-1.5rem',
                    }}
                    hidden={onProfile}
                  >
                    {postObj.categories ? (
                      postObj.categories.map((cat, index) => (
                        <button
                          className="btn btn-link"
                          style={{
                            color: '#e1e1e5',
                            textDecoration: 'none',
                          }}
                          onClick={() => getPosts('explore', cat)}
                          key={(index + 1).toString()}
                        >{`#${cat}`}</button>
                      ))
                    ) : (
                      <div></div>
                    )}
                  </div>
                  {isPlaying ? (
                    isPaused ?
                      <button
                        type="button"
                        style={{
                          marginTop: onConch ? '10%' : '10%',
                          //marginBottom: onConch ? '5%' : '',
                          alignSelf: 'center',
                        }}
                        className="simple-btn"
                        id="play-btn hover"
                        onClick={() => {
                          if (wave) {
                            wave.playPause();
                            
                            setIsPaused(() => !isPaused);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg"
                          width={onUserProfile || onProfile || onConch ? '5rem' : '10rem'} height={onUserProfile || onProfile || onConch ? '5rem' : '10rem'}
                          fill="#e9ecf343"
                          className="bi bi-pause"
                          viewBox="0 0 16 16"
                        >
                          <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
                        </svg>
                      </button>
                      : <TooltipComponent id={`stop-${postObj.id}`} tooltip='Click to Pause'> <button

                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '10rem',
                          margin: onProfile || onUserProfile || onConch ? 'auto' : 'auto 16rem',
                        }}
                        onClick={() => {
                          if (wave) {
                            wave.playPause();
                            setIsPaused(() => !isPaused);
                          }
                        }}></button> </TooltipComponent>
                  ) : (
                    <button
                      type="button"
                      className="simple-btn"
                      id='hover'
                      style={{
                        marginTop: onConch ? '10%' : '10%',
                        alignSelf: 'center',
                      }}
                      onClick={() => {
                        if (wave) {
                          wave.playPause();
                          setIsPlaying(() => !isPlaying);
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={onUserProfile || onProfile || onConch ? '5rem' : '10rem'} height={onUserProfile || onProfile || onConch ? '5rem' : '10rem'}
                        fill="#e9ecf343"
                        className="bi bi-play-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div
                className="d-flex flex-row align-items-center justify-content-start"
                style={{ marginTop: '.5rem' }}
                >
                    <div style={{ color: '#e1e1e5' }}>
                {onConch ? <div></div> : (postObj.isLiked ?
                  (postObj.likeCount > 2
                    ? `Liked by you and ${postObj.likeCount - 1} listeners` 
                    : postObj.likeCount === 2 ? 'Liked by you and 1 listener' 
                      : 'Liked by you')
                  : (postObj.likeCount > 1
                    ? `Liked by ${postObj.likeCount} listeners` 
                    : postObj.likeCount === 1 ? 'Liked by 1 listener' 
                      : <div></div>))}
                </div>
                  <div style={{ color: '#e1e1e5', marginLeft: 'auto' }}>{duration ? duration : ''}</div>
                </div>
              </div>
              {onHome || isConch ? <div></div> : (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'center', marginTop: onConch ? '10px' : 'none', marginBottom: '8px', 
              }}>
              {postObj.isLiked ? (
                <div>
                  {' '}
                  <TooltipComponent tooltip='Unlike' id={`unlike-${postObj.id}`}>
                    <MdOutlineFavorite
                    id='hover'
                      type="button"
                      //className="btn"
                      onClick={() => handleUnlike()}
                      style={{
                        // backgroundColor: 'rgba(233, 236, 243, 0.00)',
                        // borderColor: 'rgba(233, 236, 243, 0.00)',
                        height: '3rem',
                        width: '3rem',
                        marginRight: '1rem',
                        marginLeft: '1rem',
                        color: '#e1e1e5',
                      }}
                    >
                    </MdOutlineFavorite>
                  </TooltipComponent>
                  {/* {postObj.likeCount ? <p style={{marginLeft: '3%', fontSize:'x-large'}}>{`${postObj.likeCount} likes`}</p> : <p></p>}  */}
                </div>
              ) : (
                <div>
                  <TooltipComponent tooltip='Like' id={`like-${postObj.id}`}>
                    <MdOutlineFavoriteBorder
                    id='hover'
                      type="button"
                      data-toggle="tooltip" data-placement="top"
                      title='Like'
                      //className="btn btn-light"
                      onClick={() => handleLike()}
                      style={{
                        //backgroundColor: 'rgba(233, 236, 243, 0.00)',
                        //borderColor: 'rgba(233, 236, 243, 0.00)',
                        height: '3rem',
                        width: '3rem',
                        marginLeft: '1rem',
                        marginRight: '1rem',
                        color: '#e1e1e5',
                      }}
                    >
                    </MdOutlineFavoriteBorder>
                  </TooltipComponent>
                  {/* {postObj.likeCount ? <p style={{marginLeft: '3%', fontSize:'x-large'}}>{`${postObj.likeCount} likes`}</p> : <p></p>} */}
                </div>
              )}
              <TooltipComponent tooltip='Add a Comment' id={`comment-${postObj.id}`}>

                <MdOutlineAddComment
                id='hover'
                  type='button'
                  onClick={() => { setAddComment(() => !addComment); }}
                  style={{
                    //backgroundColor: 'rgba(233, 236, 243, 0.00)',
                    //borderColor: 'rgba(233, 236, 243, 0.00)',
                    color: '#e1e1e5',
                    height: '3rem',
                    width: '3rem',
                    marginRight: '1rem',
                  }}
                >
                </MdOutlineAddComment>
              </TooltipComponent>
              <TooltipComponent tooltip='Share' id={`share-${postObj.id}`}>
                <MdArrowOutward
                id='hover'
                  onClick={() => { setShowShareModal(true); }}
                  style={{
                    //backgroundColor: 'rgba(233, 236, 243, 0.00)',
                    //borderColor: 'rgba(233, 236, 243, 0.00)',
                    color: '#e1e1e5',
                    height: '3rem',
                    width: '3rem',
                    marginRight: '1rem',
                  }}></MdArrowOutward>
              </TooltipComponent>
              {onUserProfile ? (
                <MdDeleteOutline
                  type="button"
                  id='hover'
                  onClick={() => setDeleting(true)}
                  style={{
                    color: '#e1e1e5',
                    height: '3rem',
                    width: '3rem',
                    marginRight: '1rem',
                  }}></MdDeleteOutline>
              ) : (
                <div></div>
              )}
            </div>)}
            {/* {onUserProfile ? (
                <a></a>
              ) : ( */}
            <div>
              <Post
                setSelectedUserPosts={setSelectedUserPosts}
                key={postId}
                postObj={postObj}
                updatePost={updatePost}
                userId={userId}
                audioContext={audioContext}
                addComment={addComment}
                setAddComment={setAddComment}
                deleting={deleting}
                setDeleting={setDeleting}
                onProfile={onProfile}
                onUserProfile={onUserProfile}
                waveHeight={waveHeight}
                onConch={onConch}
              />
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} aria-labelledby="contained-modal-title-vcenter"
        centered>
        <SharePost
          postObj={postObj}
          userId={userId}
          setShowShareModal={setShowShareModal}
          showShareModal={showShareModal}
          audioContext={audioContext}
        ></SharePost>
      </Modal>
    </div>
  );
};

export default WaveSurferComponent;

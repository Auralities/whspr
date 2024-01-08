import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import WaveSurferSimple from "./WaveSurferSimple";

const Comment = (props) => {
  const { comment, audioContext } = props;
  return (
    <div className="d-flex flex-column" style={{margin:'1rem'}}>
      <div className="d-flex flex-row justify-content-between align-items-center"  >
        <a href="#" className="card-link" style={{ fontSize: "x-large",  textDecoration: 'none',  color:'#e1e1e5', marginLeft:'1rem', marginRight:'1rem' }}>
          {comment.User.username}
        </a>
        <div style={{color:'#e1e1e5', marginLeft:'1rem', marginRight:'1rem' }}>{dayjs(comment.createdAt).fromNow()}</div>
      </div>
      <WaveSurferSimple
        postId={comment.id}
        audioUrl={comment.soundUrl}
        audioContext={audioContext}
      />
      {/* <audio controls>
          <source src={comment.soundUrl} type="audio/webm" />
        </audio> */}
    </div>
  );
};
export default Comment;

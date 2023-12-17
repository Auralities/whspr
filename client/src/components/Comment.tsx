import React from "react";
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const Comment = (props) => {
  const { comment } = props
return (
  <div className="card-body" >
        <a href="#" className="card-link">{comment.User.username}</a>
        <audio controls>
          <source src={comment.soundUrl} type="audio/webm" />
        </audio>
        <div>{dayjs(comment.createdAt).fromNow()}</div>
        
  </div>
)
}
export default Comment
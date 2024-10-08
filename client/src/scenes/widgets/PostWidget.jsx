import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  getPosts,
  socket,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [seeMore, setSeeMore] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const users = useSelector((state) => state.users);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    const userLikedId = Object.keys(updatedPost.likes)?.find(
      (id) => id === loggedInUserId
    );
    if (userLikedId) handleNotification(1);
    dispatch(setPost({ post: updatedPost }));
  };

  const AddComment = async () => {
    const response = await fetch(
      `http://localhost:3001/posts/${postId}/comment`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          commentText: commentValue,
        }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    handleNotification(2);
    setCommentValue("");
  };

  const handleCommentDelete = async (commentId) => {
    const response = await fetch(
      `http://localhost:3001/posts/${postId}/delete-comment`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loggedInUserId, commentId }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleDeletePost = async () => {
    const response = await fetch(
      `http://localhost:3001/posts/${postId}/delete-post`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loggedInUserId, postUserId }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    getPosts();
  };

  const handleNotification = (notiType) => {
    socket.emit("send-notification", {
      senderId: loggedInUserId,
      receiverId: postUserId,
      type: notiType,
    });
  };

  const handleOpenComment = () => {
    setIsComments(!isComments);
  };

  const handleSubmitComment = (event) => {
    if (event.key === "Enter") {
      AddComment();
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => handleOpenComment()}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <FlexBetween gap='0.3rem'>
          {loggedInUserId === postUserId ?
            <>
              <IconButton onClick={() => handleDeletePost()}>
                <DeleteRoundedIcon />
              </IconButton>
              <IconButton>
                <ShareOutlined />
              </IconButton>
            </>: 
            <IconButton>
              <ShareOutlined />
            </IconButton>
          }
        </FlexBetween>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <FlexBetween borderRadius="9px" gap="3rem" padding="0.1rem, 1.5rem">
            <InputBase
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              placeholder="Comment here..."
              onKeyDown={handleSubmitComment}
            />
            <IconButton disabled={!commentValue} onClick={AddComment}>
              <ArrowCircleUpOutlinedIcon />
            </IconButton>
          </FlexBetween>
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`}>
              <Divider />
              <FlexBetween>
                <Typography
                  sx={{
                    color: main,
                    m: "0.5rem 0",
                    pl: "1rem",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography color={medium}>
                    {users.find((user) => user._id === comment.userId)
                      ?.firstName +
                      "" +
                      users.find((user) => user._id === comment.userId)
                        ?.lastName}
                  </Typography>
                  <Typography color={main}>
                    {comment.commentText.length < 150 ? 
                      comment.commentText: 
                      <>
                        {seeMore
                          ? comment.commentText
                          : comment.commentText.slice(0, 100) + "..."}
                        <span
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={() => setSeeMore(!seeMore)}
                        >
                          {!seeMore ? ">See more" : "<See less"}{" "}
                        </span>
                      </>
                    }
                  </Typography>
                </Typography>
                {comment.userId === loggedInUserId ? 
                  <IconButton onClick={() => handleCommentDelete(comment._id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton> : ""}
              </FlexBetween>
            </Box>
          ))}
          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;

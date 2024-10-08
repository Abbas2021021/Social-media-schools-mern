import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setUsers } from "state";
import PostWidget from "./PostWidget";
import { config } from "../../config";

const SERVER_URL_ENDPOINT = `http://${config.host}:${config.port}`
const PostsWidget = ({ userId, socket, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const getUsers = async () => {
    const response = await fetch(SERVER_URL_ENDPOINT+"/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await response.json();
    dispatch(setUsers(users));
  };

  const getPosts = async () => {
    const response = await fetch(SERVER_URL_ENDPOINT+"/posts", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    dispatch(setPosts({ posts: data }));
  };

  const getUserPosts = async () => {
    const response = await fetch(
      `${SERVER_URL_ENDPOINT}/${userId}/posts`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setPosts({ posts: data }));
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
      getUsers();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {posts.map(
        ({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={userId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
            getPosts={getPosts}
            socket={socket}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;

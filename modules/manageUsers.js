//imagine that this is a list of users in the room (not sure about this one yet)
const users = [];

//join user to chat
const userJoinObject = (id, username, roomId) => {
  const user = { id, username, roomId };
  users.push(user);
  return user;
};

module.exports = userJoinObject;

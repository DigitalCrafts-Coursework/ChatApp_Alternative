//imagine that this is a list of users in the room (not sure about this one yet)
const users = [];

//join user to chat
const userJoinObject = (id, username, roomID) => {
  const user = { id, username, roomID };
  users.push(user);
  return user;
};

module.exports = userJoinObject;

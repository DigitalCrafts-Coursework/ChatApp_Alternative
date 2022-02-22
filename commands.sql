CREATE TABLE users (
    id serial primary key,
    username text not null CHECK (username <> ''),
    user_password text not null CHECK (user_password <> ''),
    email text not null CHECK (email <> ''),
    src text not null  
);

CREATE TABLE rooms (
        id int references users(id),
        room_id text not null 
);

CREATE TABLE messages (
    id int references users(id),
    message_content text not null CHECK (message_content <> ''),
    room_id text not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
    id serial primary key,
    username text not null CHECK (username <> ''),
    user_password text not null CHECK (user_password <> ''),
    email text not null CHECK (email <> ''),
    src text not null  
);

CREATE TABLE rooms (
        id int references users(id),
        room int not null 
);

CREATE TABLE messages (
    id int references users(id),
    message_content text not null CHECK (message_content <> ''),
    post_date timestamp not null
);
CREATE TABLE users (
    id serial primary key,
    username text not null CHECK (username <> ''),
    password text not null CHECK (password <> ''),
    email text not null CHECK (email <> '')   
);

CREATE TABLE rooms (
        id int references users(id),
        room int not null CHECK (room <> ''),
);

CREATE TABLE messages (
    id int references users(id),
    message text not null CHECK (message <> '')
    date timestamp not null CHECK (date <> '')
)
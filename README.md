# How to run
NodeJS needs to be installed, as well as ExpressJS as it is a dependency. Position yourself within the root directory inside a terminal and run `node server`.

# Architecture considerations
ExpressJS offers methods to quickly route HTTP requests; only GET and DELETE requests were used for this project.

# Priorities
Learning NodeJS and getting the API into a working state.

# Other info
In order to be able to store user information even in the case of a server restart, the server's file system is used. The server assumes I/O errors won't occur. A `mostSearched.json` file is created in the root directory and used as memory. For every failed request, such as requesting a non-existing user, an empty JSON file is served with the appropriate status code.

Although the API works, there are potential improvements:

* hide the logic for retrieving user information behind an interface and implement classes for retrieval, which would make it easier to perhaps add additional ways to load data other than through Github's API;
* similarly, do the same for storing info about users who have been searched so far, so it would be, e.g., easier to add database storage functionality;
* improve error handling;
* implement asynchronous methods where they make sense;
* implement more reliable way of pulling email data, since it seems Github's API is faulty;
* rewrite the whole thing in TypeScript;
* spread the code among more modules for better clarity;
* document the code;
* perhaps add user authentication?

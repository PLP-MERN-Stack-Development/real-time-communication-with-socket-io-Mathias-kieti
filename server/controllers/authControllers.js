// In-memory store for simplicity
let users = [];

// Handle user login
exports.loginUser = (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Check if user already exists
  let user = users.find(u => u.username === username);

  // If user doesn't exist, create a new one
  if (!user) {
    user = {
      id: Date.now().toString(),
      username,
      online: true,
    };
    users.push(user);
  } else {
    // Update online status
    user.online = true;
  }

  res.json({
    message: 'Login successful',
    user,
    users, // list of all users
  });
};

// Handle user logout
exports.logoutUser = (req, res) => {
  const { username } = req.body;
  users = users.map(u =>
    u.username === username ? { ...u, online: false } : u
  );
  res.json({ message: `${username} logged out`, users });
};

// Get list of online users
exports.getUsers = (req, res) => {
  res.json(users);
};

import app from './app.js';


const PORT = process.env.PORT || 5000;

app.use((req, res) => {
    res.send('Hello, GoRefurbish Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
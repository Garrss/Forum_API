export const HelloPlugin = (app) => {
  app.get('/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
  });
};

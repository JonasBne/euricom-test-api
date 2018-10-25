const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const sortOn = require('sort-on');
const bodyParser = require('body-parser');
const fs = require('fs');
const asyncify = require('express-asyncify');

const userRoutes = require('./api/express/routes/userRoutes');
const taskRoutes = require('./api/express/routes/taskRoutes');
const productRoutes = require('./api/express/routes/productRoutes');
const basketRoutes = require('./api/express/routes/basketRoutes');

const errorHandler = require('./api/express/middleware/errorHandler');

const { ApolloServer, UserInputError } = require('apollo-server-express');
const schema = require('./graphql/schema');
const showdown = require('showdown');

showdown.setFlavor('github');
const converter = new showdown.Converter({
  completeHTMLDocument: true,
});

// app setup
const app = asyncify(express());
app.use(morgan('dev'));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//
// REST Routes
//

app.get('/', async (req, res) => {
  const text = fs.readFileSync('./api.md', 'utf8');
  const html = converter.makeHtml(text);
  res.send(html);
});

app.delete('/api/system', async (req, res) => {
  generateSeedData();
  res.json({
    code: 200,
    message: 'All the data is resetted',
  });
});

app.use('/', userRoutes);
app.use('/', taskRoutes);
app.use('/', productRoutes);
app.use('/', basketRoutes);

// Error handler
app.use(errorHandler);

// fallback not found
app.all('/api/*', async (req, res) =>
  res.status(404).json({
    code: 'NotFound',
    message: 'Resource not found or method not supprted',
  }),
);

const graphQlServer = new ApolloServer({
  schema,
});
graphQlServer.applyMiddleware({
  app,
});

module.exports = {
  app,
  graphQlServer,
};

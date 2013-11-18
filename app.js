
/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



var articleProvider= new ArticleProvider('localhost', 27017);

app.get('/', function(req, res) {
		articleProvider.findAll( function(error, docs) {
				res.render('index.jade', {title: 'Blog', articles: docs});
		});
});

app.get('/blog/new', function(req, res) {
		res.render('blog_new.jade', {title: 'New Post'});
});

app.post('/blog/new', function(req, res){
		articleProvider.save({
				title: req.param('title'),
				body: req.param('body')
		}, function( error, docs) {
				res.redirect('/')
		});
});

app.post('/blog/addComment', function(req, res) {
		articleProvider.addCommentToArticle(req.param('_id'), {
				person: req.param('person'),
				comment: req.param('comment'),
				created_at: new Date()
				} , function( error, docs) {
						res.redirect('/blog/' + req.param('_id'))
				});
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

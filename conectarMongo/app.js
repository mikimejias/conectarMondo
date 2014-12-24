var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//añadiendo mongoose y su conexión con mongo db
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/desarrolloTareas');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});

//creando los documentos para la base de datos
var Schema = mongoose.Schema;
var Objectid = Schema.Objectid;

var TareaSchema = new Schema({
    nombre : String,
});

var Tarea = mongoose.model('Tarea', TareaSchema);
//fin de crear documentos

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//añadiendo la ruta de tareas
app.get('/tareas', function ( req, res){
    Tarea.find(function (err, docs ){
        res.render('tareas/index', { title: 'Vista index Lista Tareas', docs: docs});
        console.log(docs);
    });
});

//añadiendo la ruta crear nuevas tareas
app.get('/tareas/nueva', function (req, res){
    res.render('tareas/nueva.jade', {title: 'Nueva Tarea'});
});

//añadiendo el método post para que se guarden los datos del formulario
app.post('/tareas', function (req, res){
    var tarea = new Tarea ({nombre : req.body.tarea});

    tarea.save(function (err){
        if (!err){
            res.redirect('/tareas');
        }
        else {
            res.redirect('/tareas/nueva');
        }
    });
});

//método para editar una tarea
app.get('/tareas/:id/editar', function (req, res){
    Tarea.findById(req.params.id, function (err, doc){
        res.render('tareas/editar', {
            title: 'Vista Editar Tarea',
            tarea: doc
        });
    });
});

//método que actualiza la tarea en la base de datos
app.post('/tareas/:id', function (req, res){
    Tarea.findById(req.params.id, function (err, doc){

        if (err) return handleError(err);

        doc.nombre = req.body.tarea;
        doc.save(function (err){
            if(!err){
                res.redirect('/tareas');
            }else{
                return handleError(err);
            }
            
        });
    });
});

app.get('/tareas/:id', function (req, res){
    Tarea.findById(req.params.id, function (err, doc){
        if(!doc) return next(new NotFound('Document not found'));

        doc.remove(function(){
            res.redirect('/tareas');
        });
    });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

'use strict';

const express = require('express');
const morgan = require('morgan');

const { top50 } = require('./data/top50');
const popular = top50.map(song => {
    if (song.artist === 'Justin Bieber') return song;
}).filter(song => song !== undefined);

const { books } = require('./data/books');
const nonfic = books.map(book => {
    if (book.type === 'non-fiction') return book;
}).filter(book => book !== undefined);
const fic = books.map(book => {
    if (book.type === 'fiction') return book;
}).filter(book => book !== undefined);
const drama = books.map(book => {
    if (book.type === 'drama') return book;
}).filter(book => book !== undefined);

const PORT = process.env.PORT || 8000;

const app = express();

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

// endpoints here
app.get('/', (req, res) => {
    res.render('pages/homepage');
});

app.get('/top50', (req, res) => {
    res.render('pages/top50', { title: 'Top 50 Songs Streamed on Spotify', top50 });
});

app.get('/top50/popular-artist', (req, res) => {
    res.render('pages/popular', { title: 'Most Popular Artist', top50: [...popular] });
});

app.get('/top50/song/:num', (req, res) => {
    if (req.params.num < 1 || req.params.num > 50) {
        res.status(404);
        res.render('pages/fourOhFour', {
        title: 'I got nothing',
        path: req.originalUrl
    });
    }
    let song = top50[req.params.num-1];
    let prev = song.rank-1;
    let next = song.rank+1;
    if (prev === 0) prev = 50;
    if (next === 51) next = 1;
    res.render('pages/single', { title: `Song #${song.rank}`, song, prev, next });
});

app.get('/books', (req, res) => {
    res.render('pages/books', { title: 'Must Read Books', books });
});

app.get('/books/:id', (req, res) => {
    if (req.params.id < 101 || req.params.id > 125) {
        res.status(404);
        res.render('pages/fourOhFour', {
        title: 'I got nothing',
        path: req.originalUrl
        });
    }
    if (req.params.id === 'non-fiction') {
        res.render('pages/non-fiction', { title: `non-fiction`, books: nonfic });
    }   
    if (req.params.id === 'fiction') {
        res.render('pages/fiction', { title: `fiction`, books: fic });
    }  
    if (req.params.id === 'drama') {
        res.render('pages/drama', { title: `drama`, books: drama });
    }   

    let book = books.map(book => {
        if (book.id == req.params.id) return book;
    }).filter(book => book !== undefined);
    book = book[0];
    res.render('pages/bookpage', { title: `Book id: ${book.id}`, book });
});

// handle 404s
app.get('*', (req, res) => {
    res.status(404);
    res.render('pages/fourOhFour', {
        title: 'I got nothing',
        path: req.originalUrl
    });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

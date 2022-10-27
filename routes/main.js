module.exports = (app, shopData) => {
    // Handle our routes
    const bcrypt = require('bcrypt');
    // home page
    app.get('/', (req, res) => res.render('index.ejs', shopData));

    // about page
    app.get('/about', (req, res) => res.render('about.ejs', shopData));

    //search page
    app.get('/search', (req, res) => res.render("search.ejs", shopData));

    // search result page
    app.get('/search-result', (req, res) => {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { availableBooks: result });
            console.log(newData)
            res.render("list.ejs", newData)
        });
    });
    // register page
    app.get('/register', (req, res) => res.render('register.ejs', shopData));

    // registered
    app.post('/registered', (req, res) => {
        // saving data in database
        const saltRounds = 10;
        const plainPassword = req.body.password;
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            if (err) {
                return err.stack;
            }
            // Store hashed password in your database
            let sqlquery = 'INSERT INTO users (first, last, username, email, password) VALUES( ?, ?, ?, ?, ?)';
            let newUser = [req.body.first, req.body.last, req.body.username, req.body.email, hashedPassword];
            db.query(sqlquery, newUser, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            result = 'Hello ' + req.body.first + ' ' + req.body.last + ' you are now registered! We will send an email to you at ' + req.body.email;
            result += ' Your password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
            res.send(result);
        });
    });

    // login page
    app.get('/login', (req, res) => { res.render('login.ejs', shopData) });

    app.post('/loggedin', (req, res) => {
        let sqlquery = "SELECT username, password FROM users WHERE username = ? ";
        db.query(sqlquery, req.body.username, (err, result) => {
            let user = result[0];
            console.log(user);
            if (err) {
                console.log(err.message);
                res.send("Username:" + req.body.username + "doesn't exist");
            }
            else {
                res.send("Username " + req.body.username + " exists");
                // Compare the password supplied with the password in the database
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (err) {
                        console.error(err.message);
                        res.send("Incorrect Password")
                    }
                    else if (result) {
                        res.send(req.body.username + " has logged in successfully")
                    }
                    else {
                        res.send("Smething went wrong")
                    }
                });
            }
        });
    });

    app.get('/list', (req, res) => {
        // execute sql query
        db.query("SELECT * FROM books", (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { availableBooks: result });
            console.log(newData)
            res.render("list.ejs", newData)
        });
    });

    // list users page
    app.get('/listusers', (req, res) => {
        db.query("SELECT first, last, username, email FROM users", (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { users: result });
            console.log(newData)
            res.render("listusers.ejs", newData)
        });
    });

    app.get('/addbook', (req, res) => {
        res.render('addbook.ejs', shopData);
    });

    app.post('/bookadded', (req, res) => {
        // saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        // execute sql query
        let newrecord = [req.body.name, req.body.price];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else {
                let button = document.createElement("button");
                button.value("Add another book");
                document.body.appendChild(button);
                button.onclick(button.redirect('/addbook'));
                res.send(' This book is added to database, name: ' + req.body.name + ' price ' + req.body.price);
            }
        });
    });

    app.get('/bargainbooks', (req, res) => {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { availableBooks: result });
            console.log(newData)
            res.render("bargains.ejs", newData)
        });
    });
}
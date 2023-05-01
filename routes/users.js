
const { query, validationResult, check, Result } = require('express-validator');

let NeDB = require('nedb');

let db = new NeDB({
    filename: 'users.db',
    autoload: true
});

module.exports = app => {

    let route = app.route('/users');

    route.get((req, res) => {

        db.find({}).sort({ name: 1 }).exec((err, users) => {

            if (err) {
                app.utils.error.send(err, req, res);
            } else {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json({
                    users
                });
            }
        })

    });

    route.post([check('email', 'o email está inválido').isEmail(), check('name', 'nome é obrigatorio').notEmpty()], (req, res) => {

        let errors = validationResult(req).formatWith( ({ msg }) => msg);

        if (errors) {
            app.utils.error.send(errors, req, res);
            return false;
        }

        db.insert(req.body, (err, user) => {

            if (err) {
                app.utils.error.send(errors, req, res);
            } else {
                res.status(200).json(user);
            }
        });
    });

    let routerId = app.route('/users/:id');

    routerId.get((req, res) => {

        db.findOne({ _id: req.params.id }).exec((err, user) => {
            if (err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(user);
            }
        });
    });

    routerId.put((req, res) => {

        db.update({ _id: req.params.id }, req.body, err => {
            if (err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(Object.assign(req.params, req.body));
            }
        });
    });

    routerId.delete((req, res) => {

        db.remove({ _id: req.params.id }, {}, err => {
            if (err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(req.params);
            }
        });
    });

}
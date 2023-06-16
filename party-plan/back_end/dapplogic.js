import mysql from 'mysql2';

export default class DAppObject {

    constructor() {
        this.connection =  mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '*********',
            database: 'partyPlan'
        });
        this.connection.connect();

        //bind all the functions "this" to the class. Without doing the bind, the "this" reference
        //inside the function will refer to the function rather then the class that contains the function.
        this.doGetAllActive = this.doGetAllActive.bind(this);
        this.doSearchPartiesUsers = this.doSearchPartiesUsers.bind(this);
        this.doLogin = this.doLogin.bind(this);
        this.doGetRSVPs = this.doGetRSVPs.bind(this);
        this.doGetUserParties = this.doGetUserParties.bind(this);
        this.doDeleteParty = this.doDeleteParty.bind(this);
        this.doCreateParty = this.doCreateParty.bind(this);
        this.doGetPartyID = this.doGetPartyID.bind(this);
        this.doUpdateCapacity = this.doUpdateCapacity.bind(this);
        this.doUpdateTags = this.doUpdateTags.bind(this);
        this.doCheckExpiring = this.doCheckExpiring.bind(this);
    }

    //route '/getAllActive/:limit/:tags'
    doGetAllActive(req, res) {
        var limit = req.params["limit"];
        var tags = req.params["tags"];
        let query =
        `SELECT partyID, userID, latitude, longitude, tags, capacity, start_time, end_time, safety, fun, first, last ` +
        `FROM ActiveParty NATURAL JOIN ` +
            `(SELECT u.userID, AVG(safety) as safety, AVG(fun) as fun ` +
            `FROM User u JOIN Rating r ON (u.userID = r.userID) ` +
            `GROUP BY u.userID) as temp JOIN User USING(userID)` +
        `WHERE JSON_CONTAINS(tags, ${JSON.stringify(tags)}) ` +
        `ORDER BY end_time ASC ` +
        `LIMIT ${limit}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.send(results);
        });
    }

    //route '/searchPartiesUsers/:limit/:search'
    doSearchPartiesUsers(req, res) {
        var limit = req.params["limit"];
        var search = req.params["search"];
        console.log(search);
        let query =
        `SELECT partyID, userID, latitude, longitude, tags, capacity, start_time, end_time, safety, fun, first, last ` +
        `FROM ActiveParty NATURAL JOIN ` +
        `(SELECT u.userID, AVG(safety) as safety, AVG(fun) as fun ` +
        `FROM User u JOIN Rating r ON (u.userID = r.userID) ` +
        `GROUP BY u.userID) as temp JOIN User USING(userID) ` +
        `WHERE TAGS LIKE "%${search}%" OR first LIKE "%${search}%" OR last LIKE "%${search}%" ` +
        `ORDER BY end_time ASC ` +
        `LIMIT ${limit}`;

        console.log(query);

        this.connection.query(query, (error, results) => {
            console.log(error, results);
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.send(results);
        });
    }

    //route '/login/:userID'
    doLogin(req, res) {
        var userID = req.params["userID"];
        let query =
        `SELECT * ` + 
        `FROM User ` + 
        `WHERE userID = ${userID}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.send(results);
        });
    }

    //route '/getRSVPs/:userID'
    doGetRSVPs(req, res) {
        var userID = req.params["userID"];
        let query =
        `SELECT * ` + 
        `FROM RSVP ` + 
        `WHERE userID = ${userID}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.send(results);
        });
    }

    //route '/getUserParties/:userID'
    doGetUserParties(req, res) {
        var userID = req.params["userID"];
        let query =
        `SELECT * ` + 
        `FROM ActiveParty ` + 
        `WHERE userID = ${userID}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.send(results);
        });
    }

    //route '/deleteParty'
    doDeleteParty(req, res) {
        var partyID = req.body["partyID"];
        let query =
        `DELETE FROM ActiveParty ` + 
        `WHERE partyID = ${partyID}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.status(200).send(`Successfully deleted party ${partyID}`);
        });
    }

    //route '/createParty'
    doCreateParty(req, res) {
        var partyArr = [req.body];
        let query =
        `INSERT INTO ActiveParty ` + 
        `VALUES ?`;
        this.connection.query(query, [partyArr], (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.status(200).send(`Successfully inserted party`);
        });
    }

    //route '/getPartyID'
    doGetPartyID(req, res) {
        let query =
        `SELECT partyID ` +
        `FROM ActiveParty ` +
        `UNION ` + 
        `SELECT partyID ` + 
        `FROM ArchiveParty`;
        this.connection.query(query, (error, results) => {
            let resultArr = [];
            results.map(result => {
                resultArr.push(result.partyID);
            })
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.send(resultArr);
        });
    }

    //route '/updateCapacity'
    doUpdateCapacity(req, res) {
        var partyID = req.body["partyID"];
        var capacity = req.body["capacity"];
        let query =
        `UPDATE ActiveParty ` +
        `SET capacity = ${capacity} ` +
        `WHERE partyID = ${partyID}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.status(200).send(`Successfully updated party ${partyID}`);
        });
    }

    //route '/updateTags'
    doUpdateTags(req, res) {
        var partyID = req.body["partyID"];
        var tags = req.body["tags"];
        let query =
        `UPDATE ActiveParty ` +
        `SET tags = '${tags}' ` +
        `WHERE partyID = ${partyID}`;
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.status(200).send(`Successfully updated party ${partyID}`);
        });
    }

    //route '/checkExpiring'
    doCheckExpiring(req, res) {
        let query = 'CALL check_expiring();';
        this.connection.query(query, (error, results) => {
            if(error)
                res.status(400).send('Error in database operation');
            else
                res.status(200).send('Successfully checked expiring');
        });
    }

}

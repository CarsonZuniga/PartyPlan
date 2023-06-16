var lodash = require('lodash');
var mysql2 = require('mysql2');

const random_choice = (arr, amount=1) => {return lodash.sampleSize(arr, amount)}

const random_num = (digits) => {return Math.floor(10**(digits-1) + Math.random() * 9 * 10**(digits-1));} // random DIGITS digit integer (non-zero first digit)

const dateTime = (date) => {return date.toISOString().slice(0, 19).replace('T', ' ');}

const TAGS = ["Open House", "BYOB", "Costume", "Chill", "Greek", "RSO"];

const PASSWORD = "*******"

function randomDate(start, end, startHour, endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
}

async function create_users(NUM_USERS) {
    const mysql = require('mysql2/promise');

    // create the connection
    const connection = await mysql.createConnection({host:'localhost', user: 'root', password: PASSWORD, database: 'partyPlan'});

    // query database
    const [rows, fields] = await connection.query('SELECT userID FROM User');
    // get existing user ids, so there are no duplicates
    var existing_user_ids = [];
    rows.forEach(row => {
        existing_user_ids.push(row.userID);
    });

    // https://github.com/dominictarr/random-name
    // npm package for generating random first/last name and place
    var random_name = require('random-name');

    var created_user_ids = [];
    
    const getRandomUser = () => {
        const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "illinois.edu", "hotmail.com", "aol.com", "msn.com", "comcast.net"];

        const getRandomEmail = (first, last) => {
            // <first>_<last><random number 0-99>@<random domain>
            return `${first.toLowerCase()}_${last.toLowerCase()}${Math.floor(Math.random() * 100)}@${random_choice(DOMAINS)}`;
        }

        while(true) {
            var new_user_id = random_num(digits=6);
            if (!existing_user_ids.includes(new_user_id) && !created_user_ids.includes(new_user_id))
                break;
        }
        created_user_ids.push(new_user_id);
        let first = random_name.first();
        let last = random_name.last();
        let number = random_num(digits=10);
        let email = getRandomEmail(first, last);

        // INT, STRING, STRING, INT, STRING
        return [new_user_id, first, last, email, number];
    }

    var new_users = Array.from({length: NUM_USERS}, () => getRandomUser());

    connection.query('INSERT INTO User VALUES ?', [new_users]);
    connection.end();
    console.log(`Randomly generated ${NUM_USERS} random users.`);
}

async function create_parties(NUM_PARTIES, TARGET_DB, latLng, range) {
    const mysql = require('mysql2/promise');

    // create the connection
    const connection = await mysql.createConnection({host:'localhost', user: 'root', password: PASSWORD, database: 'partyPlan'});

    // choose random users
    var [rows, fields] = await connection.query(`SELECT userID FROM User`);
    var chosen_user_ids = [];
    rows.forEach(row => {
        chosen_user_ids.push(row.userID);
    });

    // get existing party IDs
    [rows, fields] = await connection.query('SELECT partyID FROM ActiveParty UNION SELECT partyID FROM ArchiveParty');
    var existing_party_ids = [];
    rows.forEach(row => {
        existing_party_ids.push(row.partyID);
    });

    var created_party_ids = [];

    const getRandomParty = () => {
        const getNumInRange = (min, max) => {return Math.random() * (max - min) + min};

        while(true) {
            var new_party_id = random_num(digits=6);
            if (!existing_party_ids.includes(new_party_id) && !created_party_ids.includes(new_party_id))
                break;
        }
        created_party_ids.push(new_party_id);
        let userID = random_choice(chosen_user_ids);
        let latitude = getNumInRange(latLng[0] - range, latLng[0] + range);
        let longitude = getNumInRange(latLng[1] - range, latLng[1] + range);
        let tags = random_choice(TAGS, getNumInRange(0, TAGS.length));
        let capacity = getNumInRange(0, 200);
        let start_date = randomDate(new Date(), new Date('2022', '12', '07'), 0, 24);
        let end_date = randomDate(start_date, new Date('2022', '12', '08'), 0, 24);

        // NOTE: to array insert into db, you need to convert to JSON

        // INT, INT, REAL, REAL, JSON, INT, DATETIME, DATETIME
        return [new_party_id, userID, latitude, longitude, JSON.stringify(tags), capacity, dateTime(start_date), dateTime(end_date)];
    }

    var new_parties = Array.from({length: NUM_PARTIES}, () => getRandomParty());
    
    connection.query(`INSERT INTO ${TARGET_DB} VALUES ?`, [new_parties]);
    connection.end();
    console.log(`Randomly generated ${NUM_PARTIES} random parties.`);
}

async function create_ratings(NUM_RATINGS) {
    const mysql = require('mysql2/promise');

    // create the connection
    const connection = await mysql.createConnection({host:'localhost', user: 'root', password: PASSWORD, database: 'partyPlan'});

    // query database
    var [rows, fields] = await connection.query('SELECT userID FROM User');
    // get existing user ids, so there are no duplicates
    var existing_user_ids = [];
    rows.forEach(row => {
        existing_user_ids.push(row.userID);
    });

    [rows, fields] = await connection.query('SELECT ratingID FROM Rating');
    var existing_rating_ids = [];
    rows.forEach(row => {
        existing_rating_ids.push(row.ratingID);
    });

    var created_rating_ids = [];

    const getRandomRatings = () => {
        const getNumInRange = (min, max) => {return Math.random() * (max - min) + min};

        while(true) {
            var new_rating_id = random_num(digits=6);
            if (!existing_rating_ids.includes(new_rating_id) && !created_rating_ids.includes(new_rating_id))
                break;
        }
        created_rating_ids.push(new_rating_id);

        let userID = random_choice(existing_user_ids);

        let fun = getNumInRange(1,5);

        let safety = getNumInRange(1,5);

        return [new_rating_id, safety, fun, userID];
    }

    var new_ratings = Array.from({length: NUM_RATINGS}, () => getRandomRatings());
    
    connection.query(`INSERT INTO Rating VALUES ?`, [new_ratings]);
    connection.end();
    console.log(`Randomly generated ${NUM_RATINGS} random Ratings.`);


}

async function create_rsvp(NUM_RSVP, NUM_PARTIES) {
    const mysql = require('mysql2/promise');

    // create the connection
    const connection = await mysql.createConnection({host:'localhost', user: 'root', password: PASSWORD, database: 'partyPlan'});

    // choose random users
    var [rows, fields] = await connection.query(`SELECT userID FROM User`);
    var existing_user_ids = [];
    rows.forEach(row => {
        existing_user_ids.push(row.userID);
    });

    // get existing party IDs
    [rows, fields] = await connection.query(`SELECT partyID FROM ActiveParty LIMIT ${NUM_PARTIES}`);
    var existing_party_ids = [];
    rows.forEach(row => {
        existing_party_ids.push(row.partyID);
    });

    // get existing rsvp IDs
    [rows, fields] = await connection.query('SELECT RSVPid FROM RSVP');
    var existing_rsvp_ids = [];
    rows.forEach(row => {
        existing_rsvp_ids.push(row.partyID);
    });

    var created_rsvp_ids = [];

    const getRandomRSVP = () => {
        while(true) {
            var new_rsvp_id = random_num(digits=6);
            if (!existing_rsvp_ids.includes(new_rsvp_id) && !created_rsvp_ids.includes(new_rsvp_id))
                break;
        }
        created_rsvp_ids.push(new_rsvp_id);
        let userID = random_choice(existing_user_ids);
        let partyID = random_choice(existing_party_ids);
        let response = random_choice(["Yes", "No"]);

        // INT, INT, INT, CHAR(11)
        return [new_rsvp_id, partyID, userID, response];
    }

    var new_rsvps = Array.from({length: NUM_RSVP}, () => getRandomRSVP());
    
    connection.query(`INSERT INTO RSVP VALUES ?`, [new_rsvps]);
    connection.end();
    console.log(`Randomly generated ${NUM_RSVP} random RSVPs.`);
}

async function create_following(NUM_FOLLOW_ENTRIES) {
    const mysql = require('mysql2/promise');

    // create the connection
    const connection = await mysql.createConnection({host:'localhost', user: 'root', password: PASSWORD, database: 'partyPlan'});

    // choose random users
    var [rows, fields] = await connection.query(`SELECT userID FROM User`);
    var existing_user_ids = [];
    rows.forEach(row => {
        existing_user_ids.push(row.userID);
    });

    // get existing following IDs
    [rows, fields] = await connection.query('SELECT Followingid FROM Following');
    var existing_follow_ids = [];
    rows.forEach(row => {
        existing_follow_ids.push(row.partyID);
    });

    var created_follow_id = [];

    const getRandomFollow = () => {
        while(true) {
            var new_follow_id = random_num(digits=6);
            if (!existing_follow_ids.includes(new_follow_id) && !created_follow_id.includes(new_follow_id))
                break;
        }
        created_follow_id.push(new_follow_id);
        let userID = random_choice(existing_user_ids);
        while(true) {
            var followsID = random_choice(existing_user_ids);
            if (followsID != userID)
                break;
        }

        // INT, INT, INT
        return [new_follow_id, userID, followsID];
    }

    var new_follows = Array.from({length: NUM_FOLLOW_ENTRIES}, () => getRandomFollow());
    
    connection.query(`INSERT INTO Following VALUES ?`, [new_follows]);
    connection.end();
    console.log(`Randomly generated ${NUM_FOLLOW_ENTRIES} random follow entries.`);
}

var con = mysql2.createConnection({host:'localhost', user: 'root', password: PASSWORD, database: 'partyPlan'});
con.connect();

var createUserQuery = "CREATE TABLE IF NOT EXISTS User (" +
    "userID INT UNSIGNED NOT NULL PRIMARY KEY," +
    "first VARCHAR(63) NOT NULL," + 
    "last VARCHAR(63) NOT NULL," +
    "email VARCHAR(63) NOT NULL," +
    "phone_number BIGINT UNSIGNED NOT NULL" +
");";

con.query(createUserQuery, (error, results) => {
    if(error)
        throw error;
    console.log('Created User Database');
});

var createActivePartyQuery = "CREATE TABLE IF NOT EXISTS ActiveParty (" +
    "partyID INT UNSIGNED NOT NULL PRIMARY KEY," +
    "userID INT UNSIGNED NOT NULL," +
    "latitude REAL NOT NULL," +
    "longitude REAL NOT NULL," +
    "tags JSON," +
    "capacity INT NOT NULL," +
    "start_time DATE NOT NULL," +
    "end_time DATE NOT NULL," +
    "FOREIGN KEY(userID) REFERENCES User(userID) ON DELETE CASCADE" +
");";

con.query(createActivePartyQuery, (error, results) => {
    if(error)
        throw error;
    console.log('Created ActiveParty Database');
});

var createArchivePartyQuery = "CREATE TABLE IF NOT EXISTS ArchiveParty (" +
    "partyID INT UNSIGNED NOT NULL PRIMARY KEY," +
    "userID INT UNSIGNED NOT NULL," +
    "latitude REAL NOT NULL," +
    "longitude REAL NOT NULL," +
    "tags JSON," +
    "capacity INT NOT NULL," +
    "start_time DATE NOT NULL," +
    "end_time DATE NOT NULL," +
    "FOREIGN KEY(userID) REFERENCES User(userID) ON DELETE CASCADE" +
");";

con.query(createArchivePartyQuery, (error, results) => {
    if(error)
        throw error;
    console.log('Created ArchiveParty Database');
});

var createFollowingQuery = "CREATE TABLE IF NOT EXISTS Following (" +
    "Followingid INT UNSIGNED NOT NULL PRIMARY KEY," +
    "userID INT UNSIGNED NOT NULL," +
    "followsID INT UNSIGNED NOT NULL," +
    "FOREIGN KEY(userID) REFERENCES User(userID) ON DELETE CASCADE," +
    "FOREIGN KEY(followsID) REFERENCES User(userID) ON DELETE CASCADE" +
");";

con.query(createFollowingQuery, (error, results) => {
    if(error)
        throw error;
    console.log('Created Following Database');
});

var createRSVPQuery = "CREATE TABLE IF NOT EXISTS RSVP (" +
    "RSVPid INT UNSIGNED NOT NULL PRIMARY KEY," +
    "partyID INT UNSIGNED NOT NULL," +
    "userID INT UNSIGNED NOT NULL," +
    "reponse CHAR(11)," +
    "FOREIGN KEY(userID) REFERENCES User(userID) ON DELETE CASCADE," +
    "FOREIGN KEY(partyID) REFERENCES ActiveParty(partyID) ON DELETE CASCADE" +
");";

con.query(createRSVPQuery, (error, results) => {
    if(error)
        throw error;
    console.log('Created RSVP Database');
});

con.end();

// create_users(NUM_USERS=1000);
// create_parties(NUM_PARTIES=3000, TARGET_DB="ActiveParty", latLng=[40.1099472,-88.2271369], range=0.1);
// create_parties(NUM_PARTIES=1000, TARGET_DB="ArchiveParty", latLng=[40.1099472,-88.2271369], range=0.1);
create_rsvp(NUM_RSVP=3000, NUM_PARTIES=20);
create_following(NUM_FOLLOW_ENTRIES=1000);
create_ratings(NUM_RATINGS=3000);

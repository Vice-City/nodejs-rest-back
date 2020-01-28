const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const mostSearchedFile = ('./mostSearched.json');


// make sure at least an empty memory file exists
router.all('*', function(req, res, next) {
    if (!fs.existsSync(mostSearchedFile)) {
        fs.writeFileSync(mostSearchedFile, JSON.stringify([]), 'utf8');
    }

    next();
});

router.get('/mostSearched', function(req, res, next) {
    if (req.query.limit < 0) {
        res.status(404).json({});
        return;
    }

    let existingData = JSON.parse(fs.readFileSync(mostSearchedFile), 'utf8');

    // if no limit specified, sort by number of followers
    if (req.query.limit === undefined) {
        existingData.sort((a, b) => {
            if (a.followers > b.followers) {
                return -1;
            } else if (a.followers < b.followers) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    // otherwise sort by times searched and cut off at the limit
    else {
        existingData.sort((a, b) => {
            if (a.searchedFor > b.searchedFor) {
                return -1;
            } else if (a.searchedFor < b.searchedFor) {
                return 1;
            } else {
                return 0;
            }
        });

        existingData = existingData.slice(0, req.query.limit);
    }

    res.status(200).json(existingData);
});

router.delete('/mostPopular', function(req, res, next) {
    let existingData = JSON.parse(fs.readFileSync(mostSearchedFile), 'utf8');

    existingData.forEach(u => {
        u.searchedFor = 0;
    });

    fs.writeFileSync(mostSearchedFile, JSON.stringify(existingData), 'utf8');
    res.status(200).json({successfullyResetCounters: existingData.length});
});



function createUser(bodyJson) {
    let allUsersJson = JSON.parse(fs.readFileSync(mostSearchedFile), 'utf8');

    let userJson = allUsersJson
        .filter(u => u.username === bodyJson.login);
    
    // retrieve current data if it exists; important for updating searched counter
    if (userJson[0] === undefined) {
        userJson = {};
    } else {
        userJson = userJson[0];
    }

    userJson.username = bodyJson.login;
    userJson.email = bodyJson.email;

    if (userJson.searchedFor === undefined) {
        userJson.searchedFor = 1;
    } else {
        userJson.searchedFor += 1;
    }

    userJson.followers = bodyJson.followers;
    userJson.followed = bodyJson.following;

    // find and update user if they already existed; otherwise create them
    let index = allUsersJson
        .findIndex(u => u.username === userJson.username);
    if (index === -1) {
        allUsersJson.push(userJson);
    } else {
        allUsersJson.splice(index, 1, userJson);
    }

    fs.writeFileSync(mostSearchedFile, JSON.stringify(allUsersJson), 'utf8');
    return userJson;
}

router.get('/:username', function(req, res, next) {
    const options = {
        hostname: 'api.github.com',
        path: `/users/${req.params.username}`,
        method: 'GET'
    };

    let body = '';
    
    const apiReq = https.request(options, apiRes => {        
        if (apiRes.statusCode != 200) {
            res.status(404).json({});
            return;
        }

        apiRes.on('data', (chunk) => {
            body += chunk;
        });

        apiRes.on('end', () => {
            let userTempJson = JSON.parse(body);
            let userJson = createUser(userTempJson);
            res.status(200).json(userJson);
        });

    });

    apiReq.setHeader('User-Agent', 'Github REST');
    apiReq.setHeader('Accept', 'application/vnd.github.v3+json')
    apiReq.end();
    
});



module.exports = router;
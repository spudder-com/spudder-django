module.exports = function (keys) {
    return {
        list: {
            get: function (req, res) {
                var Team = Parse.Object.extend("Team"),
                    query = new Parse.Query(Team),
                    teamID = req.params.id;

                query.get(teamID, {
                    success: function(team) {
                        var TeamOffer = Parse.Object.extend("TeamOffer"),
                            offerQuery = new Parse.Query(TeamOffer),
                            pastOffers = [], currentOffers = [],
                            currentDate = new Date(),
                            currentDateString = currentDate.getFullYear() + '-' +
                                ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' +
                                ('0' + currentDate.getDate()).slice(-2);


                        console.log("Current: " + currentDateString);

                        offerQuery.equalTo('team', team);

                        offerQuery.find().then(function (list) {
                            for (var i = 0; i < list.length; i++) {
                                var endDate = list[i].get('endDate');

                                var endDateSplitted = endDate.split('-'),
                                    year = endDateSplitted[0],
                                    month = endDateSplitted[1],
                                    day = endDateSplitted[2];

                                month = ('0' + month).slice(-2);
                                day = ('0' + day).slice(-2);
                                endDate = year + '-' + month + '-' + day;

                                if (endDate >= currentDateString) {
                                    currentOffers.push(list[i]);
                                } else {
                                    pastOffers.push(list[i]);
                                }
                            }

                            res.render('dashboard/teams/offers/list', {
                                'breadcrumbs' : ['Teams', team.get('name'), 'Offers'],
                                'team': team,
                                'count': list.length,
                                'currentOffers': currentOffers,
                                'pastOffers': pastOffers
                            });
                        });
                    },
                    error: function(object, error) {
                        console.log(error);
                        res.render('dashboard/teams/offers/list', {
                            'breadcrumbs' : ['Teams', 'Error'],
                            'list': []
                        });
                    }
                });
            }
        },

        create: {
            get: function (req, res) {
                var Team = Parse.Object.extend("Team"),
                    query = new Parse.Query(Team),
                    teamID = req.params.id;

                query.get(teamID, {
                    success: function(team) {
                        res.render('dashboard/teams/offers/create', {
                            'breadcrumbs' : ['Teams', team.get('name'), 'Offers', 'Create offer'],
                            'team': team,
                            'keys' : { 'jsKey' : keys.getJavaScriptKey(), 'appId' : keys.getApplicationID() }
                        });
                    },
                    error: function(object, error) {
                        console.log(error);
                        res.render('dashboard/teams/offers/list', {
                            'breadcrumbs' : ['Teams', 'Error'],
                            'list': []
                        });
                    }
                });
            },

            post: function (req, res) {
                var Team = Parse.Object.extend("Team"),
                    query = new Parse.Query(Team),
                    teamID = req.params.id;

                query.get(teamID, {
                    success: function(team) {
                        var TeamOffer = Parse.Object.extend('TeamOffer'),
                            teamOffer = new TeamOffer(),
                            endDateString = req.body['endDate'], // YYYY-MM-DD
                            images = [ req.body['offerImage1'], req.body['offerImage2'], req.body['offerImage3'] ],
                            offerImages = [];

                        for (var i = 0; i < images.length; i++) {
                            if (images[i]) offerImages.push(images[i]);
                        }

                        teamOffer.set('title', req.body['title']);
                        teamOffer.set('donation', req.body['donation']);
                        teamOffer.set('phone', req.body['phone']);
                        teamOffer.set('website', req.body['website']);
                        teamOffer.set('quantity', parseInt(req.body['quantity'], 10));
                        teamOffer.set('endDate', endDateString);
                        teamOffer.set('video', req.body['video']);
                        teamOffer.set('details', req.body['details']);
                        teamOffer.set('team', team);
                        teamOffer.set('images', offerImages);

                        teamOffer.save(null, {
                            success: function () {
                                res.redirect('/dashboard/teams/Th4D76dUdZ/offers');
                            },

                            error: function (team, error) {
                                console.log(error);
//                                res.redirect('/dashboard/teams/create?error' + encodeURIComponent(error));
                            }
                        });
                    },
                    error: function(object, error) {
                        console.log(error);
                        res.render('dashboard/teams/offers/list', {
                            'breadcrumbs' : ['Teams', 'Error'],
                            'list': []
                        });
                    }
                });
            }
        },

        remove: {
            get: function (req, res) {
                var TeamOffer = Parse.Object.extend("TeamOffer"),
                    query = new Parse.Query(TeamOffer),
                    offerId = req.params.offerID,
                    teamID = req.params.teamID;

                query.get(offerId).then(function (offer) {
                    offer.destroy().then(function () {
                        res.redirect('/dashboard/teams/' + teamID + '/offers');
                    });
                },
                function (error) {
                    console.log(error);
                    res.redirect('/dashboard/teams/' + teamID + '/offers');
                });
            }
        }
    }
};
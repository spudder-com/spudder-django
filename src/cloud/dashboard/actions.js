module.exports = function (keys) {
	var krowdio = require('cloud/krowdio'),
		pluralizer = require('cloud/pluralize'),
		utilities = require('cloud/utilities')();
	
	var addAdmins = function(entity, i, addAdminsPromise, adminsList, notFoundEmails) {
	                	if (i == adminsList.length) {
		                	addAdminsPromise.resolve();
	                	}
		            	new Parse.Query(Parse.User).equalTo('email', adminsList[i]).first().then(function(admin) {
		            		if (admin === null || admin === undefined) {
		            			console.log('notFound');
		            			notFoundEmails.push(adminsList[i]);
		            			addAdmins(entity, i + 1, addAdminsPromise, adminsList, notFoundEmails);
		            			return;
		            		}
		            		
		            		if (entity.get('adminsEmails') && entity.get('adminsEmails').indexOf(adminsList[i]) >= 0) {
		            			addAdmins(entity, i + 1, addAdminsPromise, adminsList, notFoundEmails);
		            			return;
		            		}
		            		
		                	entity.relation('admins').add(admin);
		                	entity.add('adminsEmails', admin.getEmail());
		                	entity.save(null).then(function(_entity) {
			                	
		                		addAdmins(_entity, i + 1, addAdminsPromise, adminsList, notFoundEmails);
		                	});
	                	});
		           };
	
    return {
        spuds: function (req, res) {
            var breadcrumbs = ['SPUDS'];
            res.render('dashboard/spuds', {
                'breadcrumbs' : breadcrumbs
            });
        },

        general: function (req, res) {
            var breadcrumbs = ['Fans', 'General'];
            res.render('dashboard/fan/general', {
                'breadcrumbs' : breadcrumbs,
                'displayUsers' : require('cloud/commons/displayUsers'),
                'modalTop' : require('cloud/dashboard/fan/modalTop'),
                'keys' : { 'jsKey' : keys.getJavaScriptKey(), 'appId' : keys.getApplicationID() }
            });
        },
        
        mySpuds: function(req, res) {
        	var breadcrumbs = ['Fans', 'My Spuds'];
        	res.render('dashboard/fan/mySpuds', {
                'breadcrumbs' : breadcrumbs,
                'modalTop' : require('cloud/dashboard/fan/modalTop'),
            });
        },
        
        myFavorites: function(req, res) {
        	var breadcrumbs = ['Fans', 'My Favorites'];
        	res.render('dashboard/fan/myFavorites', {
                'breadcrumbs' : breadcrumbs,
                'displayUsers' : require('cloud/commons/displayUsers'),
            });
        },
        
        basicInfo: function(req, res) {
        	var breadcrumbs = ['Fans', 'Basic Info'];
        	res.render('dashboard/fan/basicInfo', {
                'breadcrumbs' : breadcrumbs,
                'keys' : { 'jsKey' : keys.getJavaScriptKey(), 'appId' : keys.getApplicationID() }
            });
        },
        
        settings: function(req, res) {
        	var breadcrumbs = ['Fans', 'Settings'];
        	res.render('dashboard/fan/settings', {
                'breadcrumbs' : breadcrumbs,
            });
        },
        
        createEntity: {
        	get: function(req, res) {
        		var entityType = req.params.entityType;
        			breadcrumbs = [entityType, 'Create a ' + entityType.toLowerCase()],
                    keys = { 'jsKey' : keys.getJavaScriptKey(), 'appId' : keys.getApplicationID() };
        		res.render('dashboard/' + entityType.toLowerCase() + '/create', { 'breadcrumbs' : breadcrumbs, 'keys' : keys, 'errors' : [] });
        	},
        	
        	post: function(req, res) {
		        var entityType = req.params.entityType,
		        	user = Parse.User.current(),
		        	sport = req.body.sport,
		        	name = req.body.name,
		        	location = req.body.location,
		        	contact = req.body.contact,
		        	profile = req.body.profile,
		        	team = req.body.team,
		        	admins = utilities.removeSpaces(req.body.admins),
		        	isDisplayPublicly = 'hide-publicly' in req.body,
		        	profileImageThumb = req.body.profileImageThumb,
        			breadcrumbs = [entityType, 'Create a ' + entityType.toLowerCase()],
                    keys = { 'jsKey' : req.body.jsKey, 'appId' : req.body.appId };
	
		        var relationName,
			        relationType,
			        relationId,
			        relation;
	
				var context = { 'breadcrumbs' : breadcrumbs, 'keys' : keys },
					promise = new Parse.Promise(),
					adminsList = admins.split(',').filter(function(el) { return el.length != 0; });
				
		        new Parse.Query(entityType).equalTo('nameSearch', name.toLowerCase()).find()
		            .then(function(entities) {
		                if (entities.length > 0) {
		                	var error = 'A ' + entityType + ' with the name ' + name +
		                        ' already exists, please choose another name';
		                    return Parse.Promise.error(error);
		                }
		                var EntityClass = Parse.Object.extend(entityType);
		                var entity = new EntityClass();
		                entity.set('name', name);
		                entity.set('nameSearch', name.toLowerCase());
		                entity.set('location', location);
		                entity.set('contact', contact);
		                entity.set('profile', profile);
		                entity.set('sport', sport);
		                entity.set('profileImageThumb', profileImageThumb);
		                entity.set('isDisplayPublicly', isDisplayPublicly);
		                entity.set('team', team);
		                
		                if (entityType == 'Player') {
							entity.set('position', req.body.position);
							entity.set('number', req.body.number);
						}
		                
		                entity.relation('admins').add(Parse.User.current());
		                
		                // if (currentEntityCreateKey != null) {
		                    // relationName = currentEntityCreateKey.split('-')[0];
		                    // relationType = currentEntityCreateKey.split('-')[1];
		                    // relationId = currentEntityCreateKey.split('-')[2];
		                    // relation = adminCache[relationType][relationId];
		                    // if (!currentEntityCreateReverse)
		                        // entity.relation(relationName).add(relation);
		                    // currentEntityCreateKey = null;
		                // }
		                return entity.save(null);
		            })
		            .then(function(entity){
		                // if (currentEntityCreateReverse) {
		                    // relation.relation(relationName).add(entity);
		                    // relation.save(null);
		                    // currentEntityCreateReverse = false;
		                // }
		                krowdio.krowdioRegisterEntityAndSave(entity);
		                
		                promise.resolve(entity);
		            },
		            function(error){
		            	context['errors'] = [error];
		                res.render('dashboard/' + entityType.toLowerCase() + '/create', context);
		            });
		            
		            var i = 0,
		            	addAdminsPromise = new Parse.Promise(),
		            	notFoundEmails = [];
		            	
		            promise.then(function(entity) {
		            	if (adminsList.length > 0) {
			            	addAdmins(entity, i, addAdminsPromise, adminsList, notFoundEmails);
		            	} else {
		            		res.redirect('/dashboard/listEntities/' + entityType);
		            	}
		            	addAdminsPromise.then(function() {
		            		if (notFoundEmails.length > 0) {
		            			res.redirect('/dashboard/listEntities/' + entityType + '?error');
		            		} else {
				            	res.redirect('/dashboard/listEntities/' + entityType);
		            		}
		            	});
		            });
		        }
        },
        
        listEntities: function(req, res) {
        	var	entityType = req.params.entityType,
        		pluralized = pluralizer.pluralize(entityType, 2);

            Parse.User.current().fetch().then(function (user) {
                var EntityClass = Parse.Object.extend(entityType),
                    query = new Parse.Query(EntityClass);

                query.equalTo('admins', user);

                query.find().then(function (list) {
                    res.render('dashboard/' + entityType.toLowerCase() + '/list', {
                        'breadcrumbs' : [entityType, 'My ' + pluralized],
                        'list': list
                    });
                });
            });
        },
        
        editEntity: {
        	get: function(req, res) {
        		var entityType = req.params.entityType,
        			EntityClass = Parse.Object.extend(entityType),
                    query = new Parse.Query(EntityClass),
                    id = req.params.id,
            		entityName = entityType.toLowerCase();

                query.get(id, {
                    success: function(entity) {
                    	var context = {
                            'breadcrumbs' : [entityType, 'Edit this ' + entityName],
                            'found': true,
                            'entity' : entity,
                            'keys' : { 'jsKey' : keys.getJavaScriptKey(), 'appId' : keys.getApplicationID() }
                       	};
                        res.render('dashboard/' + entityName + '/edit', context);
                    },
                    error: function(object, error) {
                        console.log(error);
                        res.render('dashboard/' + entityName + '/edit', {
                            'breadcrumbs' : [entityType, 'Edit this ' + entityName],
                            'found': false
                        });
                    }
                });
        	},
        	
        	post: function(req, res) {
        		var name = req.body.name,
                    location = req.body.location,
                    details = req.body['contact-details'],
                    profile = req.body.profile,
                    id = req.params.id,
                    entityType = req.params.entityType,
                    team = req.body.team,
		        	admins = utilities.removeSpaces(req.body.admins),
		        	isDisplayPublicly = 'hide-publicly' in req.body;

                var EntityClass = Parse.Object.extend(entityType),
                    query = new Parse.Query(EntityClass),
                    promise = new Parse.Promise(),
                    adminsList = admins.split(',').filter(function(el) { return el.length != 0; });

                query.get(id, {
                    success: function(entity) {
                        entity.set('name', name);
                        entity.set('nameSearch', name.toLowerCase());
                        entity.set('location', req.body.location);
                        entity.set('contact', req.body.contact);
                        entity.set('profile', req.body.profile);
                        entity.set('sport', req.body.sport);
                        entity.set('profileImageThumb', req.body.profileImageThumb);
                        entity.set('website', req.body.website);
                        entity.set('email', req.body.email);
                        entity.set('facebook', req.body.facebook);
                        entity.set('twitter', req.body.twitter);
                        entity.set('googlePlus', req.body.googlePlus);
                        entity.set('isDisplayPublicly', isDisplayPublicly);
                        entity.set('team', team);

                        entity.save(null).then(function() {
	                        promise.resolve(entity);
                        });
                    },
                    error: function(object, error) {
                        console.log(error);
                        res.redirect('/dashboard/editEntity/' + entityType + '/' + id);
                    }
                });
                var i = 0,
	            	addAdminsPromise = new Parse.Promise(),
	            	notFoundEmails = [];
		            	
	            promise.then(function(entity) {
	            	if (adminsList.length > 0) {
		            	addAdmins(entity, i, addAdminsPromise, adminsList, notFoundEmails);
	            	} else {
	            		res.redirect('/dashboard/listEntities/' + entityType);
	            	}
	            	addAdminsPromise.then(function() {
	            		if (notFoundEmails.length > 0) {
	            			res.redirect('/dashboard/listEntities/' + entityType + '?error');
	            		} else {
			            	res.redirect('/dashboard/listEntities/' + entityType);
	            		}
	            	});
	            });
        	}
        },
        
        removeEntity: function(req, res) {
        	var id = req.params.id,
        		entityType = req.params.entityType,
        		EntityClass = Parse.Object.extend(entityType),
                query = new Parse.Query(EntityClass);

            query.get(id).then(function (entity) {
        		entity.destroy().then(function () {
                    res.redirect('/dashboard/listEntities/' + entityType);
				});
            });
        },
        
        removeAdmin: function(req, res) {
        	var adminEmail = req.body.adminEmail,
        		userId = req.params.id,
        		entityType = req.params.entityType,
        		EntityClass = Parse.Object.extend(entityType),
        		query = new Parse.Query(EntityClass),
        		promise = new Parse.Promise();

        	query.get(userId).then(function(entity) {
        		console.log(entity);
        		new Parse.Query(Parse.User).equalTo('email', adminEmail).first().then(function(user) {
	            	entity.relation('admins').remove(user);
	            	entity.remove('adminsEmails', adminEmail);
	            	return entity.save(null);
        		}).then(function() {
        			promise.resolve();
        		});
           	});
           	
           	promise.then(function(){
           		res.send('OK');
           	});
        	
        }
    };
};
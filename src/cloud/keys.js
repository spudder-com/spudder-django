module.exports = function (version) {
    var versions = {
            'spudmart': 0,
            'lukasz': 1,
            'karol': 2
        },
        applicationIds = ['RwjN7ubrqVZSXcwd2AWaQtov6Mgsi7hAXZ510xTR', 'QZjpmUJQEwBE6Wc0YfKEMRwv2C5Aeb4qQbopyIg9', 'YU4g6sCW8Dvl6khJsVYgXhr20Pu5zaaLcIQ4oRON'],
        javascriptKeys = ['zDk1PxddnEJwnLKxrnypGuM4pIq9Z7adAi4rprgH', 'UygLrj7cUKeLSxDWOd7Ch4bEyLfBxQglf2VkGc6Q', 'JRu7BtIEuRDl3QaYNRLguV4a1pFjES02wHfRP5Al'];

    return {
        getJavaScriptKey: function () {
            return javascriptKeys[versions[version]];
        },

        getApplicationID: function () {
            return applicationIds[versions[version]];
        }
    };
};
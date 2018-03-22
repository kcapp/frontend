var dns = require('dns');

module.exports = {
    reverse: (ip, callback) => {
        dns.reverse(ip, function (err, domains) {
            if (err != null) {
                return callback(err);
            }

            domains.forEach(function (domain) {
                dns.lookup(domain, function (err) {
                    if (err !== null) {
                        return callback(err);
                    }
                    callback(null, domain);
                });
            });
        });
    }
};

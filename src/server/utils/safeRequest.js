const fetch = require('node-fetch');
const config = require('../config');

class SafeRequest {
    constructor(url) {
        this.url = url;
        this.baseURL = config.baseURL;
    }
    /* fetch代理 */
    fetch(options) {
        let ydfetch = fetch(this.baseURL + this.url);
        if (options&&options.params) {
            ydfetch = fetch(this.baseURL + this.url, {
                method: options.method,
                body: options.body
            });
        }
        return new Promise((resolve, reject) => {
            let result = {
                code: 0,
                message: '',
                data: []
            };
            ydfetch
                .then(res => res.json())
                .then(json => {
                    result.data = json;
                    // console.log(result);
                    resolve(result);
                }).catch((error) => {
                    // console.log(error);
                    result.code = 1;
                    result.message = 'node-fetch和后端通讯异常';
                    reject(result);
                });
        });
    }
}

module.exports = SafeRequest;
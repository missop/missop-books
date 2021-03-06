const Koa = require('koa');
const app = new Koa();
const path = require('path')
const render = require('koa-swig');
const co = require('co');
const serve = require('koa-static');
import errorHandler from './middlewares/errorHandler';
const log4js = require('log4js');
const config = require('./config');
import {
    asClass,
    asValue,
    Lifetime,
    createContainer
} from 'awilix';
import {
    scopePerRequest,
    loadControllers
} from 'awilix-koa';

// 静态资源
app.use(serve(config.staticDir));
// 创造一个容器
const container = createContainer();
// 把所有serveice注入容器中去
container.loadModules(__dirname + '/services/*.js', {
    // 驼峰转化
    formatName: 'camelCase',
    registerOptions: {
        lifetime: Lifetime.SCOPED
    }
});
app.use(scopePerRequest(container));
// 注入路由机制
app.context.render = co.wrap(render({
    root: path.join(config.viewDir),
    autoescape: true,
    cache: config.cacheMode, // disable, set to false
    ext: 'html',
    varControls: ["[[", "]]"],
    writeBody: false
}));

// 日志配置
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'src/server/logs/yd.log' } },
    categories: { default: { appenders: ['cheese'], level: 'error' } }
});
const logger = log4js.getLogger('cheese');

// 容错
errorHandler.error(app, logger);

// 自动装载路由
app.use(loadControllers(__dirname + '/controllers/*.js'));

app.listen(config.port, () => {
    console.log(`服务已启动于${config.port}端口`);
});
const http = require('http');
const routes = require('./routes');
const { URL } = require('url');
const bodyParser = require('./helpers/bodyParser');

const server = http.createServer((request,response) => {

    const ParsedUrl = new URL(`http://localhost:3000${request.url}`);
    console.log(ParsedUrl);

    let { pathname } = ParsedUrl;
    let id = null;

    const splitEndpoint = pathname.split('/').filter(Boolean);
   
    if(splitEndpoint.length > 1) {
        pathname = `/${splitEndpoint[0]}/:id`;
        id = splitEndpoint[1];
    }

    const route = routes.find((routeObj) => (
        routeObj.endpoint === pathname && routeObj.method === request.method
    ));

    if(route){
        request.params = { id }; // Criou um objeto Params para o request
        request.query = Object.fromEntries(ParsedUrl.searchParams);

        response.send = (statusCode, body) => {
            response.writeHead(statusCode, {'Content-Type': 'application/json'});
            response.end(JSON.stringify( body )); 
        };

        if(['POST', 'PUT', 'PATH'].includes(request.method)){
            bodyParser(request, () => route.handler(request,response));
        }else{
            route.handler(request,response); 
        }

    } else{
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.end(`Cannot ${request.method} ${request.url}`);
    }

});

server.listen(3000, () => {
    console.log('🔥 Server started at http://localhost:3000 ');
})
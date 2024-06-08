export const rootHtmlTemplate = (host: string, protocol: string): string => `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    </head>
    <body>
    <h1>Hello!</h1>
    <p>Swagger Shoplist API: <a href="${protocol}://${host}/swagger">API</a></p>
<p>Visit my GitHub project: <a href="https://github.com/s0vit/shoplist-be">Shoplist</a></p>
</body>
</html>
    `;

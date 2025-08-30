const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { httpMethod, headers, body, queryStringParameters } = event;
  
  // Obtener el path desde los query parameters
  const path = queryStringParameters?.path || '';
  
  // URL del backend real con puerto 3000
  const backendUrl = `https://ingaguacate.site:3000/api/${path}`;
  
  // Headers permitidos
  const allowedHeaders = {
    'Content-Type': headers['content-type'] || 'application/json',
  };
  
  // Agregar Authorization si existe
  if (headers.authorization) {
    allowedHeaders['Authorization'] = headers.authorization;
  }
  
  try {
    console.log(`Proxying ${httpMethod} request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: httpMethod,
      headers: allowedHeaders,
      body: httpMethod !== 'GET' && httpMethod !== 'HEAD' ? body : undefined,
    });
    
    const data = await response.text();
    let parsedData;
    
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = data;
    }
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData),
    };
  } catch (error) {
    console.error('Error en proxy:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor', 
        details: error.message,
        targetUrl: backendUrl 
      }),
    };
  }
};

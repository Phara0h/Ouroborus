# Ouroborus

## Install

`npm install ouroborus`

## Example

```javascript
const Ouroborus = require('ouroborus')();


Ouroborus.route.get('/', (req, res) => {
  res.end('Hello World')
})

Ouroborus.route.get('/:name', (req, res, params) => {
  res.end('Hello '+params.name);
})

Ouroborus.listen(3000, (socket) => {
  if (socket) {
    console.log('HTTP server ready!')
  }
})

```

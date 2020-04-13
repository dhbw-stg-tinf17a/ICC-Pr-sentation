# This is Gunter's frontend.
To get started simply run ```npm install```.

If you want to use the frontend locally use ```npm run serve```. This will start a local development server on port 3001. The backend is expected to run locally on port 3000.  

Run unit tests with ```npm run test```. This will run an extensive test suite containing many test cases that ensure the correctness of key functionality but also snapshot tests to ensure proper layout and rendering.

Run ```npm run lint``` to check all of the code for proper formatting.

With ```npm run build``` you can build the frontend for production. The compiled files will be in the *dist* folder and can be hosted by any static web server.

## Remarks
Additionally, to the dialog, most use cases show you a route or a location on an embedded map. The frontend in this repository contains only a static map that always displays the same route as a demo. To display the real route according to the use case, an API key would be needed. 

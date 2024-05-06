import createrRoutes from './level.js';

function configRoutes(app){
    app.use('/levels', createrRoutes);
}

export default configRoutes;
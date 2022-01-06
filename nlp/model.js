const natural = require('natural')
// create a BayesClassifier
const Categroy = new natural.BayesClassifier();
// supply a training set of data for two membership: night and day
Categroy.addDocument('How can you find an integer coefficient polynomial knowing its values only at a few points (but requiring the coefficients be small)?', 'Education');
Categroy.addDocument('What impact would a surge of U.S. troops in Afghanistan have on the state of the American military after eight years of continuous war?', ["Politics", "Society"]);
Categroy.addDocument('What does, "Some people do the same by their religion," mean?', ['Relgion','Society']);
Categroy.addDocument('Should media outlets be punished for false information?', ['Society','Politics']);
// Categroy.addDocument('Should the media show graphic violence? Why or why not?', ['News','Society','Politics']);
Categroy.addDocument('democracy', 'Politics');
Categroy.addDocument('media', 'Society');
Categroy.addDocument('show graphic violence', 'News');
// training
Categroy.train();

module.exports = Categroy
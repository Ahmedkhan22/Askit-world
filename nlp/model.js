const natural = require('natural')
// create a BayesClassifier
const Categroy = new natural.BayesClassifier();
// supply a training set of data for two membership: night and day
Categroy.addDocument('How can you find an integer coefficient polynomial knowing its values only at a few points (but requiring the coefficients be small)?', 'Education');
Categroy.addDocument('What impact would a surge of U.S. troops in Afghanistan have on the state of the American military after eight years of continuous war?', ["Politics", "Society"]);
Categroy.addDocument('What does, "Some people do the same by their religion," mean?', ['Relgion','Society']);
Categroy.addDocument('Sun is in the sky', 'day');
Categroy.addDocument('It is bright', 'day');
Categroy.addDocument('black lives', 'racixam');
// training
Categroy.train();

module.exports = Categroy
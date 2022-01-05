const natural=require('natural')
// create a BayesClassifier
const Categroy = new natural.BayesClassifier();
// supply a training set of data for two membership: night and day
Categroy.addDocument('I see starts', 'night');
Categroy.addDocument('Moon is in the sky', 'night');
Categroy.addDocument('It is dark', 'night');
Categroy.addDocument('Sun is in the sky', 'day');
Categroy.addDocument('It is bright', 'day');
Categroy.addDocument('black lives', 'racixam');
// training
Categroy.train();

module.exports=Categroy
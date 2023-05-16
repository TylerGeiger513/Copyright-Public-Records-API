// import search automation and performSearch
const { performSearch } = require('./src/search-automation.js');
const { SearchBuilder } = require('./src/search-builder.js'); 


const url = new SearchBuilder({
    params: {
        'subquery': [
            {
                'queryTerm': "ASTM",
                'fieldHeading': 'Claimants',
            },
            {
                'queryTerm': "Metals",
                'fieldHeading': 'Title',
            }
        ],
        'type_of_work': 'registration',
        'registration_class': 'TX'
    }, 
    args: {
        ['--override']: ['subquery', 'type_of_work']
    }
})

performSearch(url.buildUrl()).then((results) => {
    console.log(results);
})
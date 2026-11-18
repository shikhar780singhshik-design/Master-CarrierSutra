/**
 * core/data-lists.js
 * Study data: subjects, backup quiz questions and career ideas.
 */
"use strict";

// The five school subjects the app tracks.
const SUBJ = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'];

// Backup quiz questions, used when the AI cannot write new ones.
const BANK = { Mathematics: [['What is 15% of 200?', ['20', '30', '25', '35'], 1], ['Solve 2x + 6 = 14.', ['x = 3', 'x = 4', 'x = 5', 'x = 10'], 1], ['Square root of 144?', ['10', '11', '12', '14'], 2]], Science: [['Which gas do plants absorb for photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2], ['SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1], ['Powerhouse of the cell?', ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], 2]], English: [['Which word is a noun in "The cat sleeps"?', ['The', 'cat', 'sleeps', 'None'], 1], ['Past tense of "go"?', ['goed', 'gone', 'went', 'going'], 2], ['Which is a conjunction?', ['But', 'Quickly', 'Blue', 'Run'], 0]], 'Social Science': [['First Prime Minister of India?', ['Nehru', 'Gandhi', 'Patel', 'Bose'], 0], ['Longest river in India?', ['Yamuna', 'Godavari', 'Ganga', 'Indus'], 2], ['India became a republic in?', ['1947', '1950', '1952', '1935'], 1]], Hindi: [['"सूर्य" का पर्यायवाची?', ['चंद्र', 'रवि', 'जल', 'वायु'], 1], ['संज्ञा का उदाहरण?', ['दौड़ना', 'सुंदर', 'किताब', 'धीरे'], 2], ['"दिन" का विलोम?', ['रात', 'सुबह', 'शाम', 'दोपहर'], 0]] };

// Possible career directions for each subject (used by the portfolio).
const CAREERS = { Mathematics: ['Engineering (Science with maths)', 'Data and computing', 'Finance, CA, statistics'], Science: ['Medicine (Science with biology)', 'Research and biotech', 'Environmental science'], English: ['Law and journalism', 'Writing and communication', 'Civil services'], 'Social Science': ['Civil services', 'Economics and public policy', 'History and teaching'], Hindi: ['Literature and media', 'Teaching', 'Public administration'] };

// Each row lists the prompt, correct answer, then three distractors.
const EXTRA_QUIZ_QUESTIONS = {
    Science: [
        ['Which organ pumps blood?', 'Heart', 'Lung', 'Brain', 'Stomach'],
        ['Which planet is closest to the Sun?', 'Mercury', 'Venus', 'Earth', 'Mars'],
        ['What is the SI unit of energy?', 'Joule', 'Watt', 'Newton', 'Pascal'],
        ['Which blood cells carry most oxygen?', 'Red blood cells', 'White blood cells', 'Platelets', 'Nerve cells'],
        ['Which process changes a liquid to a solid?', 'Freezing', 'Melting', 'Boiling', 'Evaporation'],
        ['Which gas is most abundant in dry air?', 'Nitrogen', 'Oxygen', 'Hydrogen', 'Helium'],
        ['What is the pH of a neutral solution at 25°C?', '7', '0', '5', '14'],
        ['Which organ filters waste from blood to make urine?', 'Kidney', 'Heart', 'Lung', 'Pancreas'],
        ['Which part of a plant usually absorbs water?', 'Roots', 'Flowers', 'Leaves', 'Fruit'],
        ['What is the SI unit of electric current?', 'Ampere', 'Volt', 'Ohm', 'Watt'],
        ['Which force pulls objects toward Earth?', 'Gravity', 'Friction', 'Buoyancy', 'Tension'],
        ['Which material is usually a good electrical conductor?', 'Copper', 'Rubber', 'Dry wood', 'Glass'],
        ['Which nutrient is starch?', 'Carbohydrate', 'Protein', 'Vitamin', 'Mineral'],
        ['How many chambers does a human heart have?', 'Four', 'One', 'Two', 'Three'],
        ['Which instrument measures temperature?', 'Thermometer', 'Barometer', 'Ammeter', 'Compass'],
        ['Which state of matter has no fixed shape or volume?', 'Gas', 'Solid', 'Liquid', 'Ice'],
        ['What is the chemical symbol for iron?', 'Fe', 'Ir', 'I', 'In'],
    ],
    English: [
        ['Which word is an adjective in “the tall tree”?', 'tall', 'the', 'tree', 'none'],
        ['What is the plural of “child”?', 'children', 'childs', 'childes', 'child'],
        ['Which is the opposite of “ancient”?', 'modern', 'old', 'historic', 'former'],
        ['Which is a synonym of “quick”?', 'fast', 'slow', 'quiet', 'late'],
        ['Complete the sentence “She ___ a book yesterday.”', 'read', 'reading', 'reads', 'will read'],
        ['Which word is a pronoun?', 'they', 'table', 'jump', 'blue'],
        ['Which punctuation ends a direct question?', 'Question mark', 'Comma', 'Colon', 'Apostrophe'],
        ['What is the comparative form of “good”?', 'better', 'best', 'gooder', 'well'],
        ['Which word is a preposition in “The bag is under the chair”?', 'under', 'bag', 'chair', 'is'],
        ['Which is the past tense of “write”?', 'wrote', 'writes', 'written', 'writing'],
        ['Which word means “not possible”?', 'impossible', 'impatient', 'imperfect', 'impolite'],
        ['Which is a proper noun?', 'India', 'country', 'river', 'city'],
        ['Complete the phrase “___ honest person”.', 'an', 'a', 'some', 'many'],
        ['Which word is an adverb in “He ran quickly”?', 'quickly', 'ran', 'he', 'none'],
        ['Which is an example of a simile?', 'As bright as the sun', 'The sun rose', 'The bright sun', 'The sun sets'],
        ['What is the past participle of “eat”?', 'eaten', 'ate', 'eats', 'eating'],
        ['Which conjunction shows contrast?', 'but', 'and', 'because', 'so'],
    ],
    'Social Science': [
        ['Which imaginary line divides Earth into northern and southern hemispheres?', 'Equator', 'Prime Meridian', 'Tropic of Cancer', 'Arctic Circle'],
        ['Which continent contains the Sahara Desert?', 'Africa', 'Asia', 'Europe', 'South America'],
        ['Which ocean lies south of India?', 'Indian Ocean', 'Arctic Ocean', 'Atlantic Ocean', 'Pacific Ocean'],
        ['What does a map scale show?', 'Map distance compared with ground distance', 'Direction of north', 'Height of clouds', 'Population density'],
        ['Which is a renewable energy source?', 'Sunlight', 'Coal', 'Petroleum', 'Natural gas'],
        ['Which economic sector includes farming?', 'Primary', 'Secondary', 'Tertiary', 'Quaternary'],
        ['Which Indian state has Jaipur as its capital?', 'Rajasthan', 'Gujarat', 'Punjab', 'Bihar'],
        ['Which instrument helps locate north?', 'Compass', 'Thermometer', 'Balance', 'Stopwatch'],
        ['Which level of local government typically serves a village in India?', 'Gram Panchayat', 'Municipal Corporation', 'Rajya Sabha', 'Lok Sabha'],
        ['In which year did India gain independence?', '1947', '1942', '1950', '1962'],
        ['Which movement began with the Dandi March?', 'Civil Disobedience Movement', 'Quit India Movement', 'Swadeshi Movement', 'Non-Cooperation Movement'],
        ['What is the upper house of India’s Parliament?', 'Rajya Sabha', 'Lok Sabha', 'Vidhan Sabha', 'Gram Sabha'],
        ['Which Indian city was formerly called Bombay?', 'Mumbai', 'Kolkata', 'Chennai', 'Pune'],
        ['Which latitude is at 0°?', 'Equator', 'Tropic of Capricorn', 'Arctic Circle', 'Antarctic Circle'],
        ['What is the long-term pattern of weather in a place called?', 'Climate', 'Humidity', 'Rainfall', 'Forecast'],
        ['Which sector turns raw materials into finished goods?', 'Secondary', 'Primary', 'Tertiary', 'Quaternary'],
        ['Which direction is opposite to northeast?', 'Southwest', 'Northwest', 'Southeast', 'East'],
    ],
    Hindi: [
        ['“जल” का पर्यायवाची कौन-सा है?', 'पानी', 'आग', 'हवा', 'मिट्टी'],
        ['“सुख” का विलोम क्या है?', 'दुःख', 'आनंद', 'प्रसन्नता', 'हर्ष'],
        ['“लड़का” का स्त्रीलिंग क्या है?', 'लड़की', 'बालक', 'लड़के', 'लड़कों'],
        ['“पुस्तक” का बहुवचन क्या है?', 'पुस्तकें', 'पुस्तक', 'पुस्तकी', 'पुस्तका'],
        ['“मैं स्कूल जाता हूँ” में सर्वनाम कौन-सा है?', 'मैं', 'स्कूल', 'जाता', 'कोई नहीं'],
        ['“मीठा फल” में विशेषण कौन-सा है?', 'मीठा', 'फल', 'दोनों', 'कोई नहीं'],
        ['“सीमा पढ़ती है” में मुख्य क्रिया कौन-सी है?', 'पढ़ती', 'सीमा', 'है', 'कोई नहीं'],
        ['“आकाश” का पर्यायवाची क्या है?', 'गगन', 'सागर', 'पर्वत', 'धरती'],
        ['“आशा” का विलोम कौन-सा है?', 'निराशा', 'इच्छा', 'उम्मीद', 'विश्वास'],
        ['“वह कल आएगा” किस काल का वाक्य है?', 'भविष्यत्', 'भूत', 'वर्तमान', 'कोई नहीं'],
        ['“मैंने खाना खाया” किस काल का वाक्य है?', 'भूत', 'वर्तमान', 'भविष्यत्', 'कोई नहीं'],
        ['“कमल” का बहुवचन किस वाक्य में है?', 'तालाब में कई कमल खिले हैं।', 'यह एक कमल है।', 'एक कमल खिल गया।', 'उस कमल का रंग गुलाबी है।'],
        ['“धरती” का पर्यायवाची क्या है?', 'पृथ्वी', 'आकाश', 'प्रकाश', 'सूर्य'],
        ['“कठिन” का विलोम क्या है?', 'सरल', 'मजबूत', 'भारी', 'सख्त'],
        ['“नाक में दम करना” का अर्थ क्या है?', 'बहुत परेशान करना', 'सो जाना', 'खुश करना', 'धीरे बोलना'],
        ['“कौन आया?” में कौन-सा विराम चिह्न है?', 'प्रश्नवाचक चिह्न', 'अल्पविराम', 'पूर्णविराम', 'विस्मयादिबोधक चिह्न'],
        ['“घोड़ा” का स्त्रीलिंग क्या है?', 'घोड़ी', 'घोड़े', 'घोड़ों', 'घोड़ा'],
    ],
};

function extraQuizQuestions(subject) {
    return EXTRA_QUIZ_QUESTIONS[subject].map(([question, answer, ...distractors]) => {
        const options = shuffleQuizItems([answer, ...distractors]);
        return [question, options, options.indexOf(answer)];
    });
}
